import { afterNextRender, afterRender, Component } from '@angular/core';
import { HomeService } from '../../home/service/home.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalProductComponent } from '../component/modal-product/modal-product.component';
import { CookieService } from 'ngx-cookie-service';

declare var Swiper: any;
declare var $: any;
@Component({
  selector: 'app-landing-product',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalProductComponent],
  templateUrl: './landing-product.component.html',
  styleUrl: './landing-product.component.css'
})
export class LandingProductComponent {

  PRODUCT_SLUG: any;
  PRODUCT_SELECTED: any;
  variation_selected:any;

  PRODUCT_RELATEDS:any = [];

  product_selected_modal:any;

  currency:string = 'ARS';

  CAMPAING_CODE:any;

  DISCOUNT_CAMPAING:any;

  constructor(
    public homeService: HomeService,
    public activatedRoute: ActivatedRoute,
    private toastr : ToastrService,
    private router: Router,
    public cookieService: CookieService,
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

          if(this.DISCOUNT_CAMPAING){
            this.PRODUCT_SELECTED.discount_g = this.DISCOUNT_CAMPAING;
          }

          // Esperar renderizado del DOM antes de instanciar Swiper
          afterRender(() => {
            setTimeout(() => {
              const tp_rtl = localStorage.getItem('tp_dir');
              const rtl_setting = tp_rtl === 'rtl';

              const mainSlider = new Swiper('.tp-slider-active', {
                slidesPerView: 1,
                spaceBetween: 30,
                loop: true,
                rtl: rtl_setting,
                effect: 'fade',
                navigation: {
                  nextEl: '.tp-slider-button-next',
                  prevEl: '.tp-slider-button-prev',
                },
                pagination: {
                  el: '.tp-slider-dot',
                  clickable: true,
                  renderBullet: (index: any, className: any) =>
                    `<span class="${className}"><button>${index + 1}</button></span>`,
                },
              });

              mainSlider.on('slideChangeTransitionStart', () => {
                const isLight = document.querySelector('.swiper-slide.swiper-slide-active.is-light')
                  || document.querySelector('.tp-slider-item.is-light');

                const variation = document.querySelector('.tp-slider-variation');
                if (variation) {
                  variation.classList.toggle('is-light', !!isLight);
                }
              });
            }, 50);
            this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'ARS';
          })
        }
      });

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

  getTotalPriceProduct(DISCOUNT_FLASH_PRODUCT:any) {
    if(DISCOUNT_FLASH_PRODUCT.discount_g) {
      return this.getNewTotal(DISCOUNT_FLASH_PRODUCT, DISCOUNT_FLASH_PRODUCT.discount_g);
    }
    if(this.currency == 'ARS') {
      return DISCOUNT_FLASH_PRODUCT.price_ars;
    } else {
      return DISCOUNT_FLASH_PRODUCT.price_usd;
    }
  }

  getTotalCurrency(DISCOUNT_FLASH_PRODUCT:any){
    if(this.currency == 'ARS'){
      return DISCOUNT_FLASH_PRODUCT.price_ars;
    } else {
      return DISCOUNT_FLASH_PRODUCT.price_usd;
    }
  }

  selectedVariation(variation: any) {
    this.variation_selected = null
    setTimeout(() => {
      this.variation_selected = variation

      // Add another timeout to ensure the DOM is updated with the new subvariations
      setTimeout(() => {
        this.applyButtonStyles()
      }, 50)
    }, 50)
  }

  // Improved method to apply button styles
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

  openDetailModal(PRODUCT:any){
    this.product_selected_modal = null;
    setTimeout(() => {
      this.product_selected_modal = PRODUCT;
    }, 100);
  }
}
