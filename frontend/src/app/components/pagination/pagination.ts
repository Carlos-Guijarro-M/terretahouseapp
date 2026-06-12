import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class Pagination {

  //@Input me permite que el component padre nos pase todos los datos
  @Input() totalPaginas: number = 0;
  @Input() paginaActual: number = 1;

  //En cambio @Output avisa al padre cuando el user hace click en el numero
  @Output() paginaCambiada = new EventEmitter<number>();

  get paginas() {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  cambiar(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaCambiada.emit(pagina);
  }
}