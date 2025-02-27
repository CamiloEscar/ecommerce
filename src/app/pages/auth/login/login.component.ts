import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  constructor(
    private toastr: ToastrService,
    private AuthService: AuthService,
    private router: Router
  ) {}
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    // this.showSuccess();

    if (this.AuthService.token && this.AuthService.user) {
      setTimeout(() => {
        this.router.navigateByUrl('/');
      }, 500);
      return;
    }
  }

  login() {
    if (!this.email || !this.password) {
      this.toastr.error(
        'Validacion',
        'Por favor ingresar todos los campos correctamente'
      );
      return;
    }
    this.AuthService.login(this.email, this.password).subscribe(
      (resp: any) => {
        console.log(resp);

        if (resp.error && resp.error.error == 'Unauthorized') {
          this.toastr.error('Error', 'Usuario o contraseña incorrectos');
          return;
        }
        if (resp == true) {
          this.toastr.success('Login exitoso', 'Bienvenido');
          setTimeout(() => {
            this.router.navigateByUrl('/');
          }, 500);
        }
      },
      (error) => {
        console.log(error);
        this.toastr.error('Error', 'Error en el login');
      }
    );
  }
  showSuccess() {
    this.toastr.success('Hello world!', 'Toastr fun!');
  }
}
