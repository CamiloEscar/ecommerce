import { afterNextRender, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./shared/header/header.component";
import { FooterComponent } from "./shared/footer/footer.component";

//instalacion de ssr colocar afternextrender para renderizarlo luego, por problemas con $

declare var $: any;
declare function HOMEINIT([]): any;
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'ecommerce';
  constructor() {
    afterNextRender(() => {

      setTimeout(() => {
        HOMEINIT($);
      }, 50);
      $(window).on('load', function () {
        $("#loading").fadeOut(500);
      })
    });
  }
}
