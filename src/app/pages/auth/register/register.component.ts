import { afterNextRender, Component } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

declare function password_show_toggle(): any;

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
  csrfToken = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    afterNextRender(() => {
      setTimeout(() => {
        password_show_toggle();
      }, 50);
    });
  }

  ngOnInit() {
  this.csrfToken = this.getCsrfTokenFromMeta();

  this.route.queryParams.subscribe(params => {
    const token = params['token'];
    if (token) {
      localStorage.setItem('token', token);
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.route.queryParams.subscribe(params => {
  const token = params['token'];
  if (token) {
    localStorage.setItem('token', token);

    this.name = params['name'] || '';
    this.surname = params['surname'] || '';
    this.email = params['email'] || '';
    this.phone = params['phone'] || '';
    this.toastr.info('Bienvenido', 'Completa los datos faltantes para registrarte');
  }
});
    }
  });
}

  getCsrfTokenFromMeta(): string {
    const el: HTMLMetaElement | null = document.querySelector('meta[name="csrf-token"]');
    return el ? el.content : '';
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
        this.toastr.success('Éxito', 'Cuenta creada con éxito.');
        setTimeout(() => {
          this.router.navigateByUrl('/login');
        }, 500);
      },
      error: () => {
        this.toastr.error('Error', 'No se pudo completar el registro.');
      }
    });
  }

  loginWithFacebook() {
    window.location.href = 'http://localhost:8000/auth/redirect';
  }
}
