import { afterNextRender, afterRender, Component, Inject, PLATFORM_ID } from '@angular/core';
import { HomeService } from '../../home/service/home.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalProductComponent } from '../component/modal-product/modal-product.component';
import { CookieService } from 'ngx-cookie-service';
import { CartService } from '../../home/service/cart.service';

declare var Swiper: any
declare var $: any
@Component({
  selector: "app-landing-product",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ModalProductComponent],
  templateUrl: "./landing-product.component.html",
  styleUrl: "./landing-product.component.css",
})
export class LandingProductComponent {
  PRODUCT_SLUG: any
  PRODUCT_SELECTED: any
  variation_selected: any
  sub_variation_selected: any
  PRODUCT_RELATEDS: any = []

  product_selected_modal: any

  currency = "ARS"

  CAMPAING_CODE: any

  DISCOUNT_CAMPAING: any;

  plus:number = 0;

  reviews:any = [];

  constructor(
    public homeService: HomeService,
    public activatedRoute: ActivatedRoute,
    private toastr : ToastrService,
    private router: Router,
    public cookieService: CookieService,
    private cartService: CartService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.activatedRoute.params.subscribe((resp: any) => {
      this.PRODUCT_SLUG = resp.slug;
    });
    this.activatedRoute.queryParams.subscribe((resp: any) => {
      this.CAMPAING_CODE = resp.campaing_discount;
    });
    this.homeService.showProducts(this.PRODUCT_SLUG, this.CAMPAING_CODE).subscribe((resp: any) => {
      if (resp.message === 403) {
        this.toastr.error('Error', resp.message_text);
        this.router.navigateByUrl('/');
      } else {
        this.PRODUCT_SELECTED = resp.product;
        this.PRODUCT_RELATEDS = resp.product_relateds.data;
        this.DISCOUNT_CAMPAING = resp.discount_campaing;
        this.reviews = resp.reviews;

        if(this.DISCOUNT_CAMPAING){
          this.PRODUCT_SELECTED.discount_g = this.DISCOUNT_CAMPAING;
        }

        // Esperar renderizado del DOM antes de instanciar Swiper
      }
    });
      afterRender(() => {
        // Only run browser-specific code if we're in a browser environment
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => {
            this.initSliderAndUI();
          }, 50);
        }
      })
  }

  initSliderAndUI() {
    // Only run if we're in a browser environment
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        const tp_rtl = localStorage.getItem("tp_dir")
        const rtl_setting = tp_rtl === "rtl"

        const mainSlider = new Swiper(".tp-slider-active", {
          slidesPerView: 1,
          spaceBetween: 30,
          loop: true,
          rtl: rtl_setting,
          effect: "fade",
          navigation: {
            nextEl: ".tp-slider-button-next",
            prevEl: ".tp-slider-button-prev",
          },
          pagination: {
            el: ".tp-slider-dot",
            clickable: true,
            renderBullet: (index: any, className: any) =>
              `<span class="${className}"><button>${index + 1}</button></span>`,
          },
        })

        mainSlider.on("slideChangeTransitionStart", () => {
          const isLight =
            document.querySelector(".swiper-slide.swiper-slide-active.is-light") ||
            document.querySelector(".tp-slider-item.is-light")

          const variation = document.querySelector(".tp-slider-variation")
          if (variation) {
            variation.classList.toggle("is-light", !!isLight)
          }
        })

        this.currency = this.cookieService.get("currency") || "ARS"

        // ✅ Esto asegura que los botones y estilos se aplican después del render.
        this.applyButtonStyles()
      }, 50)
    }
  }

  getNewTotal(DISCOUNT_FLASH_PRODUCT: any, DISCOUNT_FLASH_P: any) {
    if (this.currency == "ARS") {
      if (DISCOUNT_FLASH_P.type_discount == 1) {
        //% de descuento
        return (
          (DISCOUNT_FLASH_PRODUCT.price_ars + this.plus) -
          (DISCOUNT_FLASH_PRODUCT.price_ars + this.plus) * (DISCOUNT_FLASH_P.discount * 0.01)
        ).toFixed(2)
      } else {
        //monto fijo /-pesos -dolares
        return ((DISCOUNT_FLASH_PRODUCT.price_ars + this.plus) - DISCOUNT_FLASH_P.discount).toFixed(2)
      }
    } else {
      if (DISCOUNT_FLASH_P.type_discount == 1) {
        //% de descuento
        return (
          (DISCOUNT_FLASH_PRODUCT.price_usd + this.plus) -
          (DISCOUNT_FLASH_PRODUCT.price_usd + this.plus) * (DISCOUNT_FLASH_P.discount * 0.01)
        ).toFixed(2)
      } else {
        //monto fijo /-pesos -dolares
        return ((DISCOUNT_FLASH_PRODUCT.price_usd + this.plus) - DISCOUNT_FLASH_P.discount).toFixed(2)
      }
    }
  }

  getTotalPriceProduct(DISCOUNT_FLASH_PRODUCT: any) {
    if (DISCOUNT_FLASH_PRODUCT.discount_g) {
      return this.getNewTotal(DISCOUNT_FLASH_PRODUCT, DISCOUNT_FLASH_PRODUCT.discount_g)
    }
    if (this.currency == "ARS") {
      return DISCOUNT_FLASH_PRODUCT.price_ars + this.plus
    } else {
      return DISCOUNT_FLASH_PRODUCT.price_usd + this.plus
    }
  }

  getTotalCurrency(DISCOUNT_FLASH_PRODUCT: any) {
    if (this.currency == "ARS") {
      return DISCOUNT_FLASH_PRODUCT.price_ars
    } else {
      return DISCOUNT_FLASH_PRODUCT.price_usd
    }
  }

  selectedVariation(variation: any) {
    this.variation_selected = null
    this.sub_variation_selected = null
    this.plus = 0;
    setTimeout(() => {
      this.plus += variation.add_price;
      this.variation_selected = variation

      // Add another timeout to ensure the DOM is updated with the new subvariations
      setTimeout(() => {
        if (isPlatformBrowser(this.platformId)) {
          this.applyButtonStyles()
        }
      }, 50)
    }, 50)
  }

  //TODO: VER BUG DE QUANTITY QUE SE SUMA CON EL MODAL

  ngOnInit(): void {
    // Only run browser-specific code if we're in a browser environment
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        document.getElementById("tp-cart-minus-landing")?.addEventListener("click", (e: Event) => {
          const input = document.getElementById("tp-cart-input-landing") as HTMLInputElement
          if (!input) return
          let count = Number.parseInt(input.value) - 1
          count = count < 1 ? 1 : count
          input.value = count.toString()
          input.dispatchEvent(new Event("change"))
          e.preventDefault()
        })

        document.getElementById("tp-cart-plus-landing")?.addEventListener("click", (e: Event) => {
          const input = document.getElementById("tp-cart-input-landing") as HTMLInputElement
          if (!input) return
          input.value = (Number.parseInt(input.value) + 1).toString()
          input.dispatchEvent(new Event("change"))
          e.preventDefault()
        })
      }, 50)
    }
  }

  // Improved method to apply button styles
  applyButtonStyles() {
    // Only run if we're in a browser environment
    if (!isPlatformBrowser(this.platformId)) return

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

  selectedSubVariation(subvariation: any) {
    this.sub_variation_selected = null;
    this.plus = this.variation_selected.add_price
    setTimeout(() => {
      this.plus += subvariation.add_price;
      this.sub_variation_selected = subvariation
    }, 50)
  }

  addCart() {
    if (!this.cartService.authService.user) {
      this.toastr.error("Error", "Ingrese a la tienda")
      this.router.navigateByUrl("/login")
      return
    }

    let product_variation_id = null
    if (this.PRODUCT_SELECTED.variations.length > 0) {
      if (!this.variation_selected) {
        this.toastr.error("Error", "Necesitas seleccionar una variacion")
        return
      }

      if (this.variation_selected && this.variation_selected.subvariations.length > 0) {
        if (!this.sub_variation_selected) {
          this.toastr.error("Error", "Necesitas seleccionar una caracteristica")
          return
        }
      }
    }

    if (
      this.PRODUCT_SELECTED.variations.length > 0 &&
      this.variation_selected &&
      this.variation_selected.subvariations.length == 0
    ) {
      product_variation_id = this.variation_selected.id
    }

    if (
      this.PRODUCT_SELECTED.variations.length > 0 &&
      this.variation_selected &&
      this.variation_selected.subvariations.length > 0
    ) {
      product_variation_id = this.sub_variation_selected.id
    }

    // Only access DOM if in browser environment
    let quantity = 1
    if (isPlatformBrowser(this.platformId)) {
      const input = document.getElementById("tp-cart-input-val") as HTMLInputElement | null
      quantity = input ? Number.parseInt(input.value) || 1 : 1
    }

    let discount_g = null

    if (this.PRODUCT_SELECTED.discount_g) {
      discount_g = this.PRODUCT_SELECTED.discount_g
    }

    const data = {
      product_id: this.PRODUCT_SELECTED.id,
      type_discount: discount_g ? discount_g.type_discount : null,
      discount: discount_g ? discount_g.discount : null,
      type_campaing: discount_g ? discount_g.type_campaing : null,
      code_cupon: null,
      code_discount: discount_g ? discount_g.code : null,
      product_variation_id: product_variation_id,
      quantity: quantity,
      price_unit: this.currency == 'ARS' ? this.PRODUCT_SELECTED.price_ars : this.PRODUCT_SELECTED.price_usd,
      subtotal: this.getTotalPriceProduct(this.PRODUCT_SELECTED),
      total: this.getTotalPriceProduct(this.PRODUCT_SELECTED) * quantity,
      currency: this.currency,
    }

    this.cartService.registerCart(data).subscribe(
      (resp: any) => {
        console.log(resp)
        if (resp.message == 403) {
          this.toastr.error("Error", resp.message_text)
        } else {
          this.cartService.changeCart(resp.cart)
          this.toastr.success("Exito", "El producto se agrego al carrito de compra")
        }
      },
      (err) => {
        console.log(err)
      },
    )
  }

  openDetailModal(PRODUCT: any) {
    this.product_selected_modal = null
    setTimeout(() => {
      this.product_selected_modal = PRODUCT
    }, 100)
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



get totalReviews(): number {
  return this.reviews.length;
}

get reviewsStats() {
  const stats = [5, 4, 3, 2, 1].map(star => {
    const count = this.reviews.filter((r:any) => r.rating === star).length;
    const percent = this.totalReviews
      ? Math.round((count / this.totalReviews) * 100)
      : 0;

    return {
      star,
      count,
      percent
    };
  });

  return stats;
}
}
