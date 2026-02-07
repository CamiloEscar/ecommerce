import { afterNextRender, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { HomeService } from '../../pages/home/service/home.service';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { CartService } from '../../pages/home/service/cart.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
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
  currency: string = 'ARS';
  user: any;
  listCarts: any = [];
  totalCarts: number = 0;
  outOfStockCount: number = 0;
  imagen_previsualizacion: string = '';
  isLoading: boolean = true;
  searchT: string = '';

  constructor(
    public homeService: HomeService,
    public cookieService: CookieService,
    public cartService: CartService,
    private toastr: ToastrService,
    private router: Router
  ) {
    afterNextRender(() => {
      this.homeService.menus().subscribe((resp: any) => {
        this.categories_menus = resp.categories_menus;
      });

      this.currency = this.cookieService.get("currency") || 'ARS';
      this.user = this.cartService.authService.user;

      // Solo al cargar la página, refrescar desde backend Y validar stock
      if (this.user) {
        this.refreshCartWithStockValidation();
      }
    });
  }

  ngOnInit(): void {
    // Simplemente recibir los datos del servicio TAL CUAL VIENEN
    this.cartService.currentDataCart$.subscribe((resp: any) => {
      this.listCarts = resp;
      this.calculateTotals();
    });
  }

  private calculateTotals(): void {
    // Solo sumar - NO modificar ni calcular stock
    this.totalCarts = this.listCarts
      .filter((item: any) => item.stock_suficiente !== false)
      .reduce((sum: number, item: any) => sum + (item.total || 0), 0);

    this.outOfStockCount = this.listCarts
      .filter((item: any) => item.stock_suficiente === false).length;
  }

  // NUEVO: Método que solo se ejecuta al recargar la página
  private refreshCartWithStockValidation(): void {
    if (!this.user) return;

    this.cartService.listCart().subscribe({
      next: (resp: any) => {
        this.cartService.resetCart();

        // Cargar cada item del carrito
        resp.carts.data.forEach((cart: any) => {
          this.cartService.changeCart(cart);
        });

        // SOLO al recargar página, validar stock
        this.cartService.validateStock().subscribe({
          next: (stockResp: any) => {
            if (stockResp && stockResp.carts) {
              const updatedCarts = stockResp.carts.data || stockResp.carts;
              let listCart = [...this.cartService.cart.getValue()];

              updatedCarts.forEach((backendCart: any) => {
                const index = listCart.findIndex((item: any) => item.id === backendCart.id);
                if (index !== -1) {
                  listCart[index] = {
                    ...listCart[index],
                    stock_suficiente: backendCart.stock_suficiente,
                    stock_disponible: backendCart.stock_disponible
                  };
                }
              });

              this.cartService.cart.next(listCart);
            }
          },
          error: (err) => {
            console.error('Error al validar stock:', err);
          }
        });
      },
      error: (err) => {
        console.error('Error al refrescar carrito:', err);
      }
    });
  }

  logout(): void {
    this.cartService.authService.logout();
    setTimeout(() => {
      window.location.reload();
    }, 50);
  }

  deleteCart(CART: any): void {
    this.cartService.deleteCart(CART.id).subscribe((resp: any) => {
      this.toastr.info('Eliminación', `Se eliminó el producto: ${CART.product.title} del carrito de compra`);
      this.cartService.removeCart(CART);
    });
  }

  getIconMenu(MENU_CAT: any): string {
    const miDiv: any = document.getElementById('icon-' + MENU_CAT.id);
    if (miDiv) {
      miDiv.innerHTML = MENU_CAT.icon;
    }
    return '';
  }

  changeCurrency(val: string): void {
    if (this.user) {
      this.cartService.deleteCartsAll().subscribe(() => {
        this.cookieService.set("currency", val);
        window.location.reload();
      });
    } else {
      this.cookieService.set("currency", val);
      setTimeout(() => {
        window.location.reload();
      }, 25);
    }
  }

  searchProduct(): void {
    this.router.navigate(['/productos-busqueda'], {
      queryParams: { search: this.searchT }
    });
  }

  buscarPorCategoria(nombreCategoria: string): void {
    this.router.navigate(['/productos-busqueda'], {
      queryParams: { search: nombreCategoria }
    });
  }

  getUserAvatar(): string | null {
    return this.user?.avatar || this.user?.photo_url || this.imagen_previsualizacion || null;
  }

  goToCart(): void {
    // NO validar stock aquí, solo navegar
    this.router.navigate(['/carrito-de-compra']);
  }

  buscarPorCategorias(name: string): void {
    this.router.navigate(['/productos-busqueda'], {
      queryParams: { search: name }
    });
  }
}
