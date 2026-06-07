import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reserva } from '../../services/reserva';
import { Auth } from '../../services/auth';
import { App } from '../../app';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-reservas.html',
})
export class MisReservas implements OnInit {
  todasLasReservas: any[] = [];
  reservas: any[] = [];
  tituloPagina: string = 'Mis Reservas';
  isAdmin: boolean = false;
  provinciaFiltro: string = 'Todas';
  textoBusqueda: string = '';
  actividadSeleccionada: any = null;

  constructor(
    private reservaService: Reserva, 
    public auth: Auth, 
    private cdr: ChangeDetectorRef, 
    public app: App
  ) {}

  ngOnInit() {
    const usuario = this.auth.getUser();
    if (usuario && usuario.roles?.includes('ROLE_ADMIN')) {
      this.isAdmin = true;
      this.tituloPagina = 'Gestión de Actividades';
    }
    this.cargarDatos();
  }

  cargarDatos() {
    if (this.isAdmin) {
      this.reservaService.getActividades().subscribe((data: any) => {
        this.todasLasReservas = data;
        this.aplicarFiltros();
        this.cdr.detectChanges();
      });
    } else {
      this.reservaService.getReservas().subscribe((data: any) => {
        this.todasLasReservas = data;
        this.aplicarFiltros();
        this.cdr.detectChanges();
      });
    }
  }

  filtrarPorProvincia(provincia: string) {
    this.provinciaFiltro = provincia;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let resultado = [...this.todasLasReservas];

    if (this.provinciaFiltro !== 'Todas') {
      resultado = resultado.filter(r => r.provincia === this.provinciaFiltro);
    }

    if (this.textoBusqueda.trim() !== '') {
      resultado = resultado.filter(r =>
        r.titulo.toLowerCase().includes(this.textoBusqueda.toLowerCase())
      );
    }

    this.reservas = resultado;
    this.cdr.detectChanges();
  }

  verDetalleActividad(actividad: any) {
    this.actividadSeleccionada = actividad;
    document.body.style.overflow = 'hidden';
  }

  cerrarDetalle() {
    this.actividadSeleccionada = null;
    document.body.style.overflow = 'auto';
  }

  cancelarReserva(id: number) {
    if (confirm('¿Seguro que quieres cancelar esta reserva?')) {
      this.reservaService.eliminarReserva(id).subscribe(() => {
        alert('Reserva cancelada');
        this.cargarDatos(); 
      });
    }
  }

  eliminarActividad(id: number) {
    if (confirm('¿Seguro que quieres eliminar esta actividad?')) {
      this.reservaService.eliminarActividad(id).subscribe(() => {
        alert('Actividad eliminada');
        this.cargarDatos();
      });
    }
  }
}