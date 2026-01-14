import { Component } from '@angular/core';
import { CodeForgotPasswordComponent } from "../code-forgot-password/code-forgot-password.component";
import { NewPasswordComponent } from "../new-password/new-password.component";
import { CommonModule } from '@angular/common';
import { AuthService } from '../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, CodeForgotPasswordComponent, NewPasswordComponent, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {

  isLoadingMail: any = null;
  isLoadingCode: any = null;

  email: string = '';
  code: string = '';
  new_password: string = '';

  constructor(
    public authService: AuthService,
    private toastr: ToastrService
  ) { }

  verifiedMail() {
    if (!this.email) {
      this.toastr.error("Validación", 'Necesitas ingresar el correo electrónico.');
      return; // Detenemos la ejecución si no hay email
    }

    const data = {
      email: this.email
    };

    // Usamos la sintaxis de objeto para evitar errores de tipo en 'error'
    this.authService.verifiedMail(data).subscribe({
      next: (resp: any) => {
        console.log('Respuesta del servidor:', resp);
        
        if (resp.status === 200) {
          this.toastr.success("Correo enviado", "Se ha enviado un correo con el código de verificación.");
          this.isLoadingMail = 1; // Cambia la vista para mostrar el ingreso de código
        } else {
          // Por si el backend responde con un status distinto a 200 pero sin caer en error
          this.toastr.warning("Aviso", resp.message || "No se pudo procesar la solicitud.");
        }
      },
      error: (err: any) => {
        console.error('Error al verificar el correo:', err);
        this.isLoadingMail = null;
        // Manejamos el error 403 que definimos en Laravel (Usuario no encontrado)
        const errorMessage = err.error?.message || "Ocurrió un error al verificar el correo.";
        this.toastr.error("Error", errorMessage);
      }
    });
  }

  LoadingCode($event: any) {
    this.isLoadingCode = $event;
  }

  CodeValueC($event: any) {
    this.code = $event;
  }
}