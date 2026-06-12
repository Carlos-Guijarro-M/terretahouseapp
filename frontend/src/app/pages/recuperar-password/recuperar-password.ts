import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recuperar-password.html',
  styleUrl: './recuperar-password.css',
})
export class RecuperarPassword {
  email: string = '';
  token: string = '';
  error: string = '';
  private readonly API_URL = 'http://localhost:8000/api';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  recuperar() {
    this.error = '';
    this.token = '';

    if (!this.email) {
      this.error = 'Por favor introduce tu email.';
      return;
    }

    this.http.post<any>(this.API_URL + '/recuperar_password.php', { email: this.email })
      .subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.token = res.token;
          } else {
            this.error = res.message || 'Error desconocido';
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = (err.error && err.error.message) ? err.error.message : 'Error al conectar con el servidor.';          
          this.cdr.detectChanges();
        },
      });
  }
}
