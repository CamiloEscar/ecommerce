import { afterNextRender, Component } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';

//instalacion de ssr colocar afternextrender para renderizarlo luego, por problemas con $

declare function password_show_toggle():any;
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  name: string = '';
  surname: string = '';
  email: string = '';
  password: string = '';
  phone: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService // Assuming toastr is a service for displaying toast messages
  ) {
    afterNextRender(() => {

          setTimeout(() => {
              password_show_toggle();
            }, 50);
          })
  }

  register() {
    if (
      !this.name ||
      !this.surname ||
      !this.email ||
      !this.password ||
      !this.phone
    ) {
      this.toastr.error('Validacion', 'Por favor llena todos los datos.');
      return;
    }
    let data = {
      name: this.name,
      surname: this.surname,
      email: this.email,
      password: this.password,
      phone: this.phone,
    };
    this.authService.register(data).subscribe((resp: any) => {
      console.log(resp);
      this.toastr.success('Exito', 'Cuenta creada con exito.');
      setTimeout(() => {
        this.router.navigateByUrl('/login');
      }, 500);
    });
  }
}
