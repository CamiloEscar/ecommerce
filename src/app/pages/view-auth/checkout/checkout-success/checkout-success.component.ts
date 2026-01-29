// import { Component } from '@angular/core';
// import { CartService } from '../../../home/service/cart.service';
// import { ActivatedRoute, Router } from '@angular/router';
// import { CookieService } from 'ngx-cookie-service';
// import { ToastrService } from 'ngx-toastr';

// @Component({
//   selector: 'app-checkout-success',
//   standalone: true,
//   imports: [],
//   templateUrl: './checkout-success.component.html',
//   styleUrl: './checkout-success.component.css'
// })
// export class CheckoutSuccessComponent {

//   payment_id:string = '';
//   preference_id:string = '';
//   currency:string = 'ARS';

//   constructor(
//     public cartService: CartService,
//     public activatedRoute: ActivatedRoute,
//     public cookieService: CookieService,
//     public toastr: ToastrService,
//     public router: Router
//   ){

//   }

//   ngOnInit(): void {
//     //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
//     //Add 'implements OnInit' to the class.
//     this.activatedRoute.queryParams.subscribe((resp:any) => {
//       console.log(resp)
//       this.payment_id = resp.payment_id;
//       this.preference_id = resp.preference_id;
//     });

//     this.currency = this.cookieService.get("currency") || 'ARS';
//     let data = {
//             method_payment: 'MERCADOPAGO',
//             currency_total: this.currency,
//             currency_payment: 'ARS',
//             price_dolar: 0,
//             n_transaccion: this.payment_id,
//             preference_id: this.preference_id,
//             // description: this.description,
//             // sale_address: {
//             //   name: this.name,
//             //   surname: this.surname,
//             //   company: this.company,
//             //   country_region: this.country_region,
//             //   address: this.address,
//             //   street: this.street,
//             //   city: this.city,
//             //   postcode_zip: this.postcode_zip,
//             //   phone: this.phone,
//             //   email: this.email,
//             // }
//     }
//     this.cartService.checkoutMercadoPago(data).subscribe((resp) => {
//       console.log(resp)
//       this.toastr.success("Exito", "Compra realizada");
//       this.cartService.resetCart();
//       this.router.navigateByUrl("/gracias-por-tu-compra/"+this.payment_id)
//     });
//   }
// }

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-checkout-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout-success.component.html',
  styleUrl: './checkout-success.component.css'
})
export class CheckoutSuccessComponent implements OnInit {

  paymentId: string = '';
  status: string = '';
  isProcessing: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log('Parámetros recibidos:', params);

      this.paymentId = params['payment_id'] || '';
      this.status = params['status'] || '';

      if (this.status === 'approved') {
        this.toastr.success('¡Pago aprobado!', 'Tu compra fue procesada exitosamente');

        // Redirigir a la página de "gracias por tu compra"
        setTimeout(() => {
          this.router.navigateByUrl(`/gracias-por-tu-compra/${this.paymentId}`);
        }, 2000);
      } else {
        this.toastr.error('Error', 'Hubo un problema con el pago');
      }
    });
  }
}
