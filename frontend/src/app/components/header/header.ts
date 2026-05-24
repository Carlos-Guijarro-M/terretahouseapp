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
  isMenuCollapsed: boolean = true;

  constructor(public auth: Auth, private router: Router) {}

  comprobarLogueado(): boolean {
    return this.auth.getUser() !== null;
  }

  obtenerEmail(): string {
    return this.auth.getUser()?.email || '';
  }

  comprobarAdmin(): boolean {
    const usuario = this.auth.getUser();
    return usuario?.roles?.includes('ROLE_ADMIN') || false;
  }

  conmutarMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu() {
    this.menuAbierto = false;
    this.isMenuCollapsed = true;
  }

  logout() {
    this.cerrarMenu();
    this.auth.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }
}