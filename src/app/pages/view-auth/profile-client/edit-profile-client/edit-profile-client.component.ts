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
  }
}
