import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private url = 'http://localhost:8000/api';
  // Usamos BehaviorSubject para mantener el estado del usuario actual y permitir que otros componentes se suscriban a los cambios
  private currentUser$ = new BehaviorSubject<any>(this.loadUserFromStorage());

  constructor(private http: HttpClient) {}

  login(data: any) {
    return this.http.post(`${this.url}/login.php`, data);
  }

  register(formData: FormData) {
    return this.http.post(`${this.url}/register.php`, formData);
  }

  updateProfile(formData: FormData) {
    return this.http.post(`${this.url}/editar_perfil.php`, formData);
  }

  getUser() {
    return this.currentUser$.getValue();
  }

  setUser(user: any) {
    this.currentUser$.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUserObservable() {
    return this.currentUser$.asObservable();
  }

  logout() {
    this.currentUser$.next(null);
    localStorage.removeItem('user');
    return this.http.post(`${this.url}/logout.php`, {});
  }

  private loadUserFromStorage() {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  }
}