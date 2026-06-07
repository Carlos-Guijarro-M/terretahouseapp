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

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  recuperar() {
    this.error = '';
    this.token = '';

    if (!this.email) {
      this.error = 'Por favor introduce tu email.';
      return;
    }

    this.http.post<any>('http://localhost:8000/api/recuperar_password.php', { email: this.email }).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.token = res.token;
          this.cdr.detectChanges();
        } else {
          this.error = res.message;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.error = 'Error al conectar con el servidor.'
        this.cdr.detectChanges();
      }
    });
  }
}