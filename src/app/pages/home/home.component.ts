import { afterNextRender, Component } from '@angular/core';
import { HomeService } from './service/home.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

declare var Swiper: any;
declare var $: any;
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  SLIDERS: any = [];
  BANNER_SECUNDARIOS: any = [];
  BANNER_PRODUCTOS: any = [];

  CATEGORIES_RANDOMS: any = [];

  PRODUCTS_COMICS: any = [];

  PRODUCTS_CAROUSEL: any = [];

  TRENDING_PRODUCTS_NEW: any = [];
  TRENDING_PRODUCTS_FEATURED: any = [];
  TRENDING_PRODUCTS_TOP_SELLER: any = [];

  LASTS_PRODUCTS_DISCOUNTS: any = [];
  LASTS_PRODUCTS_FEATURED: any = [];
  LASTS_PRODUCTS_SELLING: any = [];

  DISCOUNT_FLASH: any;
  DISCOUNT_FLASH_PRODUCT: any = [];

  //para ver el submeno de categorias starwars
  categories_menus: any = [];

  //variable para el modal
  product_selected:any = null;

  variation_selected: any = null;

  constructor(public homeService: HomeService) {
    afterNextRender(() => {
      this.homeService.home().subscribe((resp: any) => {
        console.log(resp);
        this.SLIDERS = resp.sliders_principal;
        this.CATEGORIES_RANDOMS = resp.categories_randoms;
        this.TRENDING_PRODUCTS_NEW = resp.products_trending_new.data;
        this.TRENDING_PRODUCTS_FEATURED = resp.products_trending_featured.data;
        this.TRENDING_PRODUCTS_TOP_SELLER =
          resp.products_trending_top_sellers.data;
        this.BANNER_SECUNDARIOS = resp.sliders_secundario;
        this.BANNER_PRODUCTOS = resp.sliders_productos;

        this.PRODUCTS_COMICS = resp.products_comics.data;
        this.PRODUCTS_CAROUSEL = resp.products_carousel.data;

        this.LASTS_PRODUCTS_DISCOUNTS = resp.products_last_discounts.data;
        this.LASTS_PRODUCTS_FEATURED = resp.products_last_featured.data;
        this.LASTS_PRODUCTS_SELLING = resp.products_last_selling.data;

        this.DISCOUNT_FLASH = resp.discount_flash;
        this.DISCOUNT_FLASH_PRODUCT = resp.discount_flash_product;

        setTimeout(() => {
          var tp_rtl = localStorage.getItem('tp_dir');
          let rtl_setting = tp_rtl == 'rtl' ? 'right' : 'left';
          var mainSlider = new Swiper('.tp-slider-active', {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            rtl: rtl_setting,
            effect: 'fade',
            // Navigation arrows
            navigation: {
              nextEl: '.tp-slider-button-next',
              prevEl: '.tp-slider-button-prev',
            },
            pagination: {
              el: '.tp-slider-dot',
              clickable: true,
              renderBullet: function (index: any, className: any) {
                return (
                  '<span class="' +
                  className +
                  '">' +
                  '<button>' +
                  (index + 1) +
                  '</button>' +
                  '</span>'
                );
              },
            },
          });

          mainSlider.on(
            'slideChangeTransitionStart',
            function (realIndex: any) {
              if (
                $(
                  '.swiper-slide.swiper-slide-active, .tp-slider-item .is-light'
                ).hasClass('is-light')
              ) {
                $('.tp-slider-variation').addClass('is-light');
              } else {
                $('.tp-slider-variation').removeClass('is-light');
              }
            }
          );

          var slider = new Swiper('.tp-product-banner-slider-active', {
            slidesPerView: 1,
            spaceBetween: 0,
            loop: true,
            effect: 'fade',
            pagination: {
              el: ".tp-product-banner-slider-dot",
              clickable: true,
              renderBullet: function (index:any, className:any) {
                return '<span class="' + className + '">' + '<button>' + (index + 1) + '</button>' + "</span>";
              },
            },

          });

          var slider = new Swiper('.tp-product-arrival-active', {
            slidesPerView: 4,
            spaceBetween: 30,
            loop: false,
            rtl: rtl_setting,
            pagination: {
              el: ".tp-arrival-slider-dot",
              clickable: true,
              renderBullet: function (index:any, className:any) {
                return '<span class="' + className + '">' + '<button>' + (index + 1) + '</button>' + "</span>";
              },
            },
            // Navigation arrows
            navigation: {
              nextEl: ".tp-arrival-slider-button-next",
              prevEl: ".tp-arrival-slider-button-prev",
            },
            breakpoints: {
              '1200': {
                slidesPerView: 4,
              },
              '992': {
                slidesPerView: 3,
              },
              '768': {
                slidesPerView: 2,
              },
              '576': {
                slidesPerView: 2,
              },
              '0': {
                slidesPerView: 1,
              },
            },
          });

          var slider = new Swiper('.tp-product-offer-slider-active', {
            slidesPerView: 4,
            spaceBetween: 30,
            loop: true,
            rtl: rtl_setting,
            pagination: {
              el: ".tp-deals-slider-dot",
              clickable: true,
              renderBullet: function (index:any, className:any) {
                return '<span class="' + className + '">' + '<button>' + (index + 1) + '</button>' + "</span>";
              },
            },
            breakpoints: {
              '1200': {
                slidesPerView: 3,
              },
              '992': {
                slidesPerView: 2,
              },
              '768': {
                slidesPerView: 2,
              },
              '576': {
                slidesPerView: 1,
              },
              '0': {
                slidesPerView: 1,
              },
            },
          });


          setTimeout(() => {
            $("[data-countdown]").countdown();

            // $('.tp-color-variation-btn').on('click',  () => {
            //   $(this).addClass('active').siblings().removeClass('active');
            // });


            // $('.tp-size-variation-btn').on('click',  () => {
            //   $(this).addClass('active').siblings().removeClass('active');
            // });
          },50)
          //quiero renderizar las imagenes data-background de los banners secundarios ya que no uso jquery
          $('[data-background]').each(function (this: HTMLElement) {
            const background = this.getAttribute('data-background');
            if (background) {
              this.style.backgroundImage = `url(${background})`;
            }
          });
        }, 50);
      });
    });
    this.homeService.menus().subscribe((resp: any) => {
      console.log(resp);
      this.categories_menus = resp.categories_menus;
    });
  }

  ngOnInit(): void {}

  getLabelSlider(SLIDER: any) {
    var miDiv: any = document.getElementById('label-' + SLIDER.id);
    miDiv.innerHTML = SLIDER.label;
    return '';
  }

  getSubtitleSlider(SLIDER: any) {
    var miDiv: any = document.getElementById('subtitle-' + SLIDER.id);
    miDiv.innerHTML = SLIDER.subtitle;
    return '';
  }

  getTitleBannerSecundario(BANNER: any, ID_BANNER: string) {
    var miDiv: any = document.getElementById(ID_BANNER);
    miDiv.innerHTML = BANNER.title;
    return '';
  }

  getNewTotal(DISCOUNT_FLASH_PRODUCT:any, DISCOUNT_FLASH_P:any) {
    if (DISCOUNT_FLASH_P.type_discount == 1) { //% de descuento
      return (DISCOUNT_FLASH_PRODUCT.price_ars - (DISCOUNT_FLASH_PRODUCT.price_ars * (DISCOUNT_FLASH_P.discount * 0.01))).toFixed(2);
    } else { //monto fijo /-pesos -dolares
      return (DISCOUNT_FLASH_PRODUCT.price_ars - DISCOUNT_FLASH_P.discount).toFixed(2);
    }
  }

  getTotalPriceProduct(DISCOUNT_FLASH_PRODUCT:any) {
    if(DISCOUNT_FLASH_PRODUCT.discount_g) {
      return this.getNewTotal(DISCOUNT_FLASH_PRODUCT, DISCOUNT_FLASH_PRODUCT.discount_g);
    }
      return DISCOUNT_FLASH_PRODUCT.price_ars;
  }

  getIconMenu(MENU_CAT:any){
    var miDiv: any = document.getElementById('icon-' + MENU_CAT.id);
    miDiv.innerHTML = MENU_CAT.icon;
    return '';
  }



  openDetailProduct(TRENDING_PRODUCT: any) {
    // First reset the variation_selected
    this.variation_selected = null
    // Then set the new product
    this.product_selected = TRENDING_PRODUCT

    setTimeout(() => {
      // Apply background colors and button behaviors
      this.applyButtonStyles()
    }, 100) // Increased timeout to ensure DOM is ready
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
}
