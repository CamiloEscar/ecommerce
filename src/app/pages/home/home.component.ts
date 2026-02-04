import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, AfterViewInit } from '@angular/core';
import { HomeService } from './service/home.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ModalProductComponent } from '../guest-view/component/modal-product/modal-product.component';
import { CookieService } from 'ngx-cookie-service';
import { CartService } from './service/cart.service';
import { ToastrService } from 'ngx-toastr';

declare var Swiper: any;
declare var $: any;
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ModalProductComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush // Use OnPush for better control
})
export class HomeComponent implements OnInit, AfterViewInit {
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
  product_selected: any = null;

  variation_selected: any = null;

  currency: string = 'ARS';

  constructor(
    public homeService: HomeService,
    private cdr: ChangeDetectorRef,
    private cookieService: CookieService,
    public cartService: CartService,
    private toastr: ToastrService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Set currency FIRST before loading any data
    this.currency = this.cookieService.get("currency") || 'ARS';

    // Load home data
    this.loadHomeData();

    // Subscribe to cart changes
    this.cartService.currentDataCart$.subscribe((resp: any) => {
      // Handle cart updates if needed
      this.cdr.markForCheck(); // Mark for check instead of detectChanges
    });
  }

  ngAfterViewInit(): void {
    // Force change detection after view init
    this.cdr.detectChanges();
  }

  loadHomeData(): void {
    this.homeService.home().subscribe((resp: any) => {
      this.SLIDERS = resp.sliders_principal;
      this.CATEGORIES_RANDOMS = resp.categories_randoms;
      this.TRENDING_PRODUCTS_NEW = resp.products_trending_new.data;
      this.TRENDING_PRODUCTS_FEATURED = resp.products_trending_featured.data;
      this.TRENDING_PRODUCTS_TOP_SELLER = resp.products_trending_top_sellers.data;
      this.BANNER_SECUNDARIOS = resp.sliders_secundario;
      this.BANNER_PRODUCTOS = resp.sliders_productos;

      this.PRODUCTS_COMICS = resp.products_comics.data;
      this.PRODUCTS_CAROUSEL = resp.products_carousel.data;

      this.LASTS_PRODUCTS_DISCOUNTS = resp.products_last_discounts.data;
      this.LASTS_PRODUCTS_FEATURED = resp.products_last_featured.data;
      this.LASTS_PRODUCTS_SELLING = resp.products_last_selling.data;

      this.DISCOUNT_FLASH = resp.discount_flash;
      this.DISCOUNT_FLASH_PRODUCT = resp.discount_flash_product;

      this.homeService.menus().subscribe((resp:any) => {
        console.log(resp)
        this.categories_menus = resp.categories_menus;
      })
      // Initialize sliders after data is loaded
      setTimeout(() => {
        this.initializeSliders();
        this.cdr.detectChanges();
      }, 50);
    });
  }

  initializeSliders(): void {
    this.SLIDERS.forEach((SLIDER: any) => {
      this.getLabelSlider(SLIDER);
      this.getSubtitleSlider(SLIDER);

      var tp_rtl = localStorage.getItem('tp_dir');
      let rtl_setting = tp_rtl == 'rtl' ? 'right' : 'left';

      setTimeout(() => {
        this.initMainSlider(rtl_setting);
        this.initProductSliders(rtl_setting);

        // Handle other initializations
        setTimeout(() => {
          if ($("[data-countdown]").countdown) {
            $("[data-countdown]").countdown();
          }

          // Handle background images
          $('[data-background]').each(function(this: HTMLElement) {
            const background = this.getAttribute('data-background');
            if (background) {
              this.style.backgroundImage = `url(${background})`;
            }
          });
        }, 50);
      }, 100);
    });
  }

  initMainSlider(rtl_setting: string): void {
    var mainSlider = new Swiper('.tp-slider-active', {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: false,
      rtl: rtl_setting,
      effect: 'fade',
      navigation: {
        nextEl: '.tp-slider-button-next',
        prevEl: '.tp-slider-button-prev',
      },
      pagination: {
        el: '.tp-slider-dot',
        clickable: true,
        renderBullet: function(index: any, className: any) {
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
      function(realIndex: any) {
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
  }

  initProductSliders(rtl_setting: string): void {
    // Banner slider
    new Swiper('.tp-product-banner-slider-active', {
      slidesPerView: 1,
      spaceBetween: 0,
      loop: false,
      effect: 'fade',
      pagination: {
        el: ".tp-product-banner-slider-dot",
        clickable: true,
        renderBullet: function(index: any, className: any) {
          return '<span class="' + className + '">' + '<button>' + (index + 1) + '</button>' + "</span>";
        },
      },
    });

    // Arrival slider
    new Swiper('.tp-product-arrival-active', {
      slidesPerView: 4,
      spaceBetween: 30,
      loop: false,
      rtl: rtl_setting,
      pagination: {
        el: ".tp-arrival-slider-dot",
        clickable: true,
        renderBullet: function(index: any, className: any) {
          return '<span class="' + className + '">' + '<button>' + (index + 1) + '</button>' + "</span>";
        },
      },
      navigation: {
        nextEl: ".tp-arrival-slider-button-next",
        prevEl: ".tp-arrival-slider-button-prev",
      },
      breakpoints: {
        '1200': { slidesPerView: 4 },
        '992': { slidesPerView: 3 },
        '768': { slidesPerView: 2 },
        '576': { slidesPerView: 2 },
        '0': { slidesPerView: 1 },
      },
    });

    // Offer slider
    new Swiper('.tp-product-offer-slider-active', {
      slidesPerView: 4,
      spaceBetween: 30,
      loop: false,
      rtl: rtl_setting,
      pagination: {
        el: ".tp-deals-slider-dot",
        clickable: true,
        renderBullet: function(index: any, className: any) {
          return '<span class="' + className + '">' + '<button>' + (index + 1) + '</button>' + "</span>";
        },
      },
      breakpoints: {
        '1200': { slidesPerView: 3 },
        '992': { slidesPerView: 2 },
        '768': { slidesPerView: 2 },
        '576': { slidesPerView: 1 },
        '0': { slidesPerView: 1 },
      },
    });
  }

  addCompareProduct(TRENDING_PRODUCT:any){
    let COMPARES = localStorage.getItem('compares') ? JSON.parse(localStorage.getItem('compares') || '') : [];

    let INDEX = COMPARES.findIndex((item:any) => item.id == TRENDING_PRODUCT.id);

    if(INDEX != -1) {

      this.toastr.error('Validacion', 'El producto ya fue agregado a la comparacion')

      return;
    }

    COMPARES.push(TRENDING_PRODUCT);
    this.toastr.success('Exito', 'Producto agregado a la comparacion')

    localStorage.setItem('compares', JSON.stringify(COMPARES));

    if(COMPARES.length > 1) {
      this.router.navigateByUrl('/compare-product')
    }
  }

  addFavoriteProduct(PRODUCT: any) {
  let FAVORITES = localStorage.getItem('favorites') ? JSON.parse(localStorage.getItem('favorites') || '') : [];

  let INDEX = FAVORITES.findIndex((item: any) => item.id == PRODUCT.id);

  if (INDEX != -1) {
    this.toastr.error('Validación', 'El producto ya está en favoritos');
    return;
  }

  FAVORITES.push(PRODUCT);
  localStorage.setItem('favorites', JSON.stringify(FAVORITES));
  this.toastr.success('Éxito', 'Producto agregado a favoritos');
}


  addCart(PRODUCT: any): void {
    if (!this.cartService.authService.user) {
      this.toastr.error('Error', 'Ingrese a la tienda');
      this.router.navigateByUrl("/login");
      return;
    }

      // VALIDACION DE STOCK
    if (!PRODUCT.stock || PRODUCT.stock <= 0) {
      this.toastr.error('Sin stock', 'Este producto no tiene stock disponible');
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

  getLabelSlider(SLIDER: any): string {
    var miDiv: any = document.getElementById('label-' + SLIDER.id);
    if (miDiv) {
      miDiv.innerHTML = SLIDER.label || '';
    }
    return '';
  }

  getSubtitleSlider(SLIDER: any): string {
    var miDiv: any = document.getElementById('subtitle-' + SLIDER.id);
    if (miDiv) {
      miDiv.innerHTML = SLIDER.subtitle || '';
    }
    return '';
  }

  getTitleBannerSecundario(BANNER: any, ID_BANNER: string): string {
    var miDiv: any = document.getElementById(ID_BANNER);
    if (miDiv) {
      miDiv.innerHTML = BANNER.title || '';
    }
    return '';
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

  getIconMenu(MENU_CAT: any): string {
    var miDiv: any = document.getElementById('icon-' + MENU_CAT.id);
    if (miDiv) {
      miDiv.innerHTML = MENU_CAT.icon || '';
    }
    return '';
  }

  openDetailProduct(TRENDING_PRODUCT: any, DISCOUNT_FLASH: any = null): void {
    // First reset the variation_selected
    this.product_selected = null;
    this.variation_selected = null;

    // Then set the new product
    setTimeout(() => {
      this.product_selected = TRENDING_PRODUCT;

      setTimeout(() => {
        if (DISCOUNT_FLASH) {
          this.product_selected.discount_g = DISCOUNT_FLASH;
        }
        this.cdr.detectChanges(); // Force change detection after updating product
      }, 25);
    }, 100);
  }
}
