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
  //TODO: AGREGAR OUTPUT PARA ASIGNAR UN AVATAR AL COMPONENTE PADRE

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
      this.ig = resp.ig
      this.sexo = resp.sexo
      this.address_city = resp.address_city
      this.imagen_previsualizacion = resp.avatar
    })
  }

  updateUser(){
    if(!this.name || !this.email) {
      this.toastr.error('Validacion', "Es necesario ingresar un nombre y un email");
      return;
    }
    // let data = {
    //   name : this.name,
    //   surname : this.surname,
    //   email : this.email,
    //   phone : this.phone,
    //   bio : this.bio,
    //   fb : this.fb,
    //   sexo : this.sexo,
    //   address_city : this.address_city,
    // }

    let formData = new FormData();
    formData.append('name', this.name);
    formData.append('surname', this.surname);
    formData.append('email', this.email);

    //como trabajamos dentro de formdata y estos valores pueden ser null, los agregamos solo si tienen valor
    if(this.phone){
      formData.append('phone', this.phone);
    }
    if(this.bio){
      formData.append('bio', this.bio);
    }
    if(this.fb){
      formData.append('fb', this.fb);
    }
    if(this.ig){
      formData.append('ig', this.ig);
    }
    if(this.sexo){
      formData.append('sexo', this.sexo);
    }
    if(this.address_city){
      formData.append('address_city', this.address_city);
    }
    if(this.file_imagen){
      formData.append('file_imagen', this.file_imagen);
    }


    this.profileClient.updateProfile(formData).subscribe((resp:any) => {
      console.log(resp);

      if(resp.message == 403){
        this.toastr.error('Error', resp.message_text)
      } else {
        this.toastr.success('Exito', "El usuario ha sido editado correctamente")
      }
    })
  }

  processFile($event: any) {
    const file = $event.target.files[0];

    // Verificar si el archivo es una imagen
    if (!file.type.startsWith('image/')) {
      this.toastr.error('El archivo seleccionado no es una imagen', 'Error');
      return;
    }

    this.file_imagen = file;
    console.log(this.file_imagen);

    // Leer el archivo y convertirlo en una URL para la previsualización
    const reader = new FileReader();
    reader.onload = () => {
      this.imagen_previsualizacion = reader.result;
    };
    reader.readAsDataURL(file);
  }
}
