import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private url = 'http://localhost:8000/api';
  private currentUser: any = null;

  constructor(private http: HttpClient) {
    this.currentUser = this.loadUserFromStorage();
  }

  login(data: any) {
    return this.http.post(`${this.url}/login.php`, data);
  }

  register(data: any) {
    return this.http.post(`${this.url}/register.php`, data);
  }

  getUser() {
    return this.currentUser;
  }

  setUser(user: any) {
    this.currentUser = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('user');
    return this.http.post(`${this.url}/logout.php`, {});
  }

  private loadUserFromStorage() {
    const data = localStorage.getItem('user');
    if (data) {
      return JSON.parse(data);
    }
    return null;
  }
}