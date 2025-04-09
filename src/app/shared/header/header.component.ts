import { afterNextRender, Component } from '@angular/core';
import { HomeService } from '../../pages/home/service/home.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {

  categories_menus: any = [];
  currency:string = 'ARS';

  constructor(public homeService: HomeService,
              public cookieService: CookieService,
  ) {
    afterNextRender(() => {
      this.homeService.menus().subscribe((resp: any) => {
        console.log(resp);
        this.categories_menus = resp.categories_menus;
      });
      this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'ARS';
    });

  }
  getIconMenu(MENU_CAT:any){
    var miDiv: any = document.getElementById('icon-' + MENU_CAT.id);
    miDiv.innerHTML = MENU_CAT.icon;
    return '';
  }

  changeCurrency(val: string){
    this.cookieService.set("currency", val);

    setTimeout(() => {
      window.location.reload();
    }, 50);
  }
}
