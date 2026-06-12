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
export class Header {
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
    let ruta: string;
    
    if (this.usuarioActual != null && this.usuarioActual.foto != null) {
        ruta = 'http://localhost:8000/uploads/perfiles/' + this.usuarioActual.foto;
    } else {
        const nombre = (this.usuarioActual != null) ? this.usuarioActual.nombre : 'U';
        ruta = 'https://ui-avatars.com/api/?name=' + nombre + '&background=A0685D&color=fff&size=30';
    }
    
    return ruta;
  }

  comprobarAdmin(): boolean {
    if (this.usuarioActual != null && this.usuarioActual.roles != null) {
        if (this.usuarioActual.roles.includes('ROLE_ADMIN')) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
  }

  conmutarMenu() {
    if (this.menuAbierto == true) {
        this.menuAbierto = false;
    } else {
        this.menuAbierto = true;
    }
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