import { Component, ChangeDetectorRef } from '@angular/core';
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
    confirmarPassword: '',
    nombre: '',
    apellidos: ''
  };
  
  archivoSeleccionado: File | null = null;
  error: string = '';

  constructor(private auth: Auth, private router: Router, private cdr: ChangeDetectorRef) {}

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.archivoSeleccionado = event.target.files[0];
    }
  }

  register() {
    this.error = '';

    if (this.formData.password !== this.formData.confirmarPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    const formData = new FormData();
    formData.append('email', this.formData.email);
    formData.append('password', this.formData.password);
    formData.append('nombre', this.formData.nombre);
    formData.append('apellidos', this.formData.apellidos);
    
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