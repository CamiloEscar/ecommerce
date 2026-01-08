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
  currency:string= 'ARS';
  listCarts: any = [];
  totalCarts:number = 0;
  code_cupon: any;
  code_costo: any;
  constructor(
  public cartService: CartService,
  private cookieService: CookieService,
  private toastr: ToastrService,
 ){

 }

ngOnInit(): void {
  //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
  //Add 'implements OnInit' to the class.
  this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'ARS';
  this.cartService.currentDataCart$.subscribe((resp:any)=> {
    // console.log(resp)
    this.listCarts = resp;
    // actualizar total sin incluir el item SHIPMENT si existe
    this.totalCarts = this.listCarts
      .filter((i:any) => i.id !== 'SHIPPING')
      .reduce((sum:number, item:any) => sum + item.total, 0 );

    // sincronizar costo de envio desde el servicio si existe
    if(this.cartService.shippingCost !== null && this.cartService.shippingCost !== undefined){
      this.costoEnvio = this.cartService.shippingCost;
    }
  })
}

  // subtotal original (sin descuentos, sin envio)
  get subtotalOriginal(){
    return this.listCarts
      .filter((i:any) => i.id !== 'SHIPPING')
      .reduce((sum:number, item:any) => sum + (item.subtotal * (item.quantity || 1)), 0 );
  }

  // subtotal después de aplicar cupones/descuentos (sin envio)
  get subtotalAfterDiscount(){
    return this.listCarts
      .filter((i:any) => i.id !== 'SHIPPING')
      .reduce((sum:number, item:any) => sum + (item.total || 0), 0 );
  }

  get discountTotal(){
    const disc = this.subtotalOriginal - this.subtotalAfterDiscount;
    return disc > 0 ? disc : 0;
  }

  get shippingCostValue(){
    return this.costoEnvio ?? this.cartService.shippingCost ?? 0;
  }

  get grandTotal(){
    return this.subtotalAfterDiscount + (this.shippingCostValue || 0);
  }

  get globalCouponCode(){
    const found = this.listCarts.find((i:any) => i.code_cupon || i.code_discount);
    return found ? (found.code_cupon || found.code_discount) : (this.code_cupon || null);
  }


deleteCart(CART:any){
  this.cartService.deleteCart(CART.id).subscribe((resp:any)=> {  //lo eliminamos del front
    this.toastr.info('Eliminacion', "Se elimino el producto: "+CART.product.title + " del carrito de compra");
    this.cartService.removeCart(CART);                     //lo eliminamos del backend
  })
}

  minusQuantity(cart:any){
    if(cart.quantity == 1){
      this.toastr.error('Validacion', "El valor no puede ser menor a 1");
      return;
    }
    cart.quantity = cart.quantity - 1
    cart.total = cart.subtotal * cart.quantity;
    this.cartService.updateCart(cart.id, cart).subscribe((resp:any) => {
      console.log(resp)
      if(resp.message == 403){
        this.toastr.error('Validacion', resp.message_text);
      } else {
        this.cartService.changeCart(resp.cart);
        this.toastr.info("Exito", "Se actualizo el producto " + resp.cart.product.title)
      }
    })
  }
  plusQuantity(cart:any){
    let quantity_old = cart.quantity;
    cart.quantity = cart.quantity + 1
    cart.total = cart.subtotal * cart.quantity;
    this.cartService.updateCart(cart.id, cart).subscribe((resp:any) => {
      console.log(resp)
      if(resp.message == 403){
        cart.quantity = quantity_old;
        cart.total = cart.subtotal * cart.quantity;
        this.toastr.error('Validacion', resp.message_text);
      } else {
        this.cartService.changeCart(resp.cart);
        this.toastr.info("Exito", "Se actualizo el producto " + resp.cart.product.title)
      }
    })
  }
  applyCupon(){
    if(!this.code_cupon){
      this.toastr.error('Validacion', 'Se necesita ingresar un codigo de cupon');
      return;
    }
    let data = {
      code_cupon : this.code_cupon
    }

    this.cartService.applyCupon(data).subscribe((resp:any) => {
      console.log(resp)
      if(resp.message == 403){
        this.toastr.error("Validacion", resp.message_text);
        return;
      } else {
        this.cartService.resetCart();
        this.cartService.listCart().subscribe((resp:any) => {
          resp.carts.data.forEach((cart:any) => {
            this.cartService.changeCart(cart)
          });
          // si hay un costo de envío aplicado en el servicio, reaplicarlo como ítem
          if(this.cartService.shippingCost){
            this.cartService.setShipping(this.cartService.shippingCost);
          }
        })
      }
    })
  }
  // applyCosto(){
  //   if(!this.code_costo){
  //     this.toastr.error('Validacion', 'Se necesita ingresar un codigo de cupon');
  //     return;
  //   }
  //   let data = {
  //     code_costo : this.code_costo
  //   }

  //   this.cartService.applyCosto(data).subscribe((resp:any) => {
  //     console.log(resp)
  //     if(resp.message == 403){
  //       this.toastr.error("Validacion", resp.message_text);
  //       return;
  //     } else {
  //       this.cartService.resetCart();
  //       this.cartService.listCart().subscribe((resp:any) => {
  //         resp.carts.data.forEach((cart:any) => {
  //           this.cartService.changeCart(cart)
  //         });
  //       })
  //     }
  //   })
  // }

  selectedProvinceCode: string | null = null;
  costoEnvio: number | null = null;

  applyCosto() {
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
      // persistir en el servicio para que sobreviva a recargas
      this.cartService.setShipping(this.costoEnvio);
      this.cartService.resetCart();
      this.cartService.listCart().subscribe((resp: any) => {
        resp.carts.data.forEach((cart: any) => {
          this.cartService.changeCart(cart);
        });
      });
      this.toastr.success("Éxito", "Se aplicó el costo de envío");
    }
  });
}

removeProvincia() {
  this.selectedProvinceCode = null;
  this.costoEnvio = null;
  this.cartService.setShipping(null);

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
