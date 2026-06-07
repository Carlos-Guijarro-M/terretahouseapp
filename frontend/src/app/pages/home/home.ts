import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { Reserva } from '../../services/reserva';
import { Auth } from '../../services/auth';
import { HeroCarousel } from '../../components/hero-carousel/hero-carousel';
import { App } from '../../app';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeroCarousel, FormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  todasLasActividades: any[] = [];
  misReservas: any[] = [];
  provinciaFiltro: string = 'Todas';
  nombreUsuario: string = '';
  isAdmin: boolean = false;
  userLogeado: boolean = false;
  textoBusqueda: string = '';
  actividadSeleccionada: any = null;

  constructor(
    public app: App,
    private reservaService: Reserva,
    private auth: Auth,
    private cdr: ChangeDetectorRef,
  ) {}

  get actividadesDisponibles() {
    const filtradas = this.provinciaFiltro === 'Todas'
        ? this.todasLasActividades
        : this.todasLasActividades.filter((a) => a.provincia === this.provinciaFiltro);

    return filtradas.filter((a) => !this.yaReservada(a.id))
    .filter((a) => a.titulo.toLowerCase().includes(this.textoBusqueda.toLowerCase()));
  }

  get misReservasFiltradas() {
    const filtradas = this.provinciaFiltro === 'Todas'
        ? this.misReservas
        : this.misReservas.filter(r => r.provincia === this.provinciaFiltro);
    return filtradas.filter((r) => r.titulo.toLowerCase().includes(this.textoBusqueda.toLowerCase()));
  }

  ngOnInit() {
    const usuario = this.auth.getUser();
    if (usuario) {
      this.userLogeado = true;
      this.nombreUsuario = usuario.nombre;
      if (usuario.roles?.includes('ROLE_ADMIN')) {
        this.isAdmin = true;
      }
    }
    this.cargarDatos();
  }

  cargarDatos() {
    forkJoin({
      actividades: this.reservaService.getActividades(),
      reservas: this.userLogeado ? this.reservaService.getReservas() : of([]),
    }).subscribe({
      next: ({ actividades, reservas }) => {
        this.todasLasActividades = actividades as any[];

        if (this.userLogeado) {
          this.misReservas = (reservas as any[]).map((res: any) => {
            const actividadId = res.actividad_id ?? res.actividadId;
            const act = this.todasLasActividades.find((a) => Number(a.id) === Number(actividadId));

            return {
              ...res,
              actividadId: actividadId,
              titulo: res.titulo || act?.titulo || 'Sin título',
              fecha: res.fecha || act?.fecha || '',
              imagen_url: act?.imagen_url,
              provincia: act?.provincia || 'Sin provincia',
              plazas_ocupadas: res.plazas_ocupadas || act?.plazas_ocupadas || 0,
              plazas_totales: res.plazas_totales || act?.plazas_totales || 0,
            };
          });
        }

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar datos:', err),
    });
  }

  filtrarPorProvincia(provincia: string) {
    this.provinciaFiltro = provincia;
  }

  yaReservada(id: any): boolean {
    return this.misReservas.some((r) => Number(r.actividadId) === Number(id));
  }

  verDetalleActividad(actividad: any) {
    this.actividadSeleccionada = actividad;
    document.body.style.overflow = 'hidden';
  }

  cerrarDetalle() {
    this.actividadSeleccionada = null;
    document.body.style.overflow = 'auto';
  }

  reservarActividad(actividad: any) {
    if (this.yaReservada(actividad.id)) {
      alert('Ya tienes esta actividad reservada.');
      return;
    }

    const datosReserva = {
      actividadId: actividad.id,
      titulo: actividad.titulo,
      fecha: actividad.fecha,
    };

    this.reservaService.crearReserva(datosReserva).subscribe({
      next: () => {
        alert('Reserva confirmada');
        this.cargarDatos();
      },
      error: () => alert('Error al procesar la reserva'),
    });
  }

  cancelarReserva(id: number) {
    if (confirm('¿Seguro que quieres cancelar esta reserva?')) {
      this.reservaService.eliminarReserva(id).subscribe({
        next: () => {
          alert('Reserva cancelada');
          this.cargarDatos();
        },
        error: (err) => console.error('Error al cancelar:', err),
      });
    }
  }
}