import { afterNextRender, Component } from '@angular/core';
import { HomeService } from '../../home/service/home.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-landing-product',
  standalone: true,
  imports: [],
  templateUrl: './landing-product.component.html',
  styleUrl: './landing-product.component.css'
})
export class LandingProductComponent {

  PRODUCT_SLUG: any;
  PRODUCT_SELECTED: any;
  constructor(
    public homeService: HomeService,
    public activatedRoute: ActivatedRoute,
    private toastr : ToastrService,
    private router:Router

  ){
    this.activatedRoute.params.subscribe((resp:any)=>{
      this.PRODUCT_SLUG = resp.slug;
    })
    afterNextRender(() => {
      this.homeService.showProducts(this.PRODUCT_SLUG).subscribe((resp:any)=>{
        console.log(resp)
        if(resp.message == 403){
          this.toastr.error('Error', resp.message_text);
          this.router.navigateByUrl('/');
        } else {
          this.PRODUCT_SELECTED = resp.product;

        }

      })
    })
  }
}
