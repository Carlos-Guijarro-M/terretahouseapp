import { Component, OnInit } from '@angular/core';
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
export class Header implements OnInit {
  menuAbierto: boolean = false;
  isMenuCollapsed: boolean = false;
  usuarioActual: any = null;

  constructor(public auth: Auth, private router: Router) {}

  ngOnInit() {
    this.auth.getUserObservable().subscribe(user => {
      this.usuarioActual = user;
    });
  }

  comprobarLogueado(): boolean {
    return this.usuarioActual !== null;
  }

  obtenerFoto(): string {
    if (this.usuarioActual?.foto) {
      return `http://localhost:8000/uploads/perfiles/${this.usuarioActual.foto}`;
    }
    return `https://ui-avatars.com/api/?name=${this.usuarioActual?.nombre || 'U'}&background=A0685D&color=fff&size=30`;
  }

  comprobarAdmin(): boolean {
    return this.usuarioActual?.roles?.includes('ROLE_ADMIN') || false;
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
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }
}