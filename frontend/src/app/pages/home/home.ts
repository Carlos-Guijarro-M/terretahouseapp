import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Reserva } from '../../services/reserva';
import { Auth } from '../../services/auth';
import { HeroCarousel } from '../../components/hero-carousel/hero-carousel';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, HeroCarousel],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  actividades: any[] = [];
  misReservas: any[] = [];
  isAdmin: boolean = false;
  userLogeado: boolean = false;

  constructor(
    private reservaService: Reserva, 
    private auth: Auth,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    const usuario = this.auth.getUser();
    if (usuario) {
      this.userLogeado = true;
      if (usuario.roles?.includes('ROLE_ADMIN')) {
        this.isAdmin = true;
      }
    }
    this.cargarDatos();
  }

  cargarDatos() {
    this.reservaService.getActividades().subscribe((data: any) => {
      this.actividades = data;
      this.cdr.detectChanges(); 
    });

    // Carga de reservas si está logueado
    if (this.userLogeado) {
      this.reservaService.getReservas().subscribe((data: any) => {
        this.misReservas = data;
        this.cdr.detectChanges();
      });
    }
  }

  yaReservada(id: any): boolean {
    return this.misReservas.some(reserva => Number(reserva.actividadId) === Number(id));
  }

  reservarActividad(actividad: any) {
    if (this.yaReservada(actividad.id)) {
      alert('Ya tienes esta actividad reservada.');
      return;
    }

    const datosReserva = {
      actividadId: actividad.id,
      titulo: actividad.titulo,
      fecha: actividad.fecha 
    };

    this.reservaService.crearReserva(datosReserva).subscribe({
      next: () => {
        alert('Reserva confirmada');
        this.cargarDatos(); 
      },
      error: () => alert('Error al procesar la reserva')
    });
  }
}