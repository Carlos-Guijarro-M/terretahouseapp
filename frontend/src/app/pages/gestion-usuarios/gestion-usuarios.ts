import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestion-usuarios.html',
  styleUrl: './gestion-usuarios.css',
})
export class GestionUsuarios implements OnInit {
  usuarios: any[] = [];
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private apiUrl = 'http://localhost:8000/api/usuarios.php';

  ngOnInit() {
    this.cargarUsuarios();
  }

  private getHeaders(): HttpHeaders {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : {};
    return new HttpHeaders({
      'Authorization': `Bearer ${user.api_token || ''}`,
      'Content-Type': 'application/json'
    });
  }

  cargarUsuarios() {
  this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() }).subscribe({
    next: (data) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const adminId = user.id;

      this.usuarios = (Array.isArray(data) ? data : []).filter(u => Number(u.id) !== Number(adminId));      
      this.cdr.detectChanges();

    },
    error: (err) => console.error('Error cargando usuarios', err)
  });
}

  cambiarEstadoBaneo(usuario: any) {
    const nuevoEstado = usuario.baneado == 1 ? 0 : 1;
    this.http.post(this.apiUrl, { id: usuario.id, baneado: nuevoEstado }, { headers: this.getHeaders() })
    .subscribe({
      next: () => {
        usuario.baneado = nuevoEstado;
        this.cdr.detectChanges();
        alert(nuevoEstado ? 'Usuario baneado' : 'Usuario desbaneado');
      },
      error: (err) => console.error(err)
    });
  }

  eliminarUsuario(id: number) {
    if (confirm('¿Estás seguro de eliminar este usuario permanentemente?')) {
      this.http.delete(`${this.apiUrl}?id=${id}`, { headers: this.getHeaders() }).subscribe({
        next: () => this.cargarUsuarios(),
        error: (err) => console.error(err)
      });
    }
  }
}