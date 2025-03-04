import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-code-forgot-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './code-forgot-password.component.html',
  styleUrl: './code-forgot-password.component.css'
})
export class CodeForgotPasswordComponent {
  code:string = '';
  isLoadingCode:any = null;

  @Output() LoadingCodeStatus: EventEmitter<any> = new EventEmitter();
  @Output() CodeValue: EventEmitter<any> = new EventEmitter();
  constructor(
      public authService: AuthService,
      private toastr: ToastrService
    ) {

    }

    verifiedCode() {
      if (!this.code) {
        this.toastr.error("Validacion", 'Necesitas ingresar el código de verificación.');
        return;
      }

      let data = {
        code: this.code
      }

      this.authService.verifiedCode(data).subscribe(
        (resp: any) => {
          console.log('Respuesta completa del servidor:', resp); // Imprime toda la respuesta para depuración

          // Verifica si la respuesta contiene 'message' con valor 200 (como número)
          if (resp && resp.message === 200) {
            this.isLoadingCode = 1;
            this.LoadingCodeStatus.emit(this.isLoadingCode);
            this.CodeValue.emit(this.code);
            this.toastr.success("Éxito", "El código es correcto, ahora cambia la contraseña.");
          } else {
            this.isLoadingCode = null;
            this.LoadingCodeStatus.emit(this.isLoadingCode);
            this.toastr.error("Error", "Código incorrecto.");
          }
        },
        (error) => {
          console.error('Error al verificar el código:', error);
          this.isLoadingCode = null;
          this.LoadingCodeStatus.emit(this.isLoadingCode);
          this.toastr.error("Error", "Hubo un problema al verificar el código.");
        }
      );
    }

}
