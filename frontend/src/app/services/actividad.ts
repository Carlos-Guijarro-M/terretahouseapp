import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActividadService {

  private apiUrl = 'http://localhost:8000/api/actividades.php';

  constructor(private http: HttpClient) { }

  getActividades(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}