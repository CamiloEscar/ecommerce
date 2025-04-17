import { afterNextRender, Component, ElementRef, ViewChild } from '@angular/core';
import { CartService } from '../../home/service/cart.service';
import { CookieService } from 'ngx-cookie-service';
import { UserAddressService } from '../service/user-address.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DolarService } from '../service/dolar.service';

declare var paypal:any;
declare var MercadoPago:any;
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
  description:string = '';

  address_selected: any;

  @ViewChild('paypal',{static: true}) paypalElement?: ElementRef;
  PREFERENCE_ID:string = '';

  price_dolar:number = 1200;
  constructor(
    public cartService: CartService,
    public cookieService: CookieService,
    public addressService: UserAddressService,
    private toastr: ToastrService,
    public router: Router,
    // private dolarService: DolarService
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
    //TODO: ERROR DE LA API CON PAYPAL
    // this.dolarService.obtenerDolar().subscribe((resp: any) => {
    //   this.price_dolar = resp.value_sell;
    // });
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
        console.log(this.totalPaypal())
          if(this.totalCarts == 0){
            this.toastr.error("Validacion", "No puedes procesar el pago con un monto de 0")
            return;
          }

          if(this.listCarts.length == 0){
            this.toastr.error("Validacion", "No puedes procesar el pago si no tienes nada cargado")
            return;
          }

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
            this.toastr.error("Validacion", "Todos los campos de la direccion son necesarios");
            return;
          }

          const createOrderPayload = {
            purchase_units: [
              {
                amount: {
                    description: "COMPRAR POR EL FUNKO ECOMMERCE",
                    value: this.totalPaypal(),
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

          let dataSale = {
            method_payment: 'PAYPAL',
            currency_total: this.currency,
            currency_payment: 'USD',
            discount: 0,
            subtotal: this.totalPaypal(),
            total: this.totalPaypal(),
            price_dolar: 0,
            n_transaccion: Order.purchase_units[0].payments.captures[0].id,
            description: this.description,
            sale_address: {
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
          }
          this.cartService.checkout(dataSale).subscribe((resp:any) =>{
            console.log(resp)
            this.toastr.success("Exito", "Compra realizada");
            this.cartService.resetCart();
            setTimeout(() => {
              this.router.navigateByUrl("/gracias-por-tu-compra/"+Order.purchase_units[0].payments.captures[0].id)
            }, 50);
            //TODO: redireccion a la pagina de gracias
          })

          // return actions.order.capture().then(captureOrderHandler);
      },

      // handle unrecoverable errors
      onError: (err:any) => {
          console.error('An error prevented the buyer from checking out with PayPal');
      }
    }).render(this.paypalElement?.nativeElement);
    }
  totalPaypal(){
    if(this.currency == 'USD'){
      return this.totalCarts;
    } else {
      return (this.totalCarts / this.price_dolar).toFixed(2);
    }
  }

  openMercadoPago(){
    this.cartService.mercadopago(this.totalCarts).subscribe((resp:any) => {
      console.log(resp)

    this.PREFERENCE_ID = resp.preference.id

    const mp = new MercadoPago('TEST-8d1841e1-ba74-4790-a451-60adea26788b')
    const bricksBuilder = mp.bricks();

    mp.checkout({
      preference: {
        id: this.PREFERENCE_ID,
      },
      render: {
        container: "#wallet_container",
        label: "Pagar",
      },
      callback: (response:any) => {
        console.log(response);
        if (response.status === 'approved') {
          console.log('Pago aprobado. Detalles:', response);
        } else {
          console.log('Pago no aprobado o cancelado. Detalles:', response);
        }
      },
    })
    });
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
