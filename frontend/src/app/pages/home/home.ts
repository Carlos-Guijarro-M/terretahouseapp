import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Reserva } from '../../services/reserva';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  actividades: any[] = [];
  isAdmin: boolean = false;
  userLogeado: boolean = false;
  misReservas: any[] = [];

  constructor(private reservaService: Reserva, private auth: Auth, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const usuario = this.auth.getUser();
    
    if (usuario) {
      this.userLogeado = true;
      this.isAdmin = usuario.roles.includes('ROLE_ADMIN');
      this.cargarReservas();
    }
    
    this.reservaService.getActividades().subscribe({
      next: (respuesta: any) => {
        this.actividades = respuesta;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar las actividades:', error);
      },
    });
  }

  cargarReservas() {
    this.reservaService.getReservas().subscribe({
      next: (reservas: any) => {
        this.misReservas = reservas;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar las reservas:', error);
      },
    });
  }

  yaReservada(titulo: string): boolean {
    for (let i = 0; i < this.misReservas.length; i++) {
      if (this.misReservas[i].titulo === titulo) {
        return true;
      }
    }
    return false;
  }

  reservarActividad(actividadId: number) {
    const actividad = this.actividades.find((a) => a.id === actividadId);
    
    // Cambiado: Comprobamos directamente si no ha encontrado la actividad
    if (actividad === undefined) {
      alert('Actividad no encontrada');
      return;
    }

    let fechaFinal = actividad.fecha;
    
    // Cambiado: Comprobamos si la fecha viene vacía o no existe
    if (fechaFinal === '' || fechaFinal === undefined || fechaFinal === null) {
      fechaFinal = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }

    const datosReserva = {
      actividadId: actividad.id,
      titulo: actividad.titulo,
      fecha: fechaFinal, 
    };

    this.reservaService.crearReserva(datosReserva).subscribe({
      next: (respuesta) => {
        alert('Reserva creada con éxito');
        this.cargarReservas();
      },
      error: (error) => {
        console.error('Error al crear la reserva:', error);
        alert('Error al crear la reserva');
      },
    });
  }
}