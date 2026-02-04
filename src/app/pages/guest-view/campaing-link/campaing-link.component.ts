import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../home/service/cart.service';
import { HomeService } from '../../home/service/home.service';
import { ModalProductComponent } from '../component/modal-product/modal-product.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


declare var $:any;
@Component({
  selector: 'app-campaing-link',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ModalProductComponent],
  templateUrl: './campaing-link.component.html',
  styleUrl: './campaing-link.component.css'
})
export class CampaingLinkComponent {
Categories:any = [];
  Colors:any = [];
  Brands:any = [];
  Products_relateds: any = [];



  PRODUCTS: any = [];
  currency: string = 'ARS';

  product_selected: any = null;
  variation_selected: any = null;
  DISCOUNT_FLASH: any = null;

  categories_selected:any = [];

  colors_selected:any = [];
  brands_selected: any = [];

  min_price: number = 0;
  max_price: number = 0;

  options_aditional:any = [];

  CODE_DISCOUNT:any = null;

  DISCOUNT_LINK:any = null;
  constructor(
    public homeService: HomeService,
    public cookieService: CookieService,
    public cartService: CartService,
    public router: Router,
    public toastr: ToastrService,
    public cdr: ChangeDetectorRef,
    public activatedRoute: ActivatedRoute,

  ) {

    this.homeService.getConfigFilter().subscribe((resp:any) => {
      // console.log(resp)
      this.Categories = resp.categories;
      this.Colors = resp.colors;
      this.Brands = resp.brands;
      this.Products_relateds = resp.product_relateds.data;
    })

    this.activatedRoute.params.subscribe((resp:any) => {
      this.CODE_DISCOUNT = resp.code;
    })

    this.homeService.campaingDiscountLink({code_discount: this.CODE_DISCOUNT}).subscribe((resp:any) => {
      //console.log(resp);
      if(resp.message == 403) {
        this.toastr.info('Validacion', resp.message_text);
        return;
      }
      this.PRODUCTS = resp.products;
      this.DISCOUNT_LINK = resp.discount;
    })
  }

    ngOnInit(): void {
      // Set currency FIRST before loading any data
      this.currency = this.cookieService.get("currency") || 'ARS';

      if(typeof $ !== 'undefined'){
        $("#slider-range").slider({
              range: true,
              min: 0,
              max: 40000,
              values: [10, 10000],
              slide: (event:any, ui:any) => {
                $("#amount").val(this.currency+ " " + ui.values[0] + " - "+this.currency+ " " + ui.values[1]);
                this.min_price = ui.values[0];
                this.max_price = ui.values[1];
              },stop: () => {
                // this.filterAdvanceProduct();
              }
            });
            $("#amount").val(this.currency+ " " + $("#slider-range").slider("values", 0) +
              " - "+this.currency+ " " + $("#slider-range").slider("values", 1));
        }
      };

    reset(){
      window.location.href = "/productos-busqueda";
    }

    addOptionAditional(option:string){
    //chequeamos si la categoria ya fue seleccionada
    let INDEX = this.options_aditional.findIndex((item:any) => item == option);
    //SI YA EXISTE
    if(INDEX != -1){
      //la eliminamos de la lista de seleccionados
      this.options_aditional.splice(INDEX, 1)
    } else {
      //si no fue seleccionada la agregamos
      this.options_aditional.push(option);
    }
    // console.log(this.categories_selected)
    //cada vez que seleccionamos una categoria llamamos al servicio para filtrar los product
    // this.filterAdvanceProduct();

    }

    addCategorie(categorie:any){

      //chequeamos si la categoria ya fue seleccionada
      let INDEX = this.categories_selected.findIndex((item:any) => item == categorie.id);
      //SI YA EXISTE
      if(INDEX != -1){
        //la eliminamos de la lista de seleccionados
        this.categories_selected.splice(INDEX, 1)
      } else {
        //si no fue seleccionada la agregamos
        this.categories_selected.push(categorie.id);
      }
      // console.log(this.categories_selected)
      //cada vez que seleccionamos una categoria llamamos al servicio para filtrar los product
      // this.filterAdvanceProduct();
    }

    addBrand(categorie:any){

      //chequeamos si la categoria ya fue seleccionada
      let INDEX = this.brands_selected.findIndex((item:any) => item == categorie.id);
      //SI YA EXISTE
      if(INDEX != -1){
        //la eliminamos de la lista de seleccionados
        this.brands_selected.splice(INDEX, 1)
      } else {
        //si no fue seleccionada la agregamos
        this.brands_selected.push(categorie.id);
      }
      // console.log(this.categories_selected)
      //cada vez que seleccionamos una categoria llamamos al servicio para filtrar los product
      // this.filterAdvanceProduct();
    }

    addColor(color:any){

      //chequeamos si la categoria ya fue seleccionada
      let INDEX = this.colors_selected.findIndex((item:any) => item == color.id);
      //SI YA EXISTE
      if(INDEX != -1){
        //la eliminamos de la lista de seleccionados
        this.colors_selected.splice(INDEX, 1)
      } else {
        //si no fue seleccionada la agregamos
        this.colors_selected.push(color.id);
      }
      // console.log(this.categories_selected)
      //cada vez que seleccionamos una categoria llamamos al servicio para filtrar los product
      // this.filterAdvanceProduct();
    }

    // filterAdvanceProduct(){

    //   let data = {
    //     categories_selected: this.categories_selected,
    //     colors_selected: this.colors_selected,
    //     brands_selected: this.brands_selected,
    //     min_price: this.min_price,
    //     max_price: this.max_price,
    //     currency: this.currency,
    //     options_aditional: this.options_aditional,
    //   }
    //   this.homeService.filterAdvanceProduct(data).subscribe((resp:any) => {
    //     //console.log(resp);
    //     this.PRODUCTS = resp.products.data;
    //   })
    // }

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
      if (this.DISCOUNT_LINK) {
        result = this.getNewTotal(PRODUCTS, this.DISCOUNT_LINK);
      }
      // luego chequeamos si tiene el descuento flash
      else if (this.DISCOUNT_LINK && this.PRODUCTS &&
              this.PRODUCTS.includes &&
              this.PRODUCTS.includes(PRODUCTS)) {
        result = this.getNewTotal(PRODUCTS, this.DISCOUNT_LINK);
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

    addCompareProduct(PRODUCT:any){
      let COMPARES = localStorage.getItem('compares') ? JSON.parse(localStorage.getItem('compares') || '') : [];

      let INDEX = COMPARES.findIndex((item:any) => item.id == PRODUCT.id);

      if(INDEX != -1) {

        this.toastr.error('Validacion', 'El producto ya fue agregado a la comparacion')

        return;
      }

      COMPARES.push(PRODUCT);
      this.toastr.success('Exito', 'Producto agregado a la comparacion')

      localStorage.setItem('compares', JSON.stringify(COMPARES));

      if(COMPARES.length > 1) {
        this.router.navigateByUrl('/compare-product')
      }
    }
}
