import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reserva } from '../../services/reserva';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-reservas.html',
  styleUrls: ['./mis-reservas.css']
})
export class MisReservas implements OnInit { 

  reservas: any[] = [];
  tituloPagina: string = 'Mis Reservas';
  isAdmin: boolean = false;

  private reservaService = inject(Reserva);
  private auth = inject(Auth);

  ngOnInit() {
    const usuario = this.auth.getUser();

    if (usuario) {
      this.isAdmin = usuario.roles?.includes('ROLE_ADMIN') || false;
      this.cargarDatos();
    }
  }

  cargarDatos() {
    if (this.isAdmin) {
      this.tituloPagina = 'Gestión de Actividades';
      
      this.reservaService.getActividades().subscribe({
        next: (respuesta: any) => {
          this.reservas = respuesta;
        },
        error: (err) => {
          console.error('Error al cargar actividades del admin:', err);
        }
      });
    } else {
      this.tituloPagina = 'Mis Reservas';
    
      this.reservaService.getReservas().subscribe({
        next: (respuesta: any) => {
          this.reservas = respuesta;
        },
        error: (error) => {
          console.error('Error al cargar las reservas del usuario:', error);
        }
      });
    }
  }

  cancelarReserva(id: number) {
    if (confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
      this.reservaService.eliminarReserva(id).subscribe({
        next: () => {
          alert('Reserva cancelada con éxito');
          this.cargarDatos();
        },
        error: (error) => {
          console.error('Error al cancelar la reserva:', error);
          alert('No se ha podido cancelar la reserva');
        }
      });
    }
  }

  eliminarActividad(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar esta actividad del sistema?')) {
      this.reservaService.eliminarActividad(id).subscribe({
        next: () => {
          alert('Actividad eliminada con éxito');
          this.cargarDatos();
        },
        error: (error) => {   
          console.error('Error al eliminar la actividad:', error);
          alert('No se ha podido eliminar la actividad');
        }
      });
    }
  }
}