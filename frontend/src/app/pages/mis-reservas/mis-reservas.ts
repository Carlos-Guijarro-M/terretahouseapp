import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reserva } from '../../services/reserva';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-reservas.html',
})
export class MisReservas implements OnInit {
  reservas: any[] = [];
  tituloPagina: string = 'Mis Reservas';
  isAdmin: boolean = false;

  constructor(private reservaService: Reserva, private auth: Auth, private cdr: ChangeDetectorRef) {}

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
        this.reservas = data;
        this.cdr.detectChanges();
      });
    } else {
      this.reservaService.getReservas().subscribe((data: any) => {
        this.reservas = data;
        this.cdr.detectChanges();
      });
    }
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