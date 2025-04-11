import { afterNextRender, Component } from '@angular/core';
import { HomeService } from '../../pages/home/service/home.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { CartService } from '../../pages/home/service/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {

  categories_menus: any = [];
  currency:string = 'ARS';

  user:any;
  listCarts: any = [];
  totalCarts:number = 0;

  constructor(public homeService: HomeService,
              public cookieService: CookieService,
              public cartService: CartService,
  ) {
    afterNextRender(() => {
      this.homeService.menus().subscribe((resp: any) => {
        console.log(resp);
        this.categories_menus = resp.categories_menus;
      });
      this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'ARS';
      this.user = this.cartService.authService.user;

      if(this.user){
        this.cartService.listCart().subscribe((resp:any) => {
          console.log(resp)
          resp.carts.data.forEach((cart:any) => {
            this.cartService.changeCart(cart)
          });
        })
      }
    });
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

    this.cartService.currentDataCart$.subscribe((resp:any)=> {
      console.log(resp)
      this.listCarts = resp;
      this.totalCarts = this.listCarts.reduce((sum:number, item:any) => sum + item.total, 0 )
    })

  }
  getIconMenu(MENU_CAT:any){
    var miDiv: any = document.getElementById('icon-' + MENU_CAT.id);
    miDiv.innerHTML = MENU_CAT.icon;
    return '';
  }

  changeCurrency(val: string){
    this.cookieService.set("currency", val);

    setTimeout(() => {
      window.location.reload();
    }, 50);
  }
}
