import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CartService } from '../../home/service/cart.service';
import { CookieService } from 'ngx-cookie-service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  currency: string = 'ARS';
  listCarts: any = [];
  totalCarts: number = 0;
  code_cupon: any;
  selectedProvinceCode: string | null = null;
  costoEnvio: number | null = null;
  hasStockIssues: boolean = false;

  // Umbral para envío gratis por monto (configurable)
  freeShippingThreshold: number = 300000; // $300,000 ARS

  constructor(
    public cartService: CartService,
    private cookieService: CookieService,
    private toastr: ToastrService,
    private router: Router,
  ) {}

ngOnInit(): void {
    this.currency = this.cookieService.get("currency")
      ? this.cookieService.get("currency") : 'ARS';

    this.cartService.currentDataCart$.subscribe((resp: any) => {
      this.listCarts = resp.map((i: any) => ({ ...i })); // deep copy
      this.totalCarts = this.calculateTotalWithStock();
      this.checkStockIssues();

      if (this.cartService.shippingCost !== null && this.cartService.shippingCost !== undefined) {
        this.costoEnvio = this.cartService.shippingCost;
      }
    });

    // Siempre recargar del backend
    this.cartService.listCart().subscribe((resp: any) => {
      this.cartService.resetCart();
      this.cartService.setCart(resp.carts.data);
    });
}

  // Verificar si hay productos sin stock suficiente (solo para mostrar advertencias)
  checkStockIssues() {
    this.hasStockIssues = this.listCarts.some(
      (cart: any) => {
        // Solo verificar si stock_suficiente existe y es explícitamente false
        return cart.stock_suficiente !== null &&
               cart.stock_suficiente !== undefined &&
               cart.stock_suficiente === false;
      }
    );

    console.log('Has stock issues:', this.hasStockIssues);
    console.log('List carts:', this.listCarts);
  }

  // Obtener solo los productos con stock disponible
  get availableProducts() {
    return this.listCarts.filter((cart: any) => cart.stock_suficiente !== false);
  }

  // Obtener productos sin stock
  get outOfStockProducts() {
    return this.listCarts.filter((cart: any) => cart.stock_suficiente === false);
  }

  // Calcular total solo con productos que tienen stock
  calculateTotalWithStock(): number {
    return this.listCarts
      .filter((cart: any) => cart.stock_suficiente !== false)
      .reduce((sum: number, item: any) => sum + item.total, 0);
  }

  // Validar stock y proceder al checkout (ahora permite continuar con productos disponibles)
  proceedToCheckout() {
    // Si NO hay productos con stock disponible, no permitir continuar
    if (this.availableProducts.length === 0) {
      this.toastr.error('No hay productos disponibles en tu carrito', 'Carrito vacío');
      return;
    }

    // Validar stock antes de proceder
    this.cartService.validateStock().subscribe({
      next: (resp: any) => {
        console.log('Respuesta de validación de stock:', resp);

        // Si hay problemas de stock (message === 403)
        if (resp.message === 403) {
          // Construir mensaje informativo
          let mensaje = '';

          if (resp.items_sin_stock && resp.items_sin_stock.length > 0) {
            mensaje += '<strong>PRODUCTOS SIN STOCK:</strong><br>';
            resp.items_sin_stock.forEach((item: any) => {
              mensaje += `• ${item.product_name}<br>`;
            });
            mensaje += '<br>';
          }

          if (resp.items_stock_insuficiente && resp.items_stock_insuficiente.length > 0) {
            mensaje += '<strong>STOCK INSUFICIENTE:</strong><br>';
            resp.items_stock_insuficiente.forEach((item: any) => {
              mensaje += `• ${item.product_name}: Solicitaste ${item.cantidad_solicitada}, disponible ${item.stock_disponible}<br>`;
            });
          }

          // Agregar mensaje informativo sobre continuar
          mensaje += '<br><strong>Los productos sin stock se ignorarán automáticamente en el checkout.</strong>';

          this.toastr.warning(mensaje, 'Atención: Algunos productos no están disponibles', {
            timeOut: 10000,
            enableHtml: true,
            closeButton: true
          });

          // Recargar carrito para actualizar info de stock
          this.cartService.listCart().subscribe((resp: any) => {
            this.cartService.setCart(resp.carts.data);
          });

          // PERMITIR continuar al checkout si hay al menos 1 producto con stock
          if (this.availableProducts.length > 0) {
            setTimeout(() => {
              this.router.navigate(['/proceso-de-pago']);
            }, 1500);
          }
        } else {
          // Todo OK, proceder al checkout
          this.router.navigate(['/proceso-de-pago']);
        }
      },
      error: (error) => {
        console.error('Error al validar stock:', error);

        // Mostrar mensaje específico según el tipo de error
        let mensaje = 'No se pudo validar el stock de los productos';

        if (error.status === 401) {
          mensaje = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente';
        } else if (error.status === 0) {
          mensaje = 'No se pudo conectar con el servidor. Verifica tu conexión a internet';
        }

        this.toastr.error(mensaje, 'Error de validación');
      }
    });
  }

  // Verificar si TODOS los productos CON STOCK tienen envío gratis
  get hasFreeShipping(): boolean {
    const productsWithStock = this.availableProducts;
    if (productsWithStock.length === 0) return false;

    return productsWithStock.every(
      (item: any) => item.product?.cost == 1
    );
  }

  // Verificar si AL MENOS UN producto con stock tiene envío gratis
  get hasSomeFreeShipping(): boolean {
    return this.availableProducts.some((item: any) => item.product && item.product.cost == 1);
  }

  // Verificar si el subtotal supera el umbral para envío gratis
  get qualifiesForFreeShippingByAmount(): boolean {
    return this.subtotalAfterDiscount >= this.freeShippingThreshold;
  }

  // Verificar si el envío es gratis (por productos O por monto)
  get hasFreeShippingOverall(): boolean {
    return this.hasFreeShipping || this.qualifiesForFreeShippingByAmount;
  }

  // ========== CÁLCULOS CORREGIDOS (SOLO PRODUCTOS CON STOCK) ==========

  // Subtotal SIN descuentos (precio original * cantidad) - SOLO PRODUCTOS CON STOCK
  get subtotalOriginal() {
    return this.availableProducts.reduce((sum: number, item: any) => {
      const precioOriginalUnitario = item.price_unit ?? item.product?.price_ars ?? item.subtotal;
      return sum + (precioOriginalUnitario * item.quantity);
    }, 0);
  }

  // Subtotal CON descuentos aplicados - SOLO PRODUCTOS CON STOCK
  get subtotalAfterDiscount() {
    return this.availableProducts.reduce((sum: number, item: any) => {
      return sum + item.total;
    }, 0);
  }

  // Total de descuentos aplicados - SOLO PRODUCTOS CON STOCK
  get discountTotal() {
    const disc = this.subtotalOriginal - this.subtotalAfterDiscount;
    return disc > 0 ? disc : 0;
  }

  // Costo de envío
  get shippingCostValue() {
    // Si todos los productos CON STOCK tienen envío gratis O se supera el umbral, el costo es 0
    if (this.hasFreeShippingOverall) {
      return 0;
    }
    return this.costoEnvio ?? 0;
  }

  // Total final (subtotal con descuento + envío) - SOLO PRODUCTOS CON STOCK
  get grandTotal() {
    return this.subtotalAfterDiscount + this.shippingCostValue;
  }

  // Obtener código de cupón global (de productos con stock)
  get globalCouponCode() {
    const found = this.availableProducts.find((i: any) => i.code_cupon || i.code_discount);
    return found ? (found.code_cupon || found.code_discount) : null;
  }

  // Obtener tipo de descuento
  get discountType() {
    const found = this.availableProducts.find((i: any) => i.code_cupon || i.code_discount);
    if (!found) return null;
    return {
      type: found.type_discount, // 1 = porcentaje, 2 = monto fijo
      value: found.discount,
      isPercentage: found.type_discount == 1
    };
  }

  // ========== ACCIONES ==========

  deleteCart(CART: any) {
    this.cartService.deleteCart(CART.id).subscribe((resp: any) => {
      this.toastr.info('Eliminacion', "Se eliminó el producto: " + CART.product.title + " del carrito de compra");
      this.cartService.removeCart(CART);
    });
  }

  minusQuantity(cart: any) {
    // Mínimo 1
    if (cart.quantity <= 1) return;

    const newQuantity = cart.quantity - 1;

    this.cartService.updateCart(cart.id, {
      quantity: newQuantity
    }).subscribe({
      next: (resp: any) => {
        cart.quantity = newQuantity;
        cart.total = resp.cart.total;
        // Actualizar también subtotal y price_unit si vienen en la respuesta
        if (resp.cart.subtotal) cart.subtotal = resp.cart.subtotal;
        if (resp.cart.price_unit) cart.price_unit = resp.cart.price_unit;
      },
      error: () => {
        cart.quantity++;
      }
    });
  }

  plusQuantity(cart: any) {
    // No sumar si no hay stock suficiente
    if (!cart.stock_suficiente) return;

    // No superar stock disponible
    if (cart.quantity >= cart.stock_disponible) return;

    const newQuantity = cart.quantity + 1;

    this.cartService.updateCart(cart.id, {
      quantity: newQuantity
    }).subscribe({
      next: (resp: any) => {
        cart.quantity = newQuantity;
        cart.total = resp.cart.total;
        // Actualizar también subtotal y price_unit si vienen en la respuesta
        if (resp.cart.subtotal) cart.subtotal = resp.cart.subtotal;
        if (resp.cart.price_unit) cart.price_unit = resp.cart.price_unit;
      },
      error: () => {
        // fallback por seguridad
        cart.quantity--;
      }
    });
  }

  applyCupon() {
    if (!this.code_cupon) {
      this.toastr.error('Validacion', 'Se necesita ingresar un codigo de cupon');
      return;
    }
    let data = {
      code_cupon: this.code_cupon
    };

    this.cartService.applyCupon(data).subscribe((resp: any) => {
      console.log(resp);
      if (resp.message == 403) {
        this.toastr.error("Validacion", resp.message_text);
        return;
      } else {
        // Limpiar el input del cupón
        this.code_cupon = '';

        // Recargar el carrito completo
        this.cartService.resetCart();
        this.cartService.listCart().subscribe((resp: any) => {
          this.cartService.setCart(resp.carts.data);
          this.toastr.success("Éxito", "Se aplicó el cupón correctamente");
        });
      }
    });
  }

// applyCosto: Solo guardar el valor, recargar del backend
applyCosto() {
    // Si el envío es gratis por productos
    if (this.hasFreeShipping) {
      this.costoEnvio = 0;
      this.cartService.shippingCost = 0;
      this.toastr.info('Informacion', 'Todos los productos tienen envio gratis');
      return;
    }

    // Si califica para envío gratis por monto
    if (this.qualifiesForFreeShippingByAmount) {
      this.costoEnvio = 0;
      this.cartService.shippingCost = 0;
      this.toastr.success('¡Felicitaciones!', `Tu compra supera los $${this.freeShippingThreshold.toLocaleString()} - ¡Envío GRATIS!`);
      return;
    }

    if (!this.selectedProvinceCode) {
      this.toastr.error('Validacion', 'Se necesita seleccionar una provincia');
      return;
    }

    let data = { code_costo: this.selectedProvinceCode };

    this.cartService.applyCosto(data).subscribe((resp: any) => {
      if (resp.message == 403) {
        this.toastr.error("Validacion", resp.message_text);
        return;
      }
      this.costoEnvio = resp.costo ?? 0;
      this.cartService.shippingCost = this.costoEnvio;
      // NO setShipping, solo recargar items frescos del backend
      this.cartService.listCart().subscribe((r: any) => {
        this.cartService.resetCart();
        this.cartService.setCart(r.carts.data);
      });
      this.toastr.success("Exito", "Se aplico el costo de envio");
    });
}

// removeProvincia: Limpiar y recargar
removeProvincia() {
    this.selectedProvinceCode = null;
    this.costoEnvio = null;
    this.cartService.shippingCost = null;
    this.cartService.removeCosto().subscribe(() => {
      this.cartService.listCart().subscribe((resp: any) => {
        this.cartService.resetCart();
        this.cartService.setCart(resp.carts.data);
      });
    });
    this.toastr.info("Informacion", "Se removio el costo de envio");
}

  provincias: { name: string, code: string }[] = [
    { name: "BUENOS AIRES", code: "BUENOSAIRES" },
    { name: "CABA", code: "CABA" },
    { name: "CATAMARCA", code: "CATAMARCA" },
    { name: "CHACO", code: "CHACO" },
    { name: "CHUBUT", code: "CHUBUT" },
    { name: "CORDOBA", code: "CORDOBA" },
    { name: "CORRIENTES", code: "CORRIENTES" },
    { name: "ENTRE RIOS", code: "ENTRERIOS" },
    { name: "FORMOSA", code: "FORMOSA" },
    { name: "JUJUY", code: "JUJUY" },
    { name: "LA PAMPA", code: "LAPAMPA" },
    { name: "LA RIOJA", code: "LARIOJA" },
    { name: "MENDOZA", code: "MENDOZA" },
    { name: "MISIONES", code: "MISIONES" },
    { name: "NEUQUÉN", code: "NEUQUEN" },
    { name: "RIO NEGRO", code: "RIONEGRO" },
    { name: "SALTA", code: "SALTA" },
    { name: "SAN JUAN", code: "SANJUAN" },
    { name: "SAN LUIS", code: "SANLUIS" },
    { name: "SANTA CRUZ", code: "SANTACRUZ" },
    { name: "SANTA FE", code: "SANTAFE" },
    { name: "SANTIAGO DEL ESTERO", code: "SANTIAGODELESTERO" },
    { name: "TIERRA DEL FUEGO", code: "TIERRADELFUEGO" },
    { name: "TUCUMÁN", code: "TUCUMAN" },
  ];
}
