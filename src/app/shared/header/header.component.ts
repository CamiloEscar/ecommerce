import { afterNextRender, Component, ElementRef, HostListener, OnInit, ViewChild, afterRender } from '@angular/core';
import { HomeService } from '../../pages/home/service/home.service';
import { FormsModule } from '@angular/forms';
import { Router , RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { CartService } from '../../pages/home/service/cart.service';
import { ToastrService } from 'ngx-toastr';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
@ViewChild('currencyToggle') currencyToggleRef!: ElementRef;
@ViewChild('currencyList') currencyListRef!: ElementRef;

@HostListener('document:click', ['$event'])
onClickOutside(event: MouseEvent): void {
  const toggleEl = this.currencyToggleRef?.nativeElement;
  const listEl = this.currencyListRef?.nativeElement;

  if (toggleEl && toggleEl.contains(event.target)) {
    listEl?.classList.toggle('tp-currency-list-open');
  } else {
    listEl?.classList.remove('tp-currency-list-open');
  }
}

  categories_menus: any = [];
  currency:string = 'ARS';

  user:any;
  listCarts: any = [];
  totalCarts:number = 0;
  imagen_previsualizacion: string = ''

  //TODO: AGREGAR LISTA DE FAVORITOS SIMILAR A LISTCARTS

  isLoading:boolean = false;

  searchT: string = '';
  constructor(public homeService: HomeService,
              public cookieService: CookieService,
              public cartService: CartService,
              private toastr: ToastrService,
              private cdr: ChangeDetectorRef,
              private router: Router
  ) {
    afterNextRender(() => {
      this.homeService.menus().subscribe((resp: any) => {
        // //console.log(resp);
        this.categories_menus = resp.categories_menus;
      });
      this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'ARS';
      this.user = this.cartService.authService.user;
      setTimeout(() => {
        // this.isLoading = true;
        this.cdr.detectChanges();
      }, 50);
      if(this.user){
        this.cartService.listCart().subscribe((resp:any) => {
          // console.log(resp)
          resp.carts.data.forEach((cart:any) => {
            this.cartService.changeCart(cart)
          });
        })
      }
    });
    afterRender(() => {
      setTimeout(() => {
        this.isLoading = true;

      }, 50);
    })
  }


  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

    this.cartService.currentDataCart$.subscribe((resp:any)=> {
      // console.log(resp)
      this.listCarts = resp;
      this.totalCarts = this.listCarts.reduce((sum:number, item:any) => sum + item.total, 0 )  //el controlador esta escuchando todo el tiempo, asi que cuando se elimine el controlador actualiza
    })
  }

  logout(){
    this.cartService.authService.logout();
    setTimeout(() => {
      window.location.reload();
    }, 50);
  }
  deleteCart(CART:any){
    this.cartService.deleteCart(CART.id).subscribe((resp:any)=> {  //lo eliminamos del front
      this.toastr.info('Eliminacion', "Se elimino el producto: "+CART.product.title + " del carrito de compra");
      this.cartService.removeCart(CART);                     //lo eliminamos del backend
    })
  }
  getIconMenu(MENU_CAT:any){
    var miDiv: any = document.getElementById('icon-' + MENU_CAT.id);
    miDiv.innerHTML = MENU_CAT.icon;
    return '';
  }

  changeCurrency(val: string){
      if(this.user){
        this.cartService.deleteCartsAll().subscribe((resp:any) => {
          this.cookieService.set("currency", val);
          window.location.reload();
        })
      }else {
        this.cookieService.set("currency", val);
        setTimeout(() => {

          window.location.reload();
        }, 25);
      }
  }

  searchProduct(){
    window.location.href = '/productos-busqueda?search=' + this.searchT;
  }

  buscarPorCategoria(nombreCategoria: string) {
  this.router.navigate(['/productos-busqueda'], {
    queryParams: { search: nombreCategoria }
  });
}
getUserAvatar(): string | null {
  return this.user?.avatar
    || this.user?.photo_url
    || this.imagen_previsualizacion
    || null;
}
goToCart(){
  this.cartService.listCart().subscribe({
    next: (resp:any) => {

      // 🔥 limpiar carrito actual
      this.cartService.clearCart();

      // 🔥 volver a cargar desde backend
      resp.carts.data.forEach((cart:any) => {
        this.cartService.changeCart(cart);
      });

      // 👉 ahora sí navegamos
      this.router.navigate(['/carrito-de-compra']);
    },
    error: () => {
      this.router.navigate(['/carrito-de-compra']);
    }
  });
}
buscarPorCategorias(name: string) {
  this.router.navigate(['/productos-busqueda'], {
    queryParams: { search: name }
  });
}

}
