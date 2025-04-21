import { Component } from '@angular/core';
import { HomeService } from '../../home/service/home.service';

@Component({
  selector: 'app-filter-advance',
  standalone: true,
  imports: [],
  templateUrl: './filter-advance.component.html',
  styleUrl: './filter-advance.component.css'
})
export class FilterAdvanceComponent {

  Categories:any = [];
  Colors:any = [];
  Brands:any = [];



  PRODUCTS: any = [];

  constructor(
    public homeService: HomeService,

  ) {

    this.homeService.getConfigFilter().subscribe((resp:any) => {
      console.log(resp)
    })
  }

}
