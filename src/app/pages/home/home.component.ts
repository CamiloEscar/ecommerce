import { afterNextRender, Component } from '@angular/core';
import { HomeService } from './service/home.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  SLIDERS: any = [];

  constructor(
    public homeService: HomeService,
  ) {
    afterNextRender(() => {
      this.homeService.home().subscribe((resp:any) => {
        console.log(resp);
        this.SLIDERS = resp.sliders_principal;
      })

    })

  }

  ngOnInit(): void {
    // Llama al servicio en ngOnInit para obtener los datos
    this.homeService.home().subscribe((resp: any) => {
      console.log(resp);
      this.SLIDERS = resp.sliders_principal;
    });
  }

  getLabelSlider(SLIDER: any){
    return SLIDER.label; // Devuelve directamente el valor
}

  getSubtitleSlider(SLIDER:any){
    return SLIDER.subtitle;
  }

}
//
