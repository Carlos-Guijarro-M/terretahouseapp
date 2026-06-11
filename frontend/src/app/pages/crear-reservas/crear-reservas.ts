import { Component, OnInit, inject, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Reserva } from '../../services/reserva';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { SafeHtmlPipe } from '../../pipes/safe-html-pipe';
import { Pagination } from '../../components/pagination/pagination';

@Component({
  selector: 'app-crear-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule, SafeHtmlPipe, Pagination],
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
  actividadUsuarios: any = null;
  usuariosActividad: any[] = [];
  ordenAsc : 'asc' | 'desc' | null = null;

  elementosPorPagina: number = 6;
  paginaActual: number = 1;

  get actividadesPaginadas() {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    return this.actividades.slice(inicio, inicio + this.elementosPorPagina);
  }

  get totalPaginas() {
    return Math.ceil(this.actividades.length / this.elementosPorPagina);
  }

  nuevaActividad: any = {
    titulo: '',
    descripcion: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    provincia: '',
    plazas_totales: '',
    mapa_iframe: ''
  };

  private reservaService = inject(Reserva);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private auth = inject(Auth);

  ngOnInit() {

    if (!this.auth.getUser()) {
      this.router.navigate(['/login']);
      return;
    }
    if (!this.auth.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }
    
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
    this.paginaActual = 1;
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
    this.paginaActual = 1;
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
    formData.append('descripcion', this.nuevaActividad.descripcion);
    formData.append('fecha_actividad', this.nuevaActividad.fecha);
    formData.append('hora_inicio', this.nuevaActividad.hora_inicio);
    formData.append('hora_fin', this.nuevaActividad.hora_fin);
    formData.append('provincia', this.nuevaActividad.provincia);
    formData.append('plazas_totales', this.nuevaActividad.plazas_totales);
    formData.append('mapa_iframe', this.nuevaActividad.mapa_iframe);

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

  verUsuarios(actividad: any) {
    this.actividadUsuarios = actividad;
    this.usuariosActividad = [];
    document.body.style.overflow = 'hidden';

    this.reservaService.getUsuariosActividad(actividad.id).subscribe({
      next: (data: any) => {
        setTimeout(() => {
          this.usuariosActividad = data;
          this.cdr.detectChanges();
        }, 100);
      },
      error: (err) => console.error(err)
    });
  }

  cerrarModalUsuarios() {
    this.actividadUsuarios = null;
    this.usuariosActividad = [];
    document.body.style.overflow = '';
  }

  eliminarReservaDeActividad(reservaId: number) {
    if (confirm('¿Seguro que quieres eliminar esta reserva?')) {
      this.reservaService.eliminarReservaDeActividad(reservaId).subscribe({
        next: () => {
          this.usuariosActividad = this.usuariosActividad.filter(u => u.reserva_id !== reservaId);
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err)
      });
    }
  }
  ordenar(campo: string) {
  if (this.ordenAsc === null) {
    this.ordenAsc = 'asc';
  } else if (this.ordenAsc === 'asc') {
    this.ordenAsc = 'desc';
  } else {
    this.ordenAsc = null;
  }

  if (this.ordenAsc === null) {
    this.cargarActividades();
    return;
  }

  this.actividades = [...this.actividades].sort((a, b) => {
    const valA = (a[campo] || '').toString().toLowerCase();
    const valB = (b[campo] || '').toString().toLowerCase();
    
    if (this.ordenAsc === 'asc') {
      return valA.localeCompare(valB);
    } else {
      return valB.localeCompare(valA);
    }
  });

  this.paginaActual = 1;
  this.cdr.detectChanges();
}
}