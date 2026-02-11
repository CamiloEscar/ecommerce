import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../home/service/cart.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cupones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cupones.component.html',
  styleUrl: './cupones.component.css'
})
export class CuponesComponent implements OnInit {

  cupones: any[] = [];
  loading: boolean = true;
  code_cupon: any;

  constructor(private cartService: CartService,
              private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.listarCupones();
  }

  listarCupones() {
    this.cartService.listCupones().subscribe({
      next: (resp: any) => {
        this.cupones = resp.cupones || resp || [];
        this.loading = false;
        console.log(this.cupones);
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  getDiscountText(cupon: any): string {
    if (cupon.type_discount === 1) {
      return cupon.discount + '%';
    }
    return '$' + cupon.discount;
  }

  getTypeLabel(type: number): string {
    switch (type) {
      case 1:
        return 'Cupón general';
      case 2:
        return 'Cupón por categoría';
      case 3:
        return 'Cupón por producto';
      default:
        return 'Cupón especial';
    }
  }

    applyCupon(code: string) {
  if (!code) {
    this.toastr.error('Validacion', 'Se necesita ingresar un codigo de cupon');
    return;
  }

  let data = {
    code_cupon: code
  };

  this.cartService.applyCupon(data).subscribe((resp: any) => {
    console.log(resp);
    if (resp.message == 403) {
      this.toastr.error("Validacion", resp.message_text);
      return;
    } else {
      // Recargar el carrito completo
      this.cartService.resetCart();
      this.cartService.listCart().subscribe((resp: any) => {
        this.cartService.setCart(resp.carts.data);
        this.toastr.success("Éxito", "Se aplicó el cupón correctamente");
      });
    }
  });
}

}
