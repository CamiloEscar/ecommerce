import { afterNextRender, Component } from '@angular/core';
import { CartService } from '../../home/service/cart.service';
import { CookieService } from 'ngx-cookie-service';
import { UserAddressService } from '../service/user-address.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  listCarts: any = [];
  totalCarts: number = 0;
  currency: string = 'ARS';

  address_list: any = [];

  name:string = '';
  surname:string = '';
  company:string = '';
  country_region:string = '';
  address:string = '';
  street:string = '';
  city:string = '';
  postcode_zip:string = '';
  phone:string = '';
  email:string = '';

  constructor(
    public cartService: CartService,
    public cookieService: CookieService,
    public addressService: UserAddressService,
  ){

    afterNextRender(() => {
      //llamamos al endpoint para que devuelva todas las variables registradas
      this.addressService.listAddress().subscribe((resp:any)=> {
        console.log(resp)
        this.address_list = resp.address;
      })
    })
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
