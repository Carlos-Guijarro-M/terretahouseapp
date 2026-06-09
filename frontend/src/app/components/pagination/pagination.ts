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
  @Input() totalPaginas: number = 0;
  @Input() paginaActual: number = 1;
  @Output() paginaCambiada = new EventEmitter<number>();

  get paginas() {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  cambiar(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaCambiada.emit(pagina);
  }
}