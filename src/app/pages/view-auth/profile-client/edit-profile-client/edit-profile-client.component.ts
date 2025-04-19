import { Component } from '@angular/core';
import { ProfileClientService } from '../service/profile-client.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-edit-profile-client',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './edit-profile-client.component.html',
  styleUrl: './edit-profile-client.component.css'
})
export class EditProfileClientComponent {

  name: string = '';
  surname: string = '';
  email: string = '';
  phone: string = '';
  bio: string = '';
  fb: string = '';
  // ig: string = '';
  sexo: string = '';
  address_city: string = '';

  constructor(
    public profileClient: ProfileClientService,
    public toastr: ToastrService,
  ) {
    this.profileClient.showUser().subscribe((resp:any) => {
      console.log(resp)
      this.name = resp.name
      this.surname = resp.surname
      this.email = resp.email
      this.phone = resp.phone
      this.bio = resp.bio
      this.fb = resp.fb
      // this.ig = resp.ig
      this.sexo = resp.sexo
      this.address_city = resp.address_city
    })
  }

  updateUser(){
    if(!this.name || !this.email) {
      this.toastr.error('Validacion', "Es necesario ingresar un nombre y un email");
      return;
    }
    let data = {
      name : this.name,
      surname : this.surname,
      email : this.email,
      phone : this.phone,
      bio : this.bio,
      fb : this.fb,
      sexo : this.sexo,
      address_city : this.address_city,
    }
    this.profileClient.updateProfile(data).subscribe((resp:any) => {
      console.log(resp);

      if(resp.message == 403){
        this.toastr.error('Error', resp.message_text)
      } else {
        this.toastr.success('Exito', "El usuario ha sido editado correctamente")
      }
    })
  }
}
