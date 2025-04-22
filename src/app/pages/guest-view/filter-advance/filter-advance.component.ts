import { ChangeDetectorRef, Component } from '@angular/core';
import { HomeService } from '../../home/service/home.service';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ModalProductComponent } from '../component/modal-product/modal-product.component';
import { CartService } from '../../home/service/cart.service';
import { ToastrService } from 'ngx-toastr';


declare var $:any;
@Component({
  selector: 'app-filter-advance',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ModalProductComponent],
  templateUrl: './filter-advance.component.html',
  styleUrl: './filter-advance.component.css'
})
export class FilterAdvanceComponent {

  Categories:any = [];
  Colors:any = [];
  Brands:any = [];
  Products_relateds: any = [];



  PRODUCTS: any = [];
  currency: string = 'ARS';

  product_selected: any = null;
  variation_selected: any = null;
  DISCOUNT_FLASH: any = null;

  constructor(
    public homeService: HomeService,
    public cookieService: CookieService,
    public cartService: CartService,
    public router: Router,
    public toastr: ToastrService,
    public cdr: ChangeDetectorRef,

  ) {

    this.homeService.getConfigFilter().subscribe((resp:any) => {
      // console.log(resp)
      this.Categories = resp.categories;
      this.Colors = resp.colors;
      this.Brands = resp.brands;
      this.Products_relateds = resp.product_relateds.data;
    })

    this.homeService.filterAdvanceProduct({}).subscribe((resp:any) => {
      console.log(resp);
      this.PRODUCTS = resp.products.data;
    })
  }

  ngOnInit(): void {
    // Set currency FIRST before loading any data
    this.currency = this.cookieService.get("currency") || 'ARS';
    };


  getTotalCurrency(PRODUCTS: any): number {
    // Add null checks
    if (!PRODUCTS) {
      return 0;
    }


    let price: number;

    if (this.currency == 'ARS') {
      if (!PRODUCTS.price_ars) {
        return 0;
      }
      price = PRODUCTS.price_ars;
    } else {
      if (!PRODUCTS.price_usd) {
        return 0;
      }
      price = PRODUCTS.price_usd;
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

  getNewTotal(PRODUCTS: any, DISCOUNT_FLASH_P: any): number {
    // Add null checks
    if (!PRODUCTS || !DISCOUNT_FLASH_P) {
      return 0;
    }

    let result: number;

    if (this.currency == 'ARS') {
      if (!PRODUCTS.price_ars) {
        return 0;
      }

      if (DISCOUNT_FLASH_P.type_discount == 1) { //% de descuento
        result = PRODUCTS.price_ars - (PRODUCTS.price_ars * (DISCOUNT_FLASH_P.discount * 0.01));
      } else { //monto fijo /-pesos -dolares
        result = PRODUCTS.price_ars - DISCOUNT_FLASH_P.discount;
      }
    } else {
      if (!PRODUCTS.price_usd) {
        return 0;
      }

      if (DISCOUNT_FLASH_P.type_discount == 1) { //% de descuento
        result = PRODUCTS.price_usd - (PRODUCTS.price_usd * (DISCOUNT_FLASH_P.discount * 0.01));
      } else { //monto fijo /-pesos -dolares
        result = PRODUCTS.price_usd - DISCOUNT_FLASH_P.discount;
      }
    }

    // Always return a number with 2 decimal places
    return parseFloat(result.toFixed(2));
  }

  getTotalPriceProduct(PRODUCTS: any): number {
    // Add null checks
    if (!PRODUCTS) {
      return 0;
    }

    let result: number;

    // primero chequeamos que hay un descuento en el producto
    if (PRODUCTS.discount_g) {
      result = this.getNewTotal(PRODUCTS, PRODUCTS.discount_g);
    }
    // luego chequeamos si tiene el descuento flash
    else if (this.DISCOUNT_FLASH && this.PRODUCTS &&
             this.PRODUCTS.includes &&
             this.PRODUCTS.includes(PRODUCTS)) {
      result = this.getNewTotal(PRODUCTS, this.DISCOUNT_FLASH);
    }
    // precio comun
    else {
      if (this.currency == "ARS") {
        if (!PRODUCTS.price_ars) {
          return 0;
        }
        result = parseFloat(PRODUCTS.price_ars.toFixed(2));
      } else {
        if (!PRODUCTS.price_usd) {
          return 0;
        }
        result = parseFloat(PRODUCTS.price_usd.toFixed(2));
      }
    }

    return result;
  }

}
