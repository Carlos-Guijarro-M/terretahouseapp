import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Reserva } from '../../services/reserva';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-editar-actividad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-actividad.html',
  styleUrl: './editar-actividad.css',
})
export class EditarActividad {
  
  constructor(private reservaService: Reserva,private route: ActivatedRoute,private router: Router,private cdr: ChangeDetectorRef,private auth: Auth) {}

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
    imagen_url: '',
  };

  imagenSeleccionada: File | null = null;

  ngOnInit() {
    if (!this.auth.getUser() || !this.auth.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.reservaService.getActividades().subscribe({
        next: (data: any) => {
          const lista = Array.isArray(data) ? data : data.actividades || [];
          const localizada = lista.find((a: any) => String(a.id) === String(id));

          if (localizada) {
            this.actividad.id = localizada.id;
            this.actividad.titulo = localizada.titulo;
            this.actividad.descripcion = localizada.descripcion;
            this.actividad.provincia = localizada.provincia;
            this.actividad.hora_inicio = localizada.hora_inicio;
            this.actividad.hora_fin = localizada.hora_fin;
            this.actividad.plazas_totales = localizada.plazas_totales;
            this.actividad.mapa_iframe = localizada.mapa_iframe;
            this.actividad.imagen_url = localizada.imagen_url;

            if (localizada.fecha && localizada.fecha.indexOf('/') !== -1) {
              const partes = localizada.fecha.split('/');
              this.actividad.fecha =
                partes[2] + '-' + partes[1].padStart(2, '0') + '-' + partes[0].padStart(2, '0');
            } else {
              this.actividad.fecha = localizada.fecha;
            }

            this.cdr.detectChanges();
          }
        },
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
      error: (err) => alert('Error: ' + (err.error?.message || 'Error desconocido')),
    });
  }

  cancelar() {
    this.router.navigate(['/crear-reservas']);
  }
}
