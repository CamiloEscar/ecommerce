import { Component } from '@angular/core';
import { EditProfileClientComponent } from './edit-profile-client/edit-profile-client.component';
import { AddressProfileClientComponent } from './address-profile-client/address-profile-client.component';
import { OrdersProfileClientComponent } from './orders-profile-client/orders-profile-client.component';
import { PasswordProfileClientComponent } from './password-profile-client/password-profile-client.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/service/auth.service';
import { ProfileClientService } from './service/profile-client.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile-client',
  standalone: true,
  imports: [EditProfileClientComponent, AddressProfileClientComponent, OrdersProfileClientComponent,
    PasswordProfileClientComponent, CommonModule, FormsModule, RouterModule],
  templateUrl: './profile-client.component.html',
  styleUrl: './profile-client.component.css'
})
export class ProfileClientComponent {
  selected_tab:number = 0;

  name: string = '';
  surname: string = '';
  email: string = '';
  phone: string = '';
  bio: string = '';
  fb: string = '';
  ig: string = '';
  sexo: string = '';
  address_city: string = '';

  file_imagen: any;
  imagen_previsualizacion:any;
  constructor(
    public authService: AuthService,
    public profileClient: ProfileClientService,
    public toastr: ToastrService,
  ){
    this.profileClient.showUser().subscribe((resp:any) => {
      console.log(resp)
      this.name = resp.name
      this.surname = resp.surname
      this.email = resp.email
      this.phone = resp.phone
      this.bio = resp.bio
      this.fb = resp.fb
      this.ig = resp.ig
      this.sexo = resp.sexo
      this.address_city = resp.address_city
      this.imagen_previsualizacion = resp.avatar
    })
  }

  selectTab(val:number){
    this.selected_tab = val;
  }

  logout(){
    this.authService.logout();
    setTimeout(() => {
      window.location.reload();
    }, 50);
  }
}
