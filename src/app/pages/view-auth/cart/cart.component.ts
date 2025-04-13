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
  code_cupon:string = '';

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
      this.totalCarts = this.listCarts.reduce((sum:number, item:any) => sum + item.total, 0 )  //el controlador esta escuchando todo el tiempo, asi que cuando se elimine el controlador actualiza
    })
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
    })
  }
}
