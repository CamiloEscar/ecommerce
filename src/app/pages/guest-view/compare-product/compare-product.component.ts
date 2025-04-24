import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ModalProductComponent } from '../component/modal-product/modal-product.component';
import { CookieService } from 'ngx-cookie-service';
import { CartService } from '../../home/service/cart.service';
import { ToastrService } from 'ngx-toastr';


declare var $: any;
@Component({
  selector: 'app-compare-product',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, ModalProductComponent],
  templateUrl: './compare-product.component.html',
  styleUrl: './compare-product.component.css'
})
export class CompareProductComponent {

  PRODUCTS:any = [];

  currency: string = 'ARS';

  DISCOUNT_FLASH: any;
  DISCOUNT_FLASH_PRODUCT: any = [];

  product_selected: any = null;

  variation_selected: any = null;

  constructor(
    public cookieService: CookieService,
    public cartService: CartService,
    public toastr: ToastrService,
    public router: Router,
    private cdr: ChangeDetectorRef,
  ) {}


  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.


    this.PRODUCTS = localStorage.getItem('compares') ? JSON.parse(localStorage.getItem('compares') ?? "") : [];

    this.currency = this.cookieService.get('currency') ? this.cookieService.get('currency') : 'ARS';
  }

  getNewTotal(DISCOUNT_FLASH_PRODUCT: any, DISCOUNT_FLASH_P: any): number {
    // Add null checks
    if (!DISCOUNT_FLASH_PRODUCT || !DISCOUNT_FLASH_P) {
      return 0;
    }

    let result: number;

    if (this.currency == 'ARS') {
      if (!DISCOUNT_FLASH_PRODUCT.price_ars) {
        return 0;
      }

      if (DISCOUNT_FLASH_P.type_discount == 1) { //% de descuento
        result = DISCOUNT_FLASH_PRODUCT.price_ars - (DISCOUNT_FLASH_PRODUCT.price_ars * (DISCOUNT_FLASH_P.discount * 0.01));
      } else { //monto fijo /-pesos -dolares
        result = DISCOUNT_FLASH_PRODUCT.price_ars - DISCOUNT_FLASH_P.discount;
      }
    } else {
      if (!DISCOUNT_FLASH_PRODUCT.price_usd) {
        return 0;
      }

      if (DISCOUNT_FLASH_P.type_discount == 1) { //% de descuento
        result = DISCOUNT_FLASH_PRODUCT.price_usd - (DISCOUNT_FLASH_PRODUCT.price_usd * (DISCOUNT_FLASH_P.discount * 0.01));
      } else { //monto fijo /-pesos -dolares
        result = DISCOUNT_FLASH_PRODUCT.price_usd - DISCOUNT_FLASH_P.discount;
      }
    }

    // Always return a number with 2 decimal places
    return parseFloat(result.toFixed(2));
  }

  getTotalPriceProduct(DISCOUNT_FLASH_PRODUCT: any): number {
    // Add null checks
    if (!DISCOUNT_FLASH_PRODUCT) {
      return 0;
    }

    let result: number;

    // primero chequeamos que hay un descuento en el producto
    if (DISCOUNT_FLASH_PRODUCT.discount_g) {
      result = this.getNewTotal(DISCOUNT_FLASH_PRODUCT, DISCOUNT_FLASH_PRODUCT.discount_g);
    }
    // luego chequeamos si tiene el descuento flash
    else if (this.DISCOUNT_FLASH && this.DISCOUNT_FLASH_PRODUCT &&
             this.DISCOUNT_FLASH_PRODUCT.includes &&
             this.DISCOUNT_FLASH_PRODUCT.includes(DISCOUNT_FLASH_PRODUCT)) {
      result = this.getNewTotal(DISCOUNT_FLASH_PRODUCT, this.DISCOUNT_FLASH);
    }
    // precio comun
    else {
      if (this.currency == "ARS") {
        if (!DISCOUNT_FLASH_PRODUCT.price_ars) {
          return 0;
        }
        result = parseFloat(DISCOUNT_FLASH_PRODUCT.price_ars.toFixed(2));
      } else {
        if (!DISCOUNT_FLASH_PRODUCT.price_usd) {
          return 0;
        }
        result = parseFloat(DISCOUNT_FLASH_PRODUCT.price_usd.toFixed(2));
      }
    }

    return result;
  }

  getTotalCurrency(DISCOUNT_FLASH_PRODUCT: any): number {
    // Add null checks
    if (!DISCOUNT_FLASH_PRODUCT) {
      return 0;
    }

    let price: number;

    if (this.currency == 'ARS') {
      if (!DISCOUNT_FLASH_PRODUCT.price_ars) {
        return 0;
      }
      price = DISCOUNT_FLASH_PRODUCT.price_ars;
    } else {
      if (!DISCOUNT_FLASH_PRODUCT.price_usd) {
        return 0;
      }
      price = DISCOUNT_FLASH_PRODUCT.price_usd;
    }

    // Always return a number with 2 decimal places
    return parseFloat(price.toFixed(2));
  }

  addCart(PRODUCT: any): void {
    if (!this.cartService.authService.user) {
      this.toastr.error('Error', 'Ingrese a la tienda');
      this.router.navigateByUrl("/login");
      return;
    }

    if (PRODUCT.variations && PRODUCT.variations.length > 0) {
      $("#producQuickViewModal").modal("show");
      this.openDetailProduct(PRODUCT);
      return;
    }

    let discount_g = null;

    if (PRODUCT.discount_g) {
      discount_g = PRODUCT.discount_g;
    }

    let data = {
      product_id: PRODUCT.id,
      type_discount: discount_g ? discount_g.type_discount : null,
      discount: discount_g ? discount_g.discount : null,
      type_campaing: discount_g ? discount_g.type_campaing : null,
      code_cupon: null,
      code_discount: discount_g ? discount_g.code : null,
      product_variation_id: null,
      quantity: 1,
      price_unit: this.currency == 'ARS' ? PRODUCT.price_ars : PRODUCT.price_usd,
      subtotal: this.getTotalPriceProduct(PRODUCT),
      total: this.getTotalPriceProduct(PRODUCT) * 1,
      currency: this.currency,
    };

    this.cartService.registerCart(data).subscribe(
      (resp: any) => {
        if (resp.message == 403) {
          this.toastr.error('Error', resp.message_text);
        } else {
          this.cartService.changeCart(resp.cart);
          this.toastr.success('Exito', 'El producto se agrego al carrito de compra');
        }
      },
      (err) => {
        console.error(err);
      }
    );
  }

  openDetailProduct(PRODUCT: any, DISCOUNT_FLASH: any = null): void {
    // First reset the variation_selected
    this.product_selected = null;
    this.variation_selected = null;

    // Then set the new product
    setTimeout(() => {
      this.product_selected = PRODUCT;

      setTimeout(() => {
        if (DISCOUNT_FLASH) {
          this.product_selected.discount_g = DISCOUNT_FLASH;
        }
        this.cdr.detectChanges(); // Force change detection after updating product
      }, 25);
    }, 100);
  }

  removeProduct(PRODUCT:any){
    let INDEX = this.PRODUCTS.findIndex((item:any) => item.id == PRODUCT.id);
    if (INDEX != -1) {
      this.PRODUCTS.splice(INDEX, 1);
      setTimeout(() => {
        localStorage.setItem('compares', JSON.stringify(this.PRODUCTS));
      }, 50);
      this.toastr.info('Exito', 'El producto se elimino de la comparativa');
    } else {
      this.toastr.error('Error', 'No se pudo eliminar el producto de la comparativa');
    }
  }
}
