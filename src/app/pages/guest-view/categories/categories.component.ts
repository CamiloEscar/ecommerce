import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HomeService } from '../../home/service/home.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {

  categories: any[] = [];

  constructor(private homeService: HomeService) {}

  ngOnInit(): void {
    this.homeService.menus().subscribe((resp: any) => {
      const menus = resp.categories_menus || [];

      // Aplanar categorías de segundo nivel
      this.categories = menus.flatMap((dep: any) => dep.categories || []);
    });
  }
}
