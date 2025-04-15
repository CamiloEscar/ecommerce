import { afterNextRender, Component, ElementRef, ViewChild } from '@angular/core';
import { CartService } from '../../home/service/cart.service';
import { CookieService } from 'ngx-cookie-service';
import { UserAddressService } from '../service/user-address.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

declare var paypal:any;
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

  address_selected: any;

  @ViewChild('paypal',{static: true}) paypalElement?: ElementRef;
  constructor(
    public cartService: CartService,
    public cookieService: CookieService,
    public addressService: UserAddressService,
    private toastr: ToastrService,
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
    paypal.Buttons({
      // optional styling for buttons
      // https://developer.paypal.com/docs/checkout/standard/customize/buttons-style-guide/
      style: {
        color: "gold",
        shape: "rect",
        layout: "vertical"
      },

      // set up the transaction
      createOrder: (data:any, actions:any) => {
          // pass in any options from the v2 orders create call:
          // https://developer.paypal.com/api/orders/v2/#orders-create-request-body

          const createOrderPayload = {
            purchase_units: [
              {
                amount: {
                    description: "COMPRAR POR EL ECOMMERCE",
                    value: this.totalCarts
                }
              }
            ]
          };

          return actions.order.create(createOrderPayload);
      },

      // finalize the transaction
      onApprove: async (data:any, actions:any) => {

          let Order = await actions.order.capture();
  // Order.purchase_units[0].payments.captures[0].id

          // return actions.order.capture().then(captureOrderHandler);
      },

      // handle unrecoverable errors
      onError: (err:any) => {
          console.error('An error prevented the buyer from checking out with PayPal');
      }
  }).render(this.paypalElement?.nativeElement);
  }

  registerAddress(){
    if(
      !this.name ||
      !this.surname ||
      !this.company ||
      !this.country_region ||
      !this.address ||
      !this.street ||
      !this.city ||
      !this.postcode_zip ||
      !this.phone ||
      !this.email
    ){
      this.toastr.error("Validacion", "Todos los campos son necesarios");
      return;
    }

    let data = {
      name: this.name,
      surname: this.surname,
      company: this.company,
      country_region: this.country_region,
      address: this.address,
      street: this.street,
      city: this.city,
      postcode_zip: this.postcode_zip,
      phone: this.phone,
      email: this.email,
    }
    this.addressService.registerAddress(data).subscribe((resp:any) => {
      console.log(resp);
      this.toastr.success("Validacion", "Registro exitoso");
      this.address_list.unshift(resp.addres);
    })
  }


  editAddress(){
    if(
      !this.name ||
      !this.surname ||
      !this.company ||
      !this.country_region ||
      !this.address ||
      !this.street ||
      !this.city ||
      !this.postcode_zip ||
      !this.phone ||
      !this.email
    ){
      this.toastr.error("Validacion", "Todos los campos son necesarios");
      return;
    }

    let data = {
      name: this.name,
      surname: this.surname,
      company: this.company,
      country_region: this.country_region,
      address: this.address,
      street: this.street,
      city: this.city,
      postcode_zip: this.postcode_zip,
      phone: this.phone,
      email: this.email,
    }
    this.addressService.updateAddress(this.address_selected.id, data).subscribe((resp:any) => {
      console.log(resp);
      this.toastr.success("Validacion", "Edicion Realizada");
      let INDEX = this.address_list.findIndex((item:any) => item.id == resp.addres.id)
      if(INDEX != -1){
        this.address_list[INDEX] = resp.addres;
      }
    })
  }

  selectedAddress(addres:any){
    this.address_selected = addres;
    this.name = this.address_selected.name;
    this.surname = this.address_selected.surname;
    this.company = this.address_selected.company;
    this.country_region = this.address_selected.country_region;
    this.address = this.address_selected.address;
    this.street = this.address_selected.street;
    this.city = this.address_selected.city;
    this.postcode_zip = this.address_selected.postcode_zip;
    this.phone = this.address_selected.phone;
    this.email = this.address_selected.email;
  }

  resetAddress(){
    this.address_selected = null;
    this.name = '';
    this.surname = '';
    this.company = '';
    this.country_region = '';
    this.address = '';
    this.street = '';
    this.city = '';
    this.postcode_zip = '';
    this.phone = '';
    this.email = '';
  }
}
