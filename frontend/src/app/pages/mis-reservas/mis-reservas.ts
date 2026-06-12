import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { Reserva } from '../../services/reserva';
import { Auth } from '../../services/auth';
import { App } from '../../app';
import { FormsModule } from '@angular/forms';
import { SafeHtmlPipe } from '../../pipes/safe-html-pipe';
import { Pagination } from '../../components/pagination/pagination';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule, SafeHtmlPipe, Pagination],
  templateUrl: './mis-reservas.html',
  styleUrl: '/mis-reservas.css'
})
export class MisReservas {
  todasLasReservas: any[] = [];
  reservas: any[] = [];
  tituloPagina: string = 'Mis Reservas';
  isAdmin: boolean = false;
  provinciaFiltro: string = 'Todas';
  textoBusqueda: string = '';
  actividadSeleccionada: any = null;

  // Paginación
  elementosPorPagina: number = 3;
  paginaActual: number = 1;

  
  constructor(private reservaService: Reserva, public auth: Auth, private cdr: ChangeDetectorRef, public app: App) {}

  get reservasPaginadas() {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    return this.reservas.slice(inicio, inicio + this.elementosPorPagina);
  }

  get totalPaginas() {
    return Math.ceil(this.reservas.length / this.elementosPorPagina);
  }


  ngOnInit() {
    const usuario = this.auth.getUser();
    if (usuario && usuario.roles && usuario.roles.indexOf('ROLE_ADMIN') !== -1) {
      this.isAdmin = true;
      this.tituloPagina = 'Gestión de Actividades';
    }
    this.cargarDatos();
  }

  cargarDatos() {
    forkJoin({
      actividades: this.reservaService.getActividades(),
      misReservas: !this.isAdmin ? this.reservaService.getReservas() : of([]),
    }).subscribe({
      next: (data: any) => {
        const actividades = data.actividades as any[];
        
        if (this.isAdmin) {
          this.todasLasReservas = actividades;
        } else {
          const misReservas = data.misReservas as any[];
          this.todasLasReservas = misReservas.map(function(res) {
            const actividadId = res.actividad_id || res.actividadId;
            const act = actividades.find(function(a) { 
              return Number(a.id) === Number(actividadId); 
            });

            return {
              id: res.id,
              actividadId: actividadId,
              titulo: (act ? act.titulo : null) || res.titulo || 'Sin título',
              descripcion: act ? act.descripcion : '',
              provincia: (act ? act.provincia : null) || res.provincia || 'Sin provincia',
              fecha: res.fecha || (act ? act.fecha : ''),
              hora_inicio: act ? act.hora_inicio : '',
              hora_fin: act ? act.hora_fin : '',
              plazas_ocupadas: res.plazas_ocupadas || (act ? act.plazas_ocupadas : 0),
              plazas_totales: act ? act.plazas_totales : 0,
              mapa_iframe: act ? act.mapa_iframe : '',
              imagen_url: act ? act.imagen_url : res.imagen_url
            };
          });
        }
        this.aplicarFiltros();
        this.cdr.detectChanges();
      }
    });
  }

  filtrarPorProvincia(provincia: string) {
    this.provinciaFiltro = provincia;
    this.paginaActual = 1;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
  let resultado = this.todasLasReservas.slice();

  if (this.provinciaFiltro !== 'Todas') {
    resultado = resultado.filter((r) => r.provincia === this.provinciaFiltro);
  }

  if (this.textoBusqueda.trim() !== '') {
    resultado = resultado.filter((r) =>
      r.titulo.toLowerCase().indexOf(this.textoBusqueda.toLowerCase()) !== -1
    );
  }

  this.reservas = resultado;
  this.paginaActual = 1;
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