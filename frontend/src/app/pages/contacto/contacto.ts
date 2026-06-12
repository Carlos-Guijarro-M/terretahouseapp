import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacto',
  imports: [FormsModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css',
})
export class Contacto {

  texto = { nombre: '', correo: '', mensaje: '' };

  enviarMensaje(){
    alert('Mensaje enviado correctamente');
    this.texto = { nombre: '', correo: '', mensaje: '' };
  }
}
