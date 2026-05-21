import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  formData = {
    email: '',
    password: '',
    confirmarPassword: ''
  };
  
  error = '';

  private auth = inject(Auth);
  private router = inject(Router);

  register() {
    this.error = '';

    if (!this.formData.email || !this.formData.password || !this.formData.confirmarPassword) {
      this.error = 'Por favor, rellena todos los campos';
      return;
    }

    if (this.formData.password !== this.formData.confirmarPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.auth.register({
      email: this.formData.email,
      password: this.formData.password
    }).subscribe({
      next: () => {
        alert('Registro exitoso. Ahora puedes iniciar sesión.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error:', err);
        this.error = 'No se ha podido completar el registro. Inténtalo de nuevo.';
      }
    });
  }
}