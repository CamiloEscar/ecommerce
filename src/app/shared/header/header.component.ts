import { afterNextRender, Component } from '@angular/core';
import { HomeService } from '../../pages/home/service/home.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {

  categories_menus: any = [];


  constructor(public homeService: HomeService) {
    afterNextRender(() => {
      this.homeService.menus().subscribe((resp: any) => {
        console.log(resp);
        this.categories_menus = resp.categories_menus;
      });
    });
  }
  getIconMenu(MENU_CAT:any){
    var miDiv: any = document.getElementById('icon-' + MENU_CAT.id);
    miDiv.innerHTML = MENU_CAT.icon;
    return '';
  }
}
