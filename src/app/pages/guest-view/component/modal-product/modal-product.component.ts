import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../../home/service/cart.service';
import { afterRender } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-modal-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-product.component.html',
  styleUrl: './modal-product.component.css'
})
export class ModalProductComponent {

  @Input() product_selected:any;

  variation_selected: any;
  sub_variation_selected:any;

  currency:string = 'ARS';

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private cartService: CartService,
    public cookieService: CookieService
  ){
    afterRender(() => {
      this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'ARS';
          })
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product_selected'] && changes['product_selected'].currentValue) {
      this.resetModal();
    }
  }

  resetModal() {
    this.variation_selected = null;
    setTimeout(() => {
      this.applyButtonStyles(); // si querés aplicar colores al render nuevo
    }, 50);
  }

  getNewTotal(DISCOUNT_FLASH_PRODUCT:any, DISCOUNT_FLASH_P:any) {
    if(this.currency == 'ARS') {
    if (DISCOUNT_FLASH_P.type_discount == 1) { //% de descuento
      return (DISCOUNT_FLASH_PRODUCT.price_ars - (DISCOUNT_FLASH_PRODUCT.price_ars * (DISCOUNT_FLASH_P.discount * 0.01))).toFixed(2);
    } else { //monto fijo /-pesos -dolares
      return (DISCOUNT_FLASH_PRODUCT.price_ars - DISCOUNT_FLASH_P.discount).toFixed(2);
    }
  } else {
      if (DISCOUNT_FLASH_P.type_discount == 1) { //% de descuento
        return (DISCOUNT_FLASH_PRODUCT.price_usd - (DISCOUNT_FLASH_PRODUCT.price_usd * (DISCOUNT_FLASH_P.discount * 0.01))).toFixed(2);
      } else { //monto fijo /-pesos -dolares
        return (DISCOUNT_FLASH_PRODUCT.price_usd - DISCOUNT_FLASH_P.discount).toFixed(2);
      }
    }
  }

  //TODO: VER BUG DE QUANTITY QUE SE SUMA CON EL MODAL
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    setTimeout(() => {
      document.querySelectorAll<HTMLButtonElement>('.tp-cart-minus').forEach(button => {
        button.addEventListener('click', function (e: Event) {
          const parent = this.parentElement;
          const input = parent?.querySelector<HTMLInputElement>('input');
          if (!input) return;

          let count = parseInt(input.value) - 1;
          count = count < 1 ? 1 : count;
          input.value = count.toString();
          input.dispatchEvent(new Event('change'));
          e.preventDefault();
        });
      });

      document.querySelectorAll<HTMLButtonElement>('.tp-cart-plus').forEach(button => {
        button.addEventListener('click', function (e: Event) {
          const parent = this.parentElement;
          const input = parent?.querySelector<HTMLInputElement>('input');
          if (!input) return;

          input.value = (parseInt(input.value) + 1).toString();
          input.dispatchEvent(new Event('change'));
          e.preventDefault();
        });
      });
    }, 50);
  }

  applyButtonStyles() {
    // Target all spans with data-bg-color attribute
    const bgElements = document.querySelectorAll<HTMLElement>("span[data-bg-color]")
    bgElements.forEach((el) => {
      const color = el.getAttribute("data-bg-color")
      if (color) {
        el.style.backgroundColor = color
      }
    })

    // Also handle Angular's [attr.data-bg-color] binding
    // This is needed because Angular might render these differently
    document.querySelectorAll<HTMLElement>(".tp-color-variation-btn span").forEach((span) => {
      // Check if this span has a background color set by Angular
      const computedStyle = window.getComputedStyle(span)
      if (computedStyle.backgroundColor === "rgba(0, 0, 0, 0)" || computedStyle.backgroundColor === "transparent") {
        // Try to get the color from the attribute
        const color = span.getAttribute("data-bg-color")
        if (color) {
          span.style.backgroundColor = color
        }
      }
    })

    // Activar botón de color
    const colorBtns = document.querySelectorAll<HTMLElement>(".tp-color-variation-btn")
    colorBtns.forEach((btn) => {
      btn.onclick = () => {
        colorBtns.forEach((b) => b.classList.remove("active"))
        btn.classList.add("active")
      }
    })

    // Activar botón de tamaño
    const sizeBtns = document.querySelectorAll<HTMLElement>(".tp-size-variation-btn")
    sizeBtns.forEach((btn) => {
      btn.onclick = () => {
        sizeBtns.forEach((b) => b.classList.remove("active"))
        btn.classList.add("active")
      }
    })
  }

  getTotalPriceProduct(DISCOUNT_FLASH_PRODUCT:any) {
    if(DISCOUNT_FLASH_PRODUCT.discount_g) {
      return this.getNewTotal(DISCOUNT_FLASH_PRODUCT, DISCOUNT_FLASH_PRODUCT.discount_g);
    }
    if (this.currency == "ARS") {
      return DISCOUNT_FLASH_PRODUCT.price_ars
    } else {
      return DISCOUNT_FLASH_PRODUCT.price_usd
    }
  }
  selectedVariation(variation: any) {
      this.variation_selected = null
      this.sub_variation_selected = null
      setTimeout(() => {
        this.variation_selected = variation

        // Add another timeout to ensure the DOM is updated with the new subvariations
        setTimeout(() => {
          this.applyButtonStyles()
        }, 50)
      }, 50)
    }

  selectedSubVariation(subvariation:any){
    this.sub_variation_selected = null
    setTimeout(() => {
      this.sub_variation_selected = subvariation

    }, 50)
  }

  addCart(){
    if(!this.cartService.authService.user){

      this.toastr.error('Error', 'Ingrese a la tienda');
      this.router.navigateByUrl("/login")
      return
    }

    let product_variation_id = null
    if(this.product_selected.variations.length > 0){
      if(!this.variation_selected){
        this.toastr.error('Error', 'Necesitas seleccionar una variacion');
        return;
      }

      if(this.variation_selected && this.variation_selected.subvariations.length > 0 ){
        if(!this.sub_variation_selected){
          this.toastr.error('Error', 'Necesitas seleccionar una caracteristica');
          return;
        }
      }
    }

    if(this.product_selected.variations.length > 0 && this.variation_selected &&
      this.variation_selected.subvariations.length == 0){
      product_variation_id = this.variation_selected.id;
    }

    if(this.product_selected.variations.length > 0 && this.variation_selected &&
      this.variation_selected.subvariations.length > 0){
      product_variation_id = this.sub_variation_selected.id;
    }

    const input = document.getElementById("tp-cart-input-val") as HTMLInputElement | null;
    const quantity = input ? parseInt(input.value) || 1 : 1;

    let discount_g = null;

    if(this.product_selected.discount_g){
      discount_g = this.product_selected.discount_g;
    }

    let data = {
      product_id: this.product_selected.id,
      type_discount: discount_g ? discount_g.type_discount : null,
      discount: discount_g ? discount_g.discount : null,
      type_campaing: discount_g ? discount_g.type_campaing : null,
      code_cupon: null,
      code_discount: discount_g ? discount_g.code : null,
      product_variation_id: product_variation_id,
      quantity: quantity,
      price_unit: this.currency == 'ARS' ? this.product_selected.price_ars : this.product_selected.price_usd,
      subtotal: this.getTotalPriceProduct(this.product_selected),
      total: this.getTotalPriceProduct(this.product_selected) * quantity,
      currency: this.currency,
    };


    this.cartService.registerCart(data).subscribe((resp:any) => {
      console.log(resp);
      if(resp.message == 403){
        this.toastr.error('Error', resp.message_text);
      } else {
        this.cartService.changeCart(resp.cart);
        this.toastr.success('Exito', 'El producto se agrego al carrito de compra');
      }
    }, err => {
      console.log(err);
    })
  }
}
