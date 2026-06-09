import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { RecaptchaModule } from 'ng-recaptcha';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, RecaptchaModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  formData = {
    email: '',
    password: '',
    confirmarPassword: '',
    nombre: '',
    apellidos: ''
  };
  
  archivoSeleccionado: File | null = null;
  error: string = '';
  tokenCaptcha: string = '';

  constructor(private auth: Auth, private router: Router, private cdr: ChangeDetectorRef) {}

  resolved(token: string | null) {
    this.tokenCaptcha = token || '';
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.archivoSeleccionado = event.target.files[0];
    }
  }

  register() {
    this.error = '';

    if(!this.tokenCaptcha){
      this.error = 'Por favor, completa el CAPTCHA.';
      return;
    }

    if (this.formData.password !== this.formData.confirmarPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    const formData = new FormData();
    formData.append('email', this.formData.email);
    formData.append('password', this.formData.password);
    formData.append('nombre', this.formData.nombre);
    formData.append('apellidos', this.formData.apellidos);
    formData.append('recaptcha_token', this.tokenCaptcha);
    
    if (this.archivoSeleccionado) {
      formData.append('foto', this.archivoSeleccionado);
    }

    this.auth.register(formData).subscribe({
      next: () => {
        alert('Registro exitoso. Ahora puedes iniciar sesión.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error desconocido';
        this.cdr.detectChanges(); 
      }
    });
  }
}