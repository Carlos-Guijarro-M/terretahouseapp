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
    descripcion: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    provincia: '',
    plazas_totales: 0,
    mapa_iframe: '',
    imagen_url: ''
  };

  imagenSeleccionada: File | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.reservaService.getActividades().subscribe({
        next: (data: any) => {
          const lista = Array.isArray(data) ? data : data.actividades ?? [];
          const encontrada = lista.find((a: any) => String(a.id) === String(id));

          if (encontrada) {
            // Conversión de fecha para el input type="date"
            let fechaInput = '';
            if (encontrada.fecha && encontrada.fecha.includes('/')) {
              const [d, m, y] = encontrada.fecha.split('/');
              fechaInput = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            }
            this.actividad = { ...encontrada, fecha: fechaInput };
            this.cdr.detectChanges();
          }
        }
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
    formData.append('_method', 'PUT');
    formData.append('titulo', this.actividad.titulo);
    formData.append('descripcion', this.actividad.descripcion);
    formData.append('fecha_actividad', this.actividad.fecha);
    formData.append('hora_inicio', this.actividad.hora_inicio);
    formData.append('hora_fin', this.actividad.hora_fin);
    formData.append('provincia', this.actividad.provincia);
    formData.append('plazas_totales', this.actividad.plazas_totales.toString());
    formData.append('mapa_iframe', this.actividad.mapa_iframe);
    
    if (this.imagenSeleccionada) {
      formData.append('imagen', this.imagenSeleccionada);
    }

    this.reservaService.actualizarActividad(this.actividad.id, formData).subscribe({
      next: () => this.router.navigate(['/crear-reservas']),
      error: (err) => alert('Error al actualizar: ' + (err.error?.message || 'Error desconocido'))
    });
  }

  cancelar() { this.router.navigate(['/crear-reservas']); }
}