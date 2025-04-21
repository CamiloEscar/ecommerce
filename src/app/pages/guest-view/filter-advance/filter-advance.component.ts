import { Component } from '@angular/core';
import { HomeService } from '../../home/service/home.service';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ModalProductComponent } from '../component/modal-product/modal-product.component';

@Component({
  selector: 'app-filter-advance',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ModalProductComponent],
  templateUrl: './filter-advance.component.html',
  styleUrl: './filter-advance.component.css'
})
export class FilterAdvanceComponent {

  Categories:any = [];
  Colors:any = [];
  Brands:any = [];
  Products_relateds: any = [];



  PRODUCTS: any = [];
  currency: string = 'ARS';

  constructor(
    public homeService: HomeService,
    public cookieService: CookieService,

  ) {

    this.homeService.getConfigFilter().subscribe((resp:any) => {
      console.log(resp)
      this.Categories = resp.categories;
      this.Colors = resp.colors;
      this.Brands = resp.brands;
      this.Products_relateds = resp.product_relateds.data;
    })

    this.homeService.filterAdvanceProduct({}).subscribe((resp:any) => {
      console.log(resp);
    })
  }

  ngOnInit(): void {
    // Set currency FIRST before loading any data
    this.currency = this.cookieService.get("currency") || 'ARS';
    };


  getTotalCurrency(DISCOUNT_FLASH_PRODUCT: any): number {
    // Add null checks
    if (!DISCOUNT_FLASH_PRODUCT) {
      return 0;
    }


    let price: number;

    if (this.currency == 'ARS') {
      if (!DISCOUNT_FLASH_PRODUCT.price_ars) {
        return 0;
      }
      price = DISCOUNT_FLASH_PRODUCT.price_ars;
    } else {
      if (!DISCOUNT_FLASH_PRODUCT.price_usd) {
        return 0;
      }
      price = DISCOUNT_FLASH_PRODUCT.price_usd;
    }

    // Always return a number with 2 decimal places
    return parseFloat(price.toFixed(2));
  }

}
