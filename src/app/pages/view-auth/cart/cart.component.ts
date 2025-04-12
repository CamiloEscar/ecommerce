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
    console.log(resp)
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


}
