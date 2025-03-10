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
  imports: [CommonModule ,CodeForgotPasswordComponent, NewPasswordComponent, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {

  isLoadingMail:any = null;
  isLoadingCode:any = null;

  email:string = '';
  code:string = '';
  new_password:string = '';

  constructor(
    public authService: AuthService,
    private toastr: ToastrService
  ) {

  }

  verifiedMail() {
    if(!this.email) {
      this.toastr.error("Validacion",'Necesitas ingresar el correo electronico.');
    }

    let data = {
      email: this.email
    }
    this.authService.verifiedMail(data).subscribe(
      (resp: any) => {
        console.log('Respuesta del servidor:', resp);

        // Aquí imprimimos las claves del objeto de respuesta para ver la estructura
        console.log('Claves de la respuesta:', Object.keys(resp));
        if(resp.status == 200) {
          this.toastr.success("Correo enviado", "Se ha enviado un correo con el código de verificación.");
          this.isLoadingMail = 1;
        }
      },
      (error) => {
        console.error('Error al verificar el correo:', error);
        this.isLoadingMail = null;
        this.toastr.error("Error", "Ocurrió un error al verificar el correo.");
      }
    );

}
LoadingCode($event:any) {
  this.isLoadingCode = $event;
}
CodeValueC($event:any){
  this.code = $event;
}
}
