import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-complete-email',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './complete-email.component.html'
})
export class CompleteEmailComponent {

  email: string = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  submit() {
    if (!this.email) {
      this.toastr.error('Validación', 'El email es obligatorio');
      return;
    }

    this.loading = true;

    this.authService.completeEmail(this.email).subscribe({
      next: (resp: any) => {
        this.loading = false;

        this.toastr.success(
          'Perfil actualizado',
          'Ya podés continuar'
        );

        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.toastr.error(
          'Error',
          err?.error?.message || 'No se pudo guardar el email'
        );
      }
    });
  }
}
