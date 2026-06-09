import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
})
export class MisReservas implements OnInit {
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

  get reservasPaginadas() {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    return this.reservas.slice(inicio, inicio + this.elementosPorPagina);
  }

  get totalPaginas() {
    return Math.ceil(this.reservas.length / this.elementosPorPagina);
  }

  constructor(
    private reservaService: Reserva,
    public auth: Auth,
    private cdr: ChangeDetectorRef,
    public app: App,
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
    forkJoin({
      actividades: this.reservaService.getActividades(),
      misReservas: !this.isAdmin ? this.reservaService.getReservas() : of([]),
    }).subscribe(({ actividades, misReservas }) => {
      if (this.isAdmin) {
        this.todasLasReservas = actividades as any[];
      } else {
        this.todasLasReservas = (misReservas as any[]).map((res) => {
          const actividadId = res.actividad_id ?? res.actividadId;
          const act = (actividades as any[]).find((a) => Number(a.id) === Number(actividadId));

          return {
            ...res,
            actividadId: actividadId,
            titulo: act?.titulo || res.titulo || 'Sin título',
            descripcion: act?.descripcion || '',
            provincia: act?.provincia || res.provincia || 'Sin provincia',
            fecha: res.fecha || act?.fecha || '',
            hora_inicio: act?.hora_inicio || '',
            hora_fin: act?.hora_fin || '',
            plazas_ocupadas: res.plazas_ocupadas || act?.plazas_ocupadas || 0,
            plazas_totales: act?.plazas_totales || 0,
            mapa_iframe: act?.mapa_iframe || '',
            imagen_url: act?.imagen_url || res.imagen_url,
          };
        });
      }
      this.aplicarFiltros();
      this.cdr.detectChanges();
    });
  }

  filtrarPorProvincia(provincia: string) {
    this.provinciaFiltro = provincia;
    this.paginaActual = 1;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let resultado = [...this.todasLasReservas];

    if (this.provinciaFiltro !== 'Todas') {
      resultado = resultado.filter((r) => r.provincia === this.provinciaFiltro);
    }

    if (this.textoBusqueda.trim() !== '') {
      resultado = resultado.filter((r) =>
        r.titulo.toLowerCase().includes(this.textoBusqueda.toLowerCase()),
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