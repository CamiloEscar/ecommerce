import { Component } from '@angular/core';
import { CartService } from '../../home/service/cart.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  listCarts: any = [];
  totalCarts: number = 0;
  currency: string = 'ARS';

  constructor(
    public cartService: CartService,
    public cookieService: CookieService,
  ){

  }
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.currency = this.cookieService.get("currency") || 'ARS';
    this.cartService.currentDataCart$.subscribe((resp:any)=>{
      this.listCarts = resp;
      this.totalCarts = this.listCarts.reduce((sum:number, item:any) => sum + item.total, 0 ).toFixed(2);
    })
  }
}
