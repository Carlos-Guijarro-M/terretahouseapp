import { Component, ChangeDetectorRef } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  formData = {
    email: '',
    password: ''
  };
  
  error: string = '';

  constructor(private auth: Auth, private router: Router, private cdr: ChangeDetectorRef) {}

  login() {
    this.error = '';

    if (!this.formData.email || !this.formData.password) {
      this.error = 'Por favor, rellena todos los campos';
      return;
    }

    this.auth.login(this.formData).subscribe({
      next: (res: any) => {
        this.auth.setUser(res);
        if(res.roles?.includes('ROLE_ADMIN')) {
          this.router.navigate(['/crear-reservas']);
        } else {
        this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Email o contraseña incorrectos';
        this.cdr.detectChanges();
      }
    });
  }
}