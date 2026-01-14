import { afterNextRender, Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../service/auth.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
// Importaciones para Google
import { SocialAuthService, GoogleLoginProvider, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';

declare function password_show_toggle(): any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, GoogleSigninButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  code_user: string = '';

  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    private socialAuthService: SocialAuthService, // Inyectamos el servicio de redes sociales
    public router: Router,
    public activatedRoute: ActivatedRoute
  ) {
    afterNextRender(() => {
      setTimeout(() => {
        if (typeof password_show_toggle === 'function') {
          password_show_toggle();
        }
      }, 50);
    });
  }

  ngOnInit(): void {
    // 1. Si ya hay sesión iniciada, redirigir al Home
    if (this.authService.token && this.authService.user) {
      this.router.navigateByUrl('/');
      return;
    }

    // 2. Escuchar parámetros de la URL (para verificación de cuenta)
    this.activatedRoute.queryParams.subscribe((resp: any) => {
      this.code_user = resp.code;
      if (this.code_user) {
        this.verificarUsuario(this.code_user);
      }
    });
  }

  // --- LOGIN MANUAL ---
  login() {
    if (!this.email || !this.password) {
      this.toastr.error('Validación', 'Por favor ingresar todos los campos');
      return;
    }

    this.authService.login(this.email, this.password).subscribe({
      next: (resp: any) => {
        if (resp === true) {
          this.toastr.success('Login exitoso', 'Bienvenido');
          this.router.navigateByUrl('/');
        } else {
          // Si el servicio devuelve el error de Laravel (401)
          this.toastr.error('Error', 'Credenciales incorrectas o cuenta no verificada');
        }
      },
      error: (err) => {
        this.toastr.error('Error', 'Hubo un fallo en la conexión con el servidor');
      }
    });
  }

  // --- LOGIN CON GOOGLE ---
  loginWithGoogle() {
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID)
      .then(user => {
        // user.authToken es el access_token que Laravel Socialite espera 
        this.authService.loginWithGoogle(user.authToken).subscribe({
          next: (resp: any) => {
            if (resp === true) {
              this.toastr.success('Éxito', 'Sesión iniciada con Google');
              this.router.navigateByUrl('/');
            } else {
              this.toastr.error('Error', 'No se pudo validar el acceso con Google');
            }
          },
          error: (err) => {
            this.toastr.error('Error', 'Fallo en la autenticación social');
          }
        });
      })
      .catch(err => {
        console.log("Popup cerrado o error:", err);
      });
  }

  // --- VERIFICACIÓN DE EMAIL ---
  verificarUsuario(code: string) {
    this.authService.verifiedAuth({ code_user: code }).subscribe((resp: any) => {
      if (resp.message == 200) {
        this.toastr.success('Éxito', 'El correo ha sido verificado correctamente');
      } else {
        this.toastr.error('Error', 'El código de verificación no es válido');
      }
    });
  }
}