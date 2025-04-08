import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
    if (DISCOUNT_FLASH_P.type_discount == 1) { //% de descuento
      return (DISCOUNT_FLASH_PRODUCT.price_ars - (DISCOUNT_FLASH_PRODUCT.price_ars * (DISCOUNT_FLASH_P.discount * 0.01))).toFixed(2);
    } else { //monto fijo /-pesos -dolares
      return (DISCOUNT_FLASH_PRODUCT.price_ars - DISCOUNT_FLASH_P.discount).toFixed(2);
    }
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
      return DISCOUNT_FLASH_PRODUCT.price_ars;
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
}
