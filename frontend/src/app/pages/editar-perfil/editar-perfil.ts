import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-editar-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-perfil.html',
  styleUrl: './editar-perfil.css'
})
export class EditarPerfil {
  usuario = { id: '', nombre: '', email: '', password_actual: '', password_nueva: '', password_confirmar: '' };
  archivoSeleccionado: File | null = null;

  constructor(private auth: Auth) {}

  ngOnInit() {
    const userActual = this.auth.getUser();
    if (userActual) {
      this.usuario.id = userActual.id;
      this.usuario.nombre = userActual.nombre;
      this.usuario.email = userActual.email;
    }
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.archivoSeleccionado = event.target.files[0];
    }
  }

  guardar() {
    if (this.usuario.password_nueva || this.usuario.password_confirmar) {
      if (!this.usuario.password_actual) {
        alert('Debes ingresar tu contraseña actual para realizar cambios de seguridad.');
        return;
      }
      if (this.usuario.password_nueva !== this.usuario.password_confirmar) {
        alert('Las nuevas contraseñas no coinciden.');
        return;
      }
      if (this.usuario.password_nueva.length < 3) {
        alert('La nueva contraseña debe tener al menos 3 caracteres.');
        return;
      }
    }

    const formData = new FormData();
    formData.append('id', this.usuario.id);
    formData.append('nombre', this.usuario.nombre);
    formData.append('email', this.usuario.email);
    formData.append('password_actual', this.usuario.password_actual);
    formData.append('password_nueva', this.usuario.password_nueva);

    if (this.archivoSeleccionado) {
      formData.append('foto', this.archivoSeleccionado);
    }

    this.auth.updateProfile(formData).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          const userActual = this.auth.getUser();
          
          userActual.nombre = this.usuario.nombre;
          userActual.email = this.usuario.email;
          if (res.foto) {
            userActual.foto = res.foto;
          }
          this.auth.setUser(userActual);
          alert('Perfil actualizado correctamente');
          window.location.reload();
        } else {
          alert(res.message);
        }
      },
      error: () => alert('Error al conectar con el servidor')
    });
  }
}