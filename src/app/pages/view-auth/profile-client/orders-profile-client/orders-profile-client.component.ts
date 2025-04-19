import { Component } from '@angular/core';
import { ProfileClientService } from '../service/profile-client.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-orders-profile-client',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './orders-profile-client.component.html',
  styleUrl: './orders-profile-client.component.css'
})
export class OrdersProfileClientComponent {

  sales: any = [];

  sale_detail_review:any;

  rating:number = 0;

  message: string = '';
  constructor(
    public profileClient: ProfileClientService
  ) {

    this.profileClient.showOrders().subscribe((resp:any) => {
      console.log(resp);
      this.sales = resp.sales.data;
    })

  }

  detailShow(sale:any){
    sale.sale_detail_show = !sale.sale_detail_show;
  }
  reviewShow(sale_detail:any){
    this.sale_detail_review = sale_detail;
  }

  selectedRating(val:number){
    this.rating = val;
  }

  backlist(){
    this.sale_detail_review = null;
    this.rating = 0;
    this.message = '';
  }

}
