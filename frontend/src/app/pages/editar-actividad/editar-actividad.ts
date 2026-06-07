import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Reserva } from '../../services/reserva';

@Component({
  selector: 'app-editar-actividad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-actividad.html',
  styleUrl: './editar-actividad.css',
})
export class EditarActividad implements OnInit {

  private reservaService = inject(Reserva);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  actividad: any = {
    id: null,
    titulo: '',
    provincia: '',
    fecha: '',
    imagen_url: '',
    plazas_totales: ''
  };

  imagenSeleccionada: File | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.reservaService.getActividades().subscribe({
        next: (data: any) => {
          const lista = Array.isArray(data) ? data : data.actividades ?? data.data ?? [];
          const encontrada = lista.find((a: any) => String(a.id) === String(id));

          if (encontrada) {
            this.actividad = {
              ...encontrada,
              fecha: encontrada.fecha ? encontrada.fecha.substring(0, 10) : ''
            };
            this.cdr.detectChanges();
          }
        },
        error: (err) => console.error('Error al cargar actividades:', err)
      });
    }
  }

  onImagenSeleccionada(event: any) {
    if (event.target.files.length > 0) {
      this.imagenSeleccionada = event.target.files[0];
    }
  }

  guardarCambios() {
    const formData = new FormData();
    formData.append('titulo', this.actividad.titulo);
    formData.append('fecha', this.actividad.fecha);
    formData.append('provincia', this.actividad.provincia);
    formData.append('plazas_totales', this.actividad.plazas_totales);
    
    if (this.imagenSeleccionada) {
      formData.append('imagen', this.imagenSeleccionada);
    }

    this.reservaService.actualizarActividad(this.actividad.id, formData).subscribe({
      next: () => {
        this.router.navigate(['/crear-reservas'], {
          state: { mensaje: `Se ha modificado la actividad: ${this.actividad.titulo}` }
        });
      },
      error: (err) => alert('Error al actualizar')
    });
  }

  cancelar() {
    this.router.navigate(['/crear-reservas']);
  }
}