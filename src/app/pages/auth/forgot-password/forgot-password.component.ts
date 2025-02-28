import { Component } from '@angular/core';
import { CodeForgotPasswordComponent } from "../code-forgot-password/code-forgot-password.component";
import { NewPasswordComponent } from "../new-password/new-password.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule ,CodeForgotPasswordComponent, NewPasswordComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {

  isLoadingMail:any = null;
  isLoadingCode:any = null;
}
