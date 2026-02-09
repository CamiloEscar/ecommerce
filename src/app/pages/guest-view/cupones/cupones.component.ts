import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../home/service/cart.service';

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

  constructor(private cartService: CartService) {}

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
}
