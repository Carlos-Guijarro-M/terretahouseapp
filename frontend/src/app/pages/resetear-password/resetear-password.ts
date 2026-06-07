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
  error: string = '';
  exito: string = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private router: Router) {}

  resetear() {
    this.error = '';
    this.exito = '';

    if (!this.token || !this.passwordNueva) {
      this.error = 'Por favor rellena todos los campos.';
      return;
    }

    this.http.post<any>('http://localhost:8000/api/resetear_password.php', {
      token: this.token,
      password: this.passwordNueva
    }).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          alert('Contraseña restablecida con exito. Se te redigira al login.');
          this.router.navigate(['/login']);
        } else {
          this.error = res.message;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al conectar con el servidor.';
        this.cdr.detectChanges();
      }
    });
  }
}