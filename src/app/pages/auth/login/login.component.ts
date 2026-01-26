import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../service/auth.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  PLATFORM_ID,
  afterNextRender,
  OnInit
} from '@angular/core';



declare function password_show_toggle(): any;
declare const FB: any;
declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})


export class LoginComponent {
  email = '';
  password = '';
  code_user = '';
  csrfToken = '';


constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          password_show_toggle();
        }, 50);
      }
    });
  }

  ngOnInit(): void {

    /* ✅ PROTEGER document */
    if (isPlatformBrowser(this.platformId)) {
      this.csrfToken = this.getCsrfTokenFromMeta();
    }

    /* Usuario ya logueado */
    if (this.authService.token && this.authService.user) {
      setTimeout(() => {
        this.router.navigateByUrl('/');
      }, 500);
      return;
    }

    /* Verificación por código */
    this.activatedRoute.queryParams.subscribe((resp: any) => {
      this.code_user = resp.code;
    });

    if (this.code_user) {
      this.authService.verifiedAuth({ code_user: this.code_user })
        .subscribe((resp: any) => {
          if (resp.message === 403) {
            this.toastr.error('El codigo no pertenece a ningun usuario');
          }
          if (resp.message === 200) {
            this.toastr.success('Correo verificado, ingresá a la tienda');
            setTimeout(() => {
              this.router.navigateByUrl('/login');
            }, 500);
          }
        });
    }

    /* ✅ Facebook SDK */
    if (isPlatformBrowser(this.platformId)) {
      (window as any).fbAsyncInit = () => {
        FB.init({
          appId: '1124088342957116',
          cookie: true,
          xfbml: true,
          version: 'v19.0',
        });
      };

      /* Google init */
      this.initGoogleLogin();
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
    this.authService.login(this.email, this.password).subscribe(
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

 loginWithFacebook() {
  FB.login((response: any) => {
    if (response.authResponse) {
      const accessToken = response.authResponse.accessToken;
      

      this.authService.loginWithFacebook(accessToken).subscribe({
        next: (resp: any) => {
          if (resp.needs_email) {
            this.toastr.info(
              'Completa tu perfil',
              'Necesitamos tu email para continuar'
            );
            this.router.navigate(['/complete-email']);
          } else {
            this.toastr.success(
              'Login con Facebook exitoso',
              'Bienvenido'
            );
            setTimeout(() => {
              this.router.navigateByUrl('/');
            }, 500);
          }
        },
        error: (err) => {
          console.error(err);
          this.toastr.error(
            'Error',
            'No se pudo autenticar con Facebook'
          );
        }
      });

    } else {
      this.toastr.error(
        'Error',
        'El login con Facebook fue cancelado'
      );
    }
  }, { scope: 'email,public_profile' });
}

initGoogleLogin() {
    google.accounts.id.initialize({
      client_id: 'TU_GOOGLE_CLIENT_ID',
      callback: (response: any) => {
        console.log('GOOGLE TOKEN:', response.credential);

        this.authService.loginWithGoogle(response.credential)
          .subscribe((resp: any) => {

            if (resp.needs_email) {
              this.router.navigate(['/complete-email'], {
                state: {
                  google_id: resp.google_id,
                  name: resp.user?.name
                }
              });
            } else {
              this.toastr.success('Login exitoso', 'Bienvenido');
              this.router.navigate(['/']);
            }

          }, () => {
            this.toastr.error('No se pudo autenticar con Google');
          });
      }
    });
  }

  loginWithGoogle() {
    google.accounts.id.prompt();
  }






  getCsrfTokenFromMeta(): string {
    if (!isPlatformBrowser(this.platformId)) {
      return '';
    }
    const el = document.querySelector<HTMLMetaElement>(
      'meta[name="csrf-token"]'
    );
    return el?.content ?? '';
  }
}
