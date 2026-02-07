import { afterNextRender, Component, ElementRef, ViewChild } from '@angular/core';
import { CartService } from '../../home/service/cart.service';
import { CookieService } from 'ngx-cookie-service';
import { UserAddressService } from '../service/user-address.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DolarService } from '../service/dolar.service';

// declare var paypal:any;
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

  price_dolar:number = 1500;

  paymentAliasList = [
  'FUNKO.PAGO.OFICIAL',
  'POPFUN.TRANSFER',
  'FUNKO.STORE.PAY',
  'POP.COLLECTOR.AR',
  'FUNKO.VERSE.PAGO',
  'POP.MANIA.CBU',
  'FUNKO.LAND.PAY',
  'POP.HEROES.TRANSFER',
  'FUNKO.POP.SHOP',
  'POP.UNIVERSE.AR'
];

paymentAlias: string = '';
//TODO: REVISAR ESTE METODO PARA EL BRICK DE MERCADO PAGO
preferenceId: string | null = null;
  loadingPayment: boolean = false;
  mp: any; // Instancia de Mercado Pago

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
//TODO: REVISAR ESTE METODO PARA EL BRICK DE MERCAOD PAGO
    // 1. INICIALIZAR MERCADO PAGO AL CARGAR EL COMPONENTE
    // Reemplaza 'TU_PUBLIC_KEY' con tu clave pública real
    this.mp = new MercadoPago('TEST-8d1841e1-ba74-4790-a451-60adea26788b', {
      locale: 'es-AR'
    });

    this.cartService.currentDataCart$.subscribe((resp:any)=>{
      this.listCarts = resp;
      this.totalCarts = Number(this.listCarts.reduce((sum:number, item:any) => sum + item.total, 0 ).toFixed(2));
      this.generatePaymentAlias();
    })

    // paypal.Buttons({
    //   // optional styling for buttons
    //   // https://developer.paypal.com/docs/checkout/standard/customize/buttons-style-guide/
    //   style: {
    //     color: "gold",
    //     shape: "rect",
    //     layout: "vertical"
    //   },

    //   // set up the transaction
    //   createOrder: (data:any, actions:any) => {
    //       // pass in any options from the v2 orders create call:
    //       // https://developer.paypal.com/api/orders/v2/#orders-create-request-body
    //     console.log(this.totalPaypal())
    //       if(this.totalCarts == 0){
    //         this.toastr.error("Validacion", "No puedes procesar el pago con un monto de 0")
    //         return;
    //       }

    //       if(this.listCarts.length == 0){
    //         this.toastr.error("Validacion", "No puedes procesar el pago si no tienes nada cargado")
    //         return;
    //       }

    //       if(
    //         !this.name ||
    //         !this.surname ||
    //         !this.company ||
    //         !this.country_region ||
    //         !this.address ||
    //         !this.street ||
    //         !this.city ||
    //         !this.postcode_zip ||
    //         !this.phone ||
    //         !this.email
    //       ){
    //         this.toastr.error("Validacion", "Todos los campos de la direccion son necesarios");
    //         return;
    //       }

    //       const createOrderPayload = {
    //         purchase_units: [
    //           {
    //             amount: {
    //                 description: "COMPRAR POR EL FUNKO ECOMMERCE",
    //                 value: this.totalPaypal(),
    //             }
    //           }
    //         ]
    //       };

    //       return actions.order.create(createOrderPayload);
    //   },

    //   // finalize the transaction
    //   onApprove: async (data:any, actions:any) => {

    //       let Order = await actions.order.capture();
    //       // Order.purchase_units[0].payments.captures[0].id

    //       let dataSale = {
    //         method_payment: 'PAYPAL',
    //         currency_total: this.currency,
    //         currency_payment: 'USD',
    //         discount: 0,
    //         subtotal: this.totalPaypal(),
    //         total: this.totalPaypal(),
    //         price_dolar: 0,
    //         n_transaccion: Order.purchase_units[0].payments.captures[0].id,
    //         description: this.description,
    //         sale_address: {
    //           name: this.name,
    //           surname: this.surname,
    //           company: this.company,
    //           country_region: this.country_region,
    //           address: this.address,
    //           street: this.street,
    //           city: this.city,
    //           postcode_zip: this.postcode_zip,
    //           phone: this.phone,
    //           email: this.email,
    //         }
    //       }
    //       this.cartService.checkout(dataSale).subscribe((resp:any) =>{
    //         console.log(resp)
    //         this.toastr.success("Exito", "Compra realizada");
    //         this.cartService.resetCart();
    //         setTimeout(() => {
    //           this.router.navigateByUrl("/gracias-por-tu-compra/"+Order.purchase_units[0].payments.captures[0].id)
    //         }, 50);
    //         //TODO: redireccion a la pagina de gracias
    //       })

    //       // return actions.order.capture().then(captureOrderHandler);
    //   },

    //   // handle unrecoverable errors
    //   onError: (err:any) => {
    //       console.error('An error prevented the buyer from checking out with PayPal');
    //   }
    // }).render(this.paypalElement?.nativeElement);
    }

    //TODO: REVISAR ESTE METODO PARA EL BRICK DE MERCADO PAGO
  //   createPreference() {
  //   if(this.totalCarts == 0){
  //      this.toastr.error("Validacion", "Monto 0 no permitido"); return;
  //   }
  //   if(this.listCarts.length == 0){
  //      this.toastr.error("Validacion", "Carrito vacío"); return;
  //   }
  //   if( !this.name || !this.surname || !this.email || !this.phone || !this.address || !this.city || !this.postcode_zip || !this.country_region){
  //      this.toastr.error("Validacion", "Completa los datos de envío"); return;
  //   }

  //   this.loadingPayment = true;

  //   // 1. Guardar datos temporales (Tu lógica actual)
  //   let data = {
  //     description: this.description,
  //     sale_address: {
  //       name: this.name,
  //     surname: this.surname,
  //     company: this.company,
  //     country_region: this.country_region,
  //     address: this.address,
  //     street: this.street,
  //     city: this.city,
  //     postcode_zip: this.postcode_zip,
  //     phone: this.phone,
  //     email: this.email,
  //     }
  //   }

  //   this.cartService.storeTemp(data).subscribe((resp: any) => {

  //     // 2. Pedir la preferencia al Backend
  //     this.cartService.mercadopago(this.totalCarts).subscribe((resp: any) => {
  //       console.log("Respuesta MP:", resp);

  //       if (resp && resp.preference && resp.preference.id) {

  //         this.preferenceId = resp.preference.id; // Guardamos el ID
  //         this.loadingPayment = false;

  //         // 3. RENDERIZAR EL BRICK (BOTÓN)
  //         this.renderWalletBrick(this.preferenceId);

  //       } else {
  //         this.toastr.error("Error", "No se pudo generar el pago");
  //         this.loadingPayment = false;
  //       }
  //     }, (error) => {
  //       console.error(error);
  //       this.toastr.error("Error", "Fallo al conectar con Mercado Pago");
  //       this.loadingPayment = false;
  //     });

  //   }, (error) => {
  //     this.toastr.error("Error", "No se pudieron guardar los datos");
  //     this.loadingPayment = false;
  //   });
  // }

  // // Función específica para dibujar el Wallet Brick
  // renderWalletBrick(preferenceId: string | null) {
  //   if (!preferenceId) return;

  //   const bricksBuilder = this.mp.bricks();

  //   bricksBuilder.create("wallet", "wallet_container", {
  //     initialization: {
  //       preferenceId: preferenceId,
  //       redirectMode: 'modal' // Opcional: 'modal' (abre popup) o 'self' (redirige)
  //     },
  //     customization: {
  //       texts: {
  //         valueProp: 'smart_option',
  //       },
  //       visual: {
  //          style: {
  //            theme: 'default' // 'default', 'dark' or 'bootstrap'
  //          }
  //       }
  //     },
  //     callbacks: {
  //       onReady: () => {
  //         console.log('Brick de Mercado Pago listo');
  //       },
  //       onError: (error: any) => {
  //         console.error('Error en Brick MP:', error);
  //       },
  //     },
  //   });
  // }

    generatePaymentAlias() {
  const index = Math.floor(Math.random() * this.paymentAliasList.length);
  this.paymentAlias = this.paymentAliasList[index];
}

    openMercadoPago(){
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

  // Primero guardar datos temporales
  let data = {
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

  this.cartService.storeTemp(data).subscribe((resp: any) => {
    console.log("Datos temporales guardados");

    // Ahora crear la preferencia de pago
    this.cartService.mercadopago(this.totalCarts).subscribe((resp: any) => {
      console.log("Respuesta de Mercado Pago:", resp);

      if (resp && resp.preference) {
        // 🔥 USAR SANDBOX PARA PRUEBAS
        const checkoutUrl = resp.preference.sandbox_init_point || resp.preference.init_point;

        console.log("Redirigiendo a:", checkoutUrl);

        // Redirigir al usuario a Mercado Pago
        window.location.href = checkoutUrl;
      } else {
        this.toastr.error("Error", "No se pudo generar la preferencia de pago");
      }
    }, (error) => {
      console.error("Error al crear preferencia:", error);
      this.toastr.error("Error", "No se pudo conectar con Mercado Pago");
    });
  }, (error) => {
    console.error("Error al guardar datos temporales:", error);
    this.toastr.error("Error", "No se pudieron guardar los datos");
  });
}
  // totalPaypal(){
  //   if(this.currency == 'USD'){
  //     return this.totalCarts;
  //   } else {
  //     return (this.totalCarts / this.price_dolar).toFixed(2);
  //   }
  // }


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
      //console.log(resp);
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
      //console.log(resp);
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

  // ========== CÁLCULOS MEJORADOS Y DETALLADOS ==========

  // Subtotal SIN descuentos (precio original * cantidad)
  get subtotalOriginal(): number {
    return Number(
      this.listCarts
        .filter((item: any) => item.id !== 'SHIPPING') // Excluir item de envío si existe
        .reduce((sum: number, item: any) => {
          // Usar price_unit si existe (precio original), sino usar subtotal
          const precioUnitario = item.price_unit ?? item.subtotal;
          return sum + (precioUnitario * item.quantity);
        }, 0)
        .toFixed(2)
    );
  }

  // Subtotal CON descuentos aplicados (después de cupones/campañas)
  get subtotalAfterDiscount(): number {
    return Number(
      this.listCarts
        .filter((item: any) => item.id !== 'SHIPPING') // Excluir item de envío si existe
        .reduce((sum: number, item: any) => sum + Number(item.total || 0), 0)
        .toFixed(2)
    );
  }

  // Total de descuentos aplicados
  get discountTotal(): number {
    const disc = this.subtotalOriginal - this.subtotalAfterDiscount;
    return Number((disc > 0 ? disc : 0).toFixed(2));
  }

  // Obtener código de cupón/campaña global si existe
  get globalCouponCode(): string | null {
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

  // Verificar si TODOS los productos tienen envío gratis (cost = 1)
  get hasFreeShipping(): boolean {
    if (!this.listCarts || this.listCarts.length === 0) {
      return false;
    }

    return this.listCarts
      .filter((item: any) => item.id !== 'SHIPPING')
      .every((item: any) => item.product && item.product.cost == 1);
  }

  // Costo de envío
  get shippingCostValue(): number {
    // Si todos los productos tienen envío gratis, el costo es 0
    if (this.hasFreeShipping) {
      return 0;
    }

    // Buscar si existe un item de envío en el carrito
    const shippingItem = this.listCarts.find(
      (item: any) => item.id === 'SHIPPING'
    );

    if (shippingItem) {
      return Number(shippingItem.total || 0);
    }

    // Si hay costo de envío en el servicio
    if (this.cartService.shippingCost !== null && this.cartService.shippingCost !== undefined) {
      return Number(this.cartService.shippingCost);
    }

    return 0;
  }

  // Total final (subtotal con descuento + envío)
  get grandTotal(): number {
    return Number(
      (this.subtotalAfterDiscount + this.shippingCostValue).toFixed(2)
    );
  }

  // Verificar si AL MENOS UN producto tiene envío gratis
  get hasSomeFreeShipping(): boolean {
    if (!this.listCarts || this.listCarts.length === 0) {
      return false;
    }

    return this.listCarts
      .filter((item: any) => item.id !== 'SHIPPING')
      .some((item: any) => item.product && Number(item.product.cost) === 1);
  }
}
