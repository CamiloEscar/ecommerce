import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProfileClientService } from '../service/profile-client.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-password-profile-client',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './password-profile-client.component.html',
  styleUrl: './password-profile-client.component.css'
})
export class PasswordProfileClientComponent {

  password: string = '';
  confirmed_password: string = '';

  constructor(
      public profileClient: ProfileClientService,
      public toastr: ToastrService,
    ) {
      this.profileClient.showUser().subscribe((resp:any) => {
        console.log(resp)
        this.password = resp.password
      })
    }

  updateUser(){
    if(!this.password || !this.confirmed_password) {
      this.toastr.error('Validacion', "Es necesario ingresar la contraseña y la confirmacion");
      return;
    }
    if(this.password != this.confirmed_password) {
      this.toastr.error('Validacion', "Es necesario que las constraseñas coincidan");
      return;
    }
    let data = {
      password : this.password,
    }
    this.profileClient.updateProfile(data).subscribe((resp:any) => {
      //console.log(resp);

      if(resp.message == 403){
        this.toastr.error('Error', resp.message_text)
      } else {
        this.toastr.success('Exito', "El usuario ha sido editado correctamente")
      }
    })
  }
}
