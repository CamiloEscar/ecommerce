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

  constructor(
    public cartService: CartService,
    private cookieService: CookieService,
    private toastr: ToastrService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'ARS';

    this.cartService.currentDataCart$.subscribe((resp: any) => {
      // Filtrar cualquier item de envío que pudiera venir del backend
      this.listCarts = resp.filter((i: any) => i.id !== 'SHIPPING');

      // Actualizar total sin incluir el item SHIPMENT si existe
      this.totalCarts = this.listCarts.reduce((sum: number, item: any) => sum + item.total, 0);

      // Verificar problemas de stock
      this.checkStockIssues();

      // Sincronizar costo de envío desde el servicio si existe
      if (this.cartService.shippingCost !== null && this.cartService.shippingCost !== undefined) {
        this.costoEnvio = this.cartService.shippingCost;
      }
    });
  }

  // Verificar si hay productos sin stock suficiente
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

  // Validar stock y proceder al checkout
  proceedToCheckout() {
    this.cartService.validateStock().subscribe({
      next: (resp: any) => {
        console.log('Respuesta de validación de stock:', resp);

        // Verificar si hay problemas de stock (message === 403)
        if (resp.message === 403) {
          // Construir mensaje detallado
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

          this.toastr.error(mensaje, 'Productos no disponibles', {
            timeOut: 10000,
            enableHtml: true,
            closeButton: true
          });

          // Recargar carrito para actualizar info de stock
          this.cartService.listCart().subscribe((resp: any) => {
            this.cartService.setCart(resp.carts.data);
          });
        } else {
          // Todo OK, proceder al checkout
          this.router.navigate(['/checkout']);
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

  // Verificar si TODOS los productos tienen envío gratis (cost = 1)
  get hasFreeShipping(): boolean {
    if (this.listCarts.length === 0) return false;

    return this.listCarts.every(
      (item: any) => item.product?.cost == 1
    );
  }

  // Verificar si AL MENOS UN producto tiene envío gratis (cost = 1)
  get hasSomeFreeShipping(): boolean {
    return this.listCarts.some((item: any) => item.product && item.product.cost == 1);
  }

  // ========== CÁLCULOS CORREGIDOS ==========

  // Subtotal SIN descuentos (precio original * cantidad)
  get subtotalOriginal() {
    return this.listCarts.reduce((sum: number, item: any) => {
      // Usar price_unit si existe, sino subtotal
      const precioUnitario = item.price_unit ?? item.subtotal;
      return sum + (precioUnitario * item.quantity);
    }, 0);
  }

  // Subtotal CON descuentos aplicados (después de cupones/campañas)
  get subtotalAfterDiscount() {
    return this.listCarts.reduce((sum: number, item: any) => {
      return sum + item.total;
    }, 0);
  }

  // Total de descuentos aplicados
  get discountTotal() {
    const disc = this.subtotalOriginal - this.subtotalAfterDiscount;
    return disc > 0 ? disc : 0;
  }

  // Costo de envío
  get shippingCostValue() {
    // Si todos los productos tienen envío gratis, el costo es 0
    if (this.hasFreeShipping) {
      return 0;
    }
    return this.costoEnvio ?? 0;
  }

  // Total final (subtotal con descuento + envío)
  get grandTotal() {
    return this.subtotalAfterDiscount + this.shippingCostValue;
  }

  // Obtener código de cupón global
  get globalCouponCode() {
    const found = this.listCarts.find((i: any) => i.code_cupon || i.code_discount);
    return found ? (found.code_cupon || found.code_discount) : null;
  }

  // Obtener tipo de descuento
  get discountType() {
    const found = this.listCarts.find((i: any) => i.code_cupon || i.code_discount);
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

  applyCosto() {
    // PRIORIDAD MÁXIMA: Verificar si TODOS los productos tienen envío gratis (cost = 1)
    if (this.hasFreeShipping) {
      this.costoEnvio = 0;
      this.cartService.setShipping(0);
      this.toastr.info('Información', 'Todos los productos en tu carrito tienen envío gratis');
      return;
    }

    if (!this.selectedProvinceCode) {
      this.toastr.error('Validación', 'Se necesita seleccionar una provincia');
      return;
    }

    let data = {
      code_costo: this.selectedProvinceCode
    };

    this.cartService.applyCosto(data).subscribe((resp: any) => {
      console.log(resp);
      if (resp.message == 403) {
        this.toastr.error("Validación", resp.message_text);
        return;
      } else {
        this.costoEnvio = resp.costo ?? 0;
        // Persistir en el servicio para que sobreviva a recargas
        this.cartService.setShipping(this.costoEnvio);
        this.toastr.success("Éxito", "Se aplicó el costo de envío");
      }
    });
  }

  removeProvincia() {
    this.selectedProvinceCode = null;
    this.costoEnvio = null;
    this.cartService.setShipping(null);
    this.toastr.info("Información", "Se removió el costo de envío");
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
