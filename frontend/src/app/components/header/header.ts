import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {

  menuAbierto: boolean = false;

  constructor(public auth: Auth, private router: Router) {}

  comprobarLogueado(): boolean {
    return this.auth.getUser() !== null;
  }

  obtenerEmail(): string {
    return this.auth.getUser()?.email || '';
  }

  // Ajustado: Comprobamos si 'ROLE_ADMIN' existe dentro de la cadena 'roles'
  comprobarAdmin(): boolean {
    const usuario = this.auth.getUser();
    if (usuario === null || !usuario.roles) {
      return false;
    }
    // Si roles es una cadena (ej: "ROLE_USER,ROLE_ADMIN"), usamos includes
    return usuario.roles.includes('ROLE_ADMIN');
  }

  conmutarMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu() {
    this.menuAbierto = false;
  }

  logout() {
    this.menuAbierto = false;
    this.auth.logout().subscribe({
      next: () => {
        this.auth.clearUser();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.auth.clearUser();
        this.router.navigate(['/login']);
      }
    });
  }
}