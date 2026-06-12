import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-resetear-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './resetear-password.html',
  styleUrl: './resetear-password.css',
})
export class ResetearPassword {
  token: string = '';
  passwordNueva: string = '';
  passwordConfirmar: string = '';
  error: string = '';
  exito: string = '';
  private readonly API_URL = 'http://localhost:8000/api';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private router: Router) {}

  resetear() {
    this.error = '';
    this.exito = '';

    if (!this.token || !this.passwordNueva || !this.passwordConfirmar) {
      this.error = 'Por favor rellena todos los campos.';
      return;
    }

    if (this.passwordNueva !== this.passwordConfirmar) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    this.http.post<any>(`${this.API_URL}/resetear_password.php`, {
      token: this.token,
      password: this.passwordNueva
    }).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          alert('Contraseña restablecida con exito. Se te redigira al login.');
          this.router.navigate(['/login']);
        } else {
          this.error = res.message || 'Error al restablecer la contraseña.';        
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = (err.error && err.error.message) ? err.error.message : 'Error al conectar con el servidor.';
        this.cdr.detectChanges();
      }
    });
  }
}