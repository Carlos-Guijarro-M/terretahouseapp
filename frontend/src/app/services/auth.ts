import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private url = 'http://localhost:8000/api';
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

  esRol(rolRequerido: string): boolean {
    const user = this.getUser();
    if (!user || !Array.isArray(user.roles)) return false;
    return user.roles.map((r: string) => r.toLowerCase()).includes(rolRequerido.toLowerCase());
  }

  isAdmin(): boolean {
    return this.esRol('ROLE_ADMIN');
  }

  logout() {
    const user = this.getUser();
    const token = user ? user.api_token : null;

    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + (token || '')
    });

    this.currentUser$.next(null);
    localStorage.removeItem('user');

    return this.http.post(`${this.url}/logout.php`, {}, { headers });
  }

  private loadUserFromStorage() {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  }
}