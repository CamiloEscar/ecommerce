import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, SimpleChanges } from '@angular/core';
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

  @Input() product_selected: any;

  variation_selected: any;
  sub_variation_selected: any;

  currency: string = 'ARS';

  plus: number = 0;

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private cartService: CartService,
    public cookieService: CookieService,
    private cdr: ChangeDetectorRef,
  ) {
    afterRender(() => {
      this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'ARS';
    });
  }

  // Fixed method name from nngOnChanges to ngOnChanges
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product_selected'] && changes['product_selected'].currentValue) {
      this.resetModal();
    }
  }

  resetModal() {
    console.log('Producto seleccionado:', this.product_selected);
    console.log('Variaciones disponibles:', this.product_selected?.variations);

    // Reset selections and price adjustments
    this.variation_selected = null;
    this.sub_variation_selected = null;
    this.plus = 0;

    // Force change detection immediately
    this.cdr.detectChanges();

    // Apply button styles soon after
    setTimeout(() => {
      this.applyButtonStyles();
    }, 50);
  }

  getNewTotal(DISCOUNT_FLASH_PRODUCT: any, DISCOUNT_FLASH_P: any) {
    const basePrice = this.getBasePrice(DISCOUNT_FLASH_PRODUCT);

    if (DISCOUNT_FLASH_P.type_discount == 1) { // % de descuento
      return (basePrice - basePrice * (DISCOUNT_FLASH_P.discount * 0.01)).toFixed(2);
    } else { // monto fijo /-pesos -dolares
      return (basePrice - DISCOUNT_FLASH_P.discount).toFixed(2);
    }
  }

  // Helper method to get the base price including variation adjustments
  getBasePrice(product: any): number {
    if (this.currency == 'ARS') {
      return product.price_ars + this.plus;
    } else {
      return product.price_usd + this.plus;
    }
  }

  ngOnInit(): void {
    // Set currency from cookies
    this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'ARS';

    // Initialize quantity control buttons
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

      this.applyButtonStyles();
    }, 50);
  }

  applyButtonStyles() {
    // Target all spans with data-bg-color attribute
    const bgElements = document.querySelectorAll<HTMLElement>("span[data-bg-color]");
    bgElements.forEach((el) => {
      const color = el.getAttribute("data-bg-color");
      if (color) {
        el.style.backgroundColor = color;
      }
    });

    // Also handle Angular's [attr.data-bg-color] binding
    document.querySelectorAll<HTMLElement>(".tp-color-variation-btn span").forEach((span) => {
      // Check if this span has a background color set by Angular
      const computedStyle = window.getComputedStyle(span);
      if (computedStyle.backgroundColor === "rgba(0, 0, 0, 0)" || computedStyle.backgroundColor === "transparent") {
        // Try to get the color from the attribute
        const color = span.getAttribute("data-bg-color");
        if (color) {
          span.style.backgroundColor = color;
        }
      }
    });

    // Activar botón de color
    const colorBtns = document.querySelectorAll<HTMLElement>(".tp-color-variation-btn");
    colorBtns.forEach((btn) => {
      btn.onclick = () => {
        colorBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      };
    });

    // Activar botón de tamaño
    const sizeBtns = document.querySelectorAll<HTMLElement>(".tp-size-variation-btn");
    sizeBtns.forEach((btn) => {
      btn.onclick = () => {
        sizeBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      };
    });
  }

  getTotalPriceProduct(product: any) {
    // If there's a discount, calculate with discount
    if (product.discount_g) {
      return this.getNewTotal(product, product.discount_g);
    }

    // Otherwise return the price with variation adjustment
    return this.getBasePrice(product).toFixed(2);
  }

  getTotalCurrency(product: any) {
    return this.getBasePrice(product).toFixed(2);
  }

  selectedVariation(variation: any) {
    // Reset selections
    this.plus = 0;
    this.variation_selected = variation;
    this.sub_variation_selected = null;

    // Add the variation price adjustment
    this.plus = variation.add_price;

    // Force change detection
    this.cdr.detectChanges();

    // Apply styles after a short delay
    setTimeout(() => {
      this.applyButtonStyles();
    }, 50);
  }

  closeModal() {
  const modalEl = document.getElementById('productModal');
  if (!modalEl) return;

  modalEl.classList.remove('show');
  modalEl.setAttribute('aria-hidden', 'true');
  modalEl.style.display = 'none';

  document.body.classList.remove('modal-open');

  const backdrop = document.querySelector('.modal-backdrop');
  if (backdrop) backdrop.remove();
}

  comprarAhora() {
  if (!this.cartService.authService.user) {
    this.toastr.error('Error', 'Ingrese a la tienda');
    this.router.navigateByUrl("/login");
    return;
  }

  let product_variation_id = null;

  // Validaciones de variaciones (igual que addCart)
  if (this.product_selected.variations && this.product_selected.variations.length > 0) {
    if (!this.variation_selected) {
      this.toastr.error('Error', 'Necesitas seleccionar una variacion');
      return;
    }

    if (
      this.variation_selected.subvariations &&
      this.variation_selected.subvariations.length > 0 &&
      !this.sub_variation_selected
    ) {
      this.toastr.error('Error', 'Necesitas seleccionar una caracteristica');
      return;
    }
  }

  if (this.variation_selected) {
    if (!this.variation_selected.subvariations?.length) {
      product_variation_id = this.variation_selected.id;
    } else if (this.sub_variation_selected) {
      product_variation_id = this.sub_variation_selected.id;
    }
  }

  const input = document.getElementById("tp-cart-input-val") as HTMLInputElement | null;
  const quantity = input ? parseInt(input.value) || 1 : 1;

  let discount_g = this.product_selected.discount_g ?? null;

  const currentPrice = this.getBasePrice(this.product_selected);
  const discountedTotal = discount_g
    ? parseFloat(this.getNewTotal(this.product_selected, discount_g))
    : currentPrice;

  const data = {
    product_id: this.product_selected.id,
    type_discount: discount_g?.type_discount ?? null,
    discount: discount_g?.discount ?? null,
    type_campaing: discount_g?.type_campaing ?? null,
    code_cupon: null,
    code_discount: discount_g?.code ?? null,
    product_variation_id,
    quantity,
    price_unit: currentPrice,
    subtotal: discountedTotal,
    total: discountedTotal * quantity,
    currency: this.currency,
  };

  // 1️⃣ Vaciar carrito
  this.cartService.deleteCartsAll().subscribe(() => {

    // 2️⃣ Agregar producto
    this.cartService.registerCart(data).subscribe((resp: any) => {
      if (resp.message == 403) {
        this.toastr.error('Error', resp.message_text);
      } else {
        this.cartService.changeCart(resp.cart);

        // 3️⃣ Redirigir directo al carrito
        this.closeModal();

        this.router.navigateByUrl('/carrito-de-compra').then(() => {
          window.location.reload();
        });
      }
    });

  });
}


  selectedSubVariation(subvariation: any) {
    // Reset to just the main variation price
    this.plus = this.variation_selected ? this.variation_selected.add_price : 0;
    this.sub_variation_selected = subvariation;

    // Add the subvariation price adjustment
    this.plus += subvariation.add_price;

    // Force change detection
    this.cdr.detectChanges();
  }

  addCart() {
    if (!this.cartService.authService.user) {
      this.toastr.error('Error', 'Ingrese a la tienda');
      this.router.navigateByUrl("/login");
      return;
    }

    let product_variation_id = null;
    // Check if product has variations and validate selection
    if (this.product_selected.variations && this.product_selected.variations.length > 0) {
      if (!this.variation_selected) {
        this.toastr.error('Error', 'Necesitas seleccionar una variacion');
        return;
      }

      if (this.variation_selected && this.variation_selected.subvariations &&
          this.variation_selected.subvariations.length > 0) {
        if (!this.sub_variation_selected) {
          this.toastr.error('Error', 'Necesitas seleccionar una caracteristica');
          return;
        }
      }
    }

    // Determine the variation ID to use
    if (this.product_selected.variations && this.product_selected.variations.length > 0 && this.variation_selected) {
      if (this.variation_selected.subvariations && this.variation_selected.subvariations.length == 0) {
        product_variation_id = this.variation_selected.id;
      } else if (this.variation_selected.subvariations && this.variation_selected.subvariations.length > 0 && this.sub_variation_selected) {
        product_variation_id = this.sub_variation_selected.id;
      }
    }

    const input = document.getElementById("tp-cart-input-val") as HTMLInputElement | null;
    const quantity = input ? parseInt(input.value) || 1 : 1;

    let discount_g = null;
    if (this.product_selected.discount_g) {
      discount_g = this.product_selected.discount_g;
    }

    const currentPrice = this.getBasePrice(this.product_selected);
    const discountedTotal = discount_g ?
      parseFloat(this.getNewTotal(this.product_selected, discount_g)) :
      currentPrice;

    let data = {
      product_id: this.product_selected.id,
      type_discount: discount_g ? discount_g.type_discount : null,
      discount: discount_g ? discount_g.discount : null,
      type_campaing: discount_g ? discount_g.type_campaing : null,
      code_cupon: null,
      code_discount: discount_g ? discount_g.code : null,
      product_variation_id: product_variation_id,
      quantity: quantity,
      price_unit: currentPrice,
      subtotal: discountedTotal,
      total: discountedTotal * quantity,
      currency: this.currency,
    };

    this.cartService.registerCart(data).subscribe((resp: any) => {
      console.log(resp);
      if (resp.message == 403) {
        this.toastr.error('Error', resp.message_text);
      } else {
        this.cartService.changeCart(resp.cart);
        this.toastr.success('Exito', 'El producto se agrego al carrito de compra');
      }
    }, err => {
      console.log(err);
    });
  }
}
