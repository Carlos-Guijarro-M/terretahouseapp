import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Pagination } from '../../components/pagination/pagination';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, Pagination],
  templateUrl: './gestion-usuarios.html',
  styleUrl: './gestion-usuarios.css'
})
export class GestionUsuarios {

  todosLosUsuarios: any[] = [];
  usuarios: any[] = [];
  textoBusqueda: string = '';
  filtroEstado: string = 'Todos';
  usuarioSeleccionado: any = null;
  reservasUsuario: any[] = [];

  // Paginación
  elementosPorPagina: number = 2;
  paginaActual: number = 1;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private router: Router, private auth: Auth) {}
  private apiUrl = 'http://localhost:8000/api/usuarios.php';


  get usuariosPaginados() {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    return this.usuarios.slice(inicio, inicio + this.elementosPorPagina);
  }

  get totalPaginas() {
    return Math.ceil(this.usuarios.length / this.elementosPorPagina);
  }

  ngOnInit() {

    if (!this.auth.getUser()) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.auth.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }
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
        this.todosLosUsuarios = (Array.isArray(data) ? data : []).filter(u => Number(u.id) !== Number(adminId));
        this.aplicarFiltros();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando usuarios', err)
    });
  }

  aplicarFiltros() {
    let resultado = this.todosLosUsuarios.slice();

    if (this.filtroEstado === 'Activo') {
      resultado = resultado.filter(u => u.baneado == 0);
    } else if (this.filtroEstado === 'Baneado') {
      resultado = resultado.filter(u => u.baneado == 1);
    }

    if (this.textoBusqueda.trim() !== '') {
      resultado = resultado.filter(u =>
        u.nombre.toLowerCase().indexOf(this.textoBusqueda.toLowerCase()) !== -1 
      );
    }

    this.usuarios = resultado;
    this.paginaActual = 1;
    this.cdr.detectChanges();
  }

  cambiarEstadoBaneo(usuario: any) {
    const nuevoEstado = usuario.baneado == 1 ? 0 : 1;
    this.http.post(this.apiUrl, { id: usuario.id, baneado: nuevoEstado }, { headers: this.getHeaders() }).subscribe({
      next: () => {
        usuario.baneado = nuevoEstado;
        this.aplicarFiltros();
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

  verReservas(usuario: any) {
    this.usuarioSeleccionado = usuario;
    this.reservasUsuario = [];
    document.body.style.overflow = 'hidden';

    this.http.get<any[]>(`${this.apiUrl}?user_id=${usuario.id}`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        setTimeout(() => {
          this.reservasUsuario = data;
          this.cdr.detectChanges();
        }, 100);
      },
      error: (err) => console.error(err)
    });
  }

  cerrarModal() {
    this.usuarioSeleccionado = null;
    this.reservasUsuario = [];
    document.body.style.overflow = '';
  }

  eliminarReservaDeUsuario(reservaId: number) {
    if (confirm('¿Seguro que quieres eliminar esta reserva?')) {
      this.http.delete(`${this.apiUrl}?reserva_id=${reservaId}`, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.reservasUsuario = this.reservasUsuario.filter(r => r.id !== reservaId);
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err)
      });
    }
  }
}