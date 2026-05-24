import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Reserva {

  private url = 'http://localhost:8000/api/reservas.php';
  private urlActividades = 'http://localhost:8000/api/actividades.php';

  constructor(private http: HttpClient) { }

  getReservas() {
    return this.http.get(this.url, { headers: this.getAuthHeaders() });
  }

  crearReserva(data: any) {
    return this.http.post(this.url, data, { headers: this.getAuthHeaders() });
  }

  eliminarReserva(id: number) {
    return this.http.delete(`${this.url}?id=${id}`, { headers: this.getAuthHeaders() });
  }

  
  getActividades() {
    return this.http.get(this.urlActividades, { headers: this.getAuthHeaders() });
  }
  
  crearActividad(data: any) {
    return this.http.post(this.urlActividades, data, { headers: this.getAuthHeaders() });
  }

  actualizarActividad(id: number, data: any) {
    return this.http.put(`${this.urlActividades}?id=${id}`, data, { headers: this.getAuthHeaders() });
  }

  eliminarActividad(id: number) {
    return this.http.delete(`${this.urlActividades}?id=${id}`, { headers: this.getAuthHeaders() });
  }

  private getAuthHeaders(): HttpHeaders {
    const userStorage = localStorage.getItem('user');
    let token = '';

    if (userStorage) {
      const user = JSON.parse(userStorage);
      token = user.api_token || '';
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });
  }
}