import { Component, OnInit, inject, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Reserva } from '../../services/reserva';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crear-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-reservas.html',
  styleUrl: './crear-reservas.css',
})
export class CrearReservas implements OnInit {

  @ViewChild('fileInput') fileInput!: ElementRef;

  todasLasActividades: any[] = [];
  actividades: any[] = [];
  mensajeConfirmacion: string = '';
  imagenSeleccionada: File | null = null;
  provinciaFiltro: string = 'Todas';
  textoBusqueda: string = '';
  actividadSeleccionada: any = null;

  nuevaActividad: any = {
    titulo: '',
    fecha: '',
    provincia: '',
    plazas_totales: ''
  };

  private reservaService = inject(Reserva);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  ngOnInit() {
    const state = history.state as { mensaje?: string };
    if (state?.mensaje) {
      this.mensajeConfirmacion = state.mensaje;
      setTimeout(() => this.mensajeConfirmacion = '', 5000);
    }
    this.cargarActividades();
  }

  onImagenSeleccionada(event: any) {
    if (event.target.files.length > 0) {
      this.imagenSeleccionada = event.target.files[0];
    }
  }

  cargarActividades() {
    this.reservaService.getActividades().subscribe({
      next: (data: any) => {
        this.todasLasActividades = data;
        this.aplicarFiltros();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert('Error al cargar las actividades');
      },
    });
  }

  filtrarPorProvincia(provincia: string) {
    this.provinciaFiltro = provincia;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let resultado = [...this.todasLasActividades];
    if (this.provinciaFiltro !== 'Todas') {
      resultado = resultado.filter(a => a.provincia === this.provinciaFiltro);
    }
    if (this.textoBusqueda.trim() !== '') {
      resultado = resultado.filter(a =>
        a.titulo.toLowerCase().includes(this.textoBusqueda.toLowerCase())
      );
    }
    this.actividades = resultado;
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

  guardarActividad(event: Event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append('titulo', this.nuevaActividad.titulo);
    formData.append('fecha', this.nuevaActividad.fecha);
    formData.append('provincia', this.nuevaActividad.provincia);
    formData.append('plazas_totales', this.nuevaActividad.plazas_totales);

    if (this.imagenSeleccionada) {
      formData.append('imagen', this.imagenSeleccionada);
    }

    this.reservaService.crearActividad(formData).subscribe({
      next: () => {
        alert('Actividad creada correctamente');
        this.limpiarFormulario();
        this.cargarActividades();
      },
      error: (err) => console.error('Error al crear:', err),
    });
  }

  eliminarActividad(id: number) {
    if (confirm('¿Seguro que quieres borrar esta actividad?')) {
      this.reservaService.eliminarActividad(id).subscribe({
        next: () => this.cargarActividades(),
        error: (err) => console.error(err),
      });
    }
  }

  irAEditar(id: number) {
    this.router.navigate(['/editar-actividad', id]);
  }

  limpiarFormulario() {
    this.nuevaActividad = {
      titulo: '',
      fecha: '',
      provincia: '',
      plazas_totales: ''
    };
    this.imagenSeleccionada = null;
    
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }
}