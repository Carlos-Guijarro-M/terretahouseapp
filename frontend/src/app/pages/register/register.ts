import { Component } from '@angular/core';
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
  
  error: string = '';

  constructor(private auth: Auth, private router: Router) {}

  register() {
    this.error = '';

    if (this.formData.email === '') {
      this.error = 'El email es obligatorio';
      return;
    }

    if (this.formData.password === '') {
      this.error = 'La contraseña es obligatoria';
      return;
    }

    if (this.formData.confirmarPassword === '') {
      this.error = 'Debes confirmar la contraseña';
      return;
    }

    if (this.formData.password !== this.formData.confirmarPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    const datosRegistro = {
      email: this.formData.email,
      password: this.formData.password
    };

    this.auth.register(datosRegistro).subscribe({
      next: () => {
        alert('Registro exitoso. Ahora puedes iniciar sesión.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.error = 'No se ha podido completar el registro.';
      }
    });
  }
}