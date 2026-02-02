import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CartService } from '../../home/service/cart.service';
import { CookieService } from 'ngx-cookie-service';
import { RouterModule } from '@angular/router';
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

  constructor(
    public cartService: CartService,
    private cookieService: CookieService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'ARS';

    this.cartService.currentDataCart$.subscribe((resp: any) => {
      // Filtrar cualquier item de envío que pudiera venir del backend
      this.listCarts = resp.filter((i: any) => i.id !== 'SHIPPING');

      // Actualizar total sin incluir el item SHIPMENT si existe
      this.totalCarts = this.listCarts.reduce((sum: number, item: any) => sum + item.total, 0);

      // Sincronizar costo de envío desde el servicio si existe
      if (this.cartService.shippingCost !== null && this.cartService.shippingCost !== undefined) {
        this.costoEnvio = this.cartService.shippingCost;
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

  // subtotal original (sin descuentos, sin envio)
  get subtotalOriginal() {
    return this.listCarts.reduce((sum: number, item: any) => sum + (item.subtotal * (item.quantity || 1)), 0);
  }

  // subtotal después de aplicar cupones/descuentos (sin envio)
  get subtotalAfterDiscount() {
    return this.listCarts.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
  }

  get discountTotal() {
    const disc = this.subtotalOriginal - this.subtotalAfterDiscount;
    return disc > 0 ? disc : 0;
  }

  get shippingCostValue() {
    // Si todos los productos tienen envío gratis, el costo es 0
    if (this.hasFreeShipping) {
      return 0;
    }
    return this.costoEnvio ?? 0;
  }

  get grandTotal() {
    return this.subtotalAfterDiscount + this.shippingCostValue;
  }

  get globalCouponCode() {
    const found = this.listCarts.find((i: any) => i.code_cupon || i.code_discount);
    return found ? (found.code_cupon || found.code_discount) : (this.code_cupon || null);
  }

  deleteCart(CART: any) {
    this.cartService.deleteCart(CART.id).subscribe((resp: any) => {
      this.toastr.info('Eliminacion', "Se elimino el producto: " + CART.product.title + " del carrito de compra");
      this.cartService.removeCart(CART);
    });
  }

  minusQuantity(cart: any) {
    if (cart.quantity == 1) {
      this.toastr.error('Validacion', "El valor no puede ser menor a 1");
      return;
    }
    cart.quantity = cart.quantity - 1;
    cart.total = cart.subtotal * cart.quantity;
    this.cartService.updateCart(cart.id, cart).subscribe((resp: any) => {
      console.log(resp);
      if (resp.message == 403) {
        this.toastr.error('Validacion', resp.message_text);
      } else {
        this.cartService.changeCart(resp.cart);
        this.toastr.info("Exito", "Se actualizo el producto " + resp.cart.product.title);
      }
    });
  }

  plusQuantity(cart: any) {
    let quantity_old = cart.quantity;
    cart.quantity = cart.quantity + 1;
    cart.total = cart.subtotal * cart.quantity;
    this.cartService.updateCart(cart.id, cart).subscribe((resp: any) => {
      console.log(resp);
      if (resp.message == 403) {
        cart.quantity = quantity_old;
        cart.total = cart.subtotal * cart.quantity;
        this.toastr.error('Validacion', resp.message_text);
      } else {
        this.cartService.changeCart(resp.cart);
        this.toastr.info("Exito", "Se actualizo el producto " + resp.cart.product.title);
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
        this.cartService.resetCart();
        this.cartService.listCart().subscribe((resp: any) => {
          resp.carts.data.forEach((cart: any) => {
            this.cartService.changeCart(cart);
          });
          this.toastr.success("Éxito", "Se aplicó el cupón correctamente");
        });
      }
    });
  }

  applyCosto() {
    // PRIORIDAD MÁXIMA: Verificar si TODOS los productos tienen envío gratis (cost = 1)
    // Si es así, no se aplica ningún costo de envío
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
