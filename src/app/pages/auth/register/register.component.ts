import { afterNextRender, Component, OnInit } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { SocialAuthService,GoogleLoginProvider, GoogleSigninButtonModule } from '@abacritt/angularx-social-login'; 

declare function password_show_toggle(): any;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule, GoogleSigninButtonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  name: string = '';
  surname: string = '';
  email: string = '';
  password: string = '';
  phone: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private socialAuthService: SocialAuthService
  ) {
    afterNextRender(() => {
      setTimeout(() => {
        if (typeof password_show_toggle === 'function') password_show_toggle();
      }, 50);
    });
  }

  ngOnInit() {
    // Si ya está logueado, no debería estar en el registro
    if (this.authService.token) {
      this.router.navigateByUrl('/');
    }
  }

  register() {
    if (!this.name || !this.surname || !this.email || !this.password || !this.phone) {
      this.toastr.error('Validación', 'Por favor llena todos los campos.');
      return;
    }

    const data = {
      name: this.name,
      surname: this.surname,
      email: this.email,
      password: this.password,
      phone: this.phone,
    };

    this.authService.register(data).subscribe({
      next: (resp: any) => {
        this.toastr.success('Éxito', 'Cuenta creada con éxito. Revisa tu correo.');
        this.router.navigate(['/login']); 
      },
      error: (err) => {
        this.toastr.error('Error', 'El correo ya está registrado o hay un error en el servidor.');
      }
    });
  }

  loginWithGoogle() {
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID)
      .then(user => {
        if (!user) return;
        
        // Usamos authToken que es el Access Token para Laravel Socialite
        this.authService.loginWithGoogle(user.authToken).subscribe({
          next: (success: boolean) => {
            if (success) {
              this.toastr.success('Éxito', 'Bienvenido con Google');
              this.router.navigateByUrl('/');
            }
          },
          error: () => this.toastr.error('Error', 'No se pudo validar con Google')
        });
      })
      .catch(err => console.log("Cierre de popup o error:", err));
  }
}