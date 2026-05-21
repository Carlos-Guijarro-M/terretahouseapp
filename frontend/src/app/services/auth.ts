import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators'; // Importante para interceptar la respuesta

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private url = 'http://localhost:8000/api';
  private currentUser: any = null;

  constructor(private http: HttpClient) {
    this.currentUser = this.loadUserFromStorage();
  }

  // Ahora el login guarda automáticamente el usuario si es exitoso
  login(data: any) {
    return this.http.post(`${this.url}/login.php`, data).pipe(
      tap((res: any) => {
        if (res) {
          this.setUser(res); // Guardamos en memoria y en localStorage
        }
      })
    );
  }

  register(data: any) {
    return this.http.post(`${this.url}/register.php`, data);
  }

  getUser() {
    // Retornamos el usuario actual. Si es nulo, intentamos recargar
    return this.currentUser;
  }

  // Método auxiliar para saber si es admin desde cualquier parte de la app
  isAdmin(): boolean {
    const user = this.getUser();
    return user && user.roles && user.roles.includes('ROLE_ADMIN');
  }

  setUser(user: any) {
    this.currentUser = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  clearUser() {
    this.currentUser = null;
    localStorage.removeItem('user');
  }

  logout() {
    // Al hacer logout, limpiamos localmente sin esperar necesariamente al servidor
    this.clearUser();
    return this.http.post(`${this.url}/logout.php`, {});
  }

  private loadUserFromStorage() {
    const data = localStorage.getItem('user');
    if (data !== null && data !== '') {
      try {
        return JSON.parse(data);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}