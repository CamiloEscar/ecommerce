import { Component, AfterViewInit } from '@angular/core';
import { CartService } from '../../home/service/cart.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-thank-you-order',
  standalone: true,
  imports: [],
  templateUrl: './thank-you-order.component.html',
  styleUrl: './thank-you-order.component.css'
})
export class ThankYouOrderComponent implements AfterViewInit {

  ORDER_SELECTED: any;
  ORDER_SELECTED_ID: any;

  constructor(
    public cartService: CartService,
    public activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.params.subscribe((params: any) => {
      this.ORDER_SELECTED_ID = params['order'];

      if (this.ORDER_SELECTED_ID) {
        this.cartService.showOrder(this.ORDER_SELECTED_ID).subscribe({
          next: (resp: any) => {
            this.ORDER_SELECTED = resp.sale;
            console.log(this.ORDER_SELECTED);
          },
          error: (err) => {
            console.error('Error al cargar la orden:', err);
          }
        });
      } else {
        console.warn('No se recibió ORDER_SELECTED_ID');
      }
    });
  }

  ngAfterViewInit(): void {
    this.applyBackgroundColors();
  }

  // color bg
  private applyBackgroundColors(): void {
    const elements = document.querySelectorAll<HTMLElement>('[data-bg-color]');
    elements.forEach(el => {
      const bgColor = el.getAttribute('data-bg-color');
      if (bgColor) {
        el.style.backgroundColor = bgColor;
      }
    });
  }
}

