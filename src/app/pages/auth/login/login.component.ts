import { afterNextRender, Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../service/auth.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

declare function password_show_toggle(): any;
declare const FB: any;
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  code_user: string = '';
  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    public router: Router,
    public activatedRoute: ActivatedRoute
  ) {
    afterNextRender(() => {

      setTimeout(() => {
          password_show_toggle();
        }, 50);
      })
  }
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    // this.showSuccess();
    this.csrfToken = this.getCsrfTokenFromMeta();

    if (this.authService.token && this.authService.user) {
      setTimeout(() => {
        this.router.navigateByUrl('/');
      }, 500);
      return;
    }
    this.activatedRoute.queryParams.subscribe((resp: any) => {
      this.code_user = resp.code;
    });



    if(this.code_user){
      let data = {
        code_user: this.code_user,
      }
      this.authService.verifiedAuth(data).subscribe((resp:any) => {
        console.log(resp)
        if(resp.message == 403){
          this.toastr.error('Error', 'El codigo no pertenece a ningun usuario');
        }
        if(resp.message == 200){
          this.toastr.success('Exito', 'El correo ha sido verificado, ingresa a la tienda');
          setTimeout(() => {
            this.router.navigateByUrl('/login');
          }, 500);
        }
      })
    }

    // Inicializar Facebook SDK
    (window as any).fbAsyncInit = () => {
      FB.init({
        appId      : '1124088342957116',
        cookie     : true,
        xfbml      : true,
        version    : 'v19.0'
      });
    };

    // Si llega token de query string, procesarlo
    this.activatedRoute.queryParams.subscribe(params => {
      // Aquí no hace falta, porque todo lo haremos desde el front
    });
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
  // window.location.href = 'http://localhost:8000/auth/redirect';
  FB.login((response: any) => {
    if (response.authResponse) {
      const accessToken = response.authResponse.accessToken;

      // Aquí envías el token de Facebook a tu backend para validarlo
      this.authService.loginWithFacebook(accessToken).subscribe(resp => {
        if (resp == true) {
          this.toastr.success('Login con Facebook exitoso', 'Bienvenido');
          setTimeout(() => {
            this.router.navigateByUrl('/');
          }, 500);
        }
      });
    } else {
      this.toastr.error('Error', 'No se pudo iniciar sesión con Facebook');
    }
  }, { scope: 'email,public_profile' });
}
csrfToken = '';

// ngOnInit() {
//   this.csrfToken = this.getCsrfTokenFromMeta();
// }

getCsrfTokenFromMeta(): string {
  const el: HTMLMetaElement | null = document.querySelector('meta[name="csrf-token"]');
  return el ? el.content : '';
}
}
