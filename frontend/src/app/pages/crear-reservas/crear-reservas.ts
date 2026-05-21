import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Reserva } from '../../services/reserva';

@Component({
  selector: 'app-crear-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-reservas.html',
  styleUrl: './crear-reservas.css',
})
export class CrearReservas implements OnInit {

  actividades: any[] = [];

  nuevaActividad: any = {
    id: null,
    titulo: '',
    fecha: '',
    estado: 'disponible'
  };

  private reservaService = inject(Reserva);

  ngOnInit() {
    this.cargarActividades();
  }

  cargarActividades() {
    this.reservaService.getActividades().subscribe({
      next: (data: any) => {
        this.actividades = data;
      },
      error: (err) => {
        console.error(err);
        alert('Error al cargar las actividades de la base de datos');
      }
    });
  }

  guardarActividad(event: Event) {
    event.preventDefault();

    if (this.nuevaActividad.id === null) {
      // Crear nueva
      this.reservaService.crearActividad(this.nuevaActividad).subscribe({
        next: () => {
          alert('Actividad guardada correctamente');
          this.limpiarFormulario();
          this.cargarActividades();
        },
        error: (err) => {
          console.error(err);
          alert('No se pudo crear la actividad');
        }
      });
    } else {
      // Editar existente
      this.reservaService.actualizarActividad(this.nuevaActividad.id, this.nuevaActividad).subscribe({
        next: () => {
          alert('Actividad editada correctamente');
          this.limpiarFormulario();
          this.cargarActividades();
        },
        error: (err) => {
          console.error(err);
          alert('No se pudo actualizar la actividad');
        }
      });
    }
  }

  eliminarActividad(id: number) {
    const opcion = confirm('¿Seguro que quieres borrar esta actividad?');
    if (opcion === true) {
      this.reservaService.eliminarActividad(id).subscribe({
        next: () => {
          alert('Actividad borrada correctamente');
          this.cargarActividades();
        },
        error: (err) => {
          console.error(err);
          alert('No se pudo eliminar la actividad');
        }
      });
    }
  }

  cargarParaEditar(actividad: any) {
    this.nuevaActividad = { 
      id: actividad.id,
      titulo: actividad.titulo,
      fecha: actividad.fecha,
      estado: actividad.estado
    };
  }

  limpiarFormulario() {
    this.nuevaActividad = {
      id: null,
      titulo: '',
      fecha: '',
      estado: 'disponible'
    };
  }
}