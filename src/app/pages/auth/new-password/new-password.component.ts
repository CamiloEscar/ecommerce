import { Component, Input } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [],
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.css',
})
export class NewPasswordComponent {
  new_password: string = '';
  isLoadingCode: any = null;
  @Input() code:any;

  constructor(public authService: AuthService, private toastr: ToastrService, private router: Router) {}

  verifiedNewPassword() {
    if (!this.new_password) {
      this.toastr.error(
        'Validacion',
        'Necesitas ingresar el código de verificación.'
      );
      return;
    }

    let data = {
      new_password: this.new_password,
      code: this.code
    };

    this.authService.verifiedNewPassword(data).subscribe((resp: any) => {
      console.log('Respuesta completa del servidor:', resp); // Imprime toda la respuesta para depuración
      this.toastr.success(
        'Éxito',
        'La contraseña ha cambiado correctamente.'
      );
      this.router.navigateByUrl('/login');
    });
  }
}
