import { Component, ChangeDetectorRef } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecaptchaModule } from 'ng-recaptcha';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, RecaptchaModule],
  templateUrl: './login.html',
  styleUrl: '/login.css'
})
export class Login {
  formData = {email: '', password: '', recaptcha_token: ''};
  
  error: string = '';

  constructor(private auth: Auth, private router: Router, private cdr: ChangeDetectorRef) {}

  resolved(token: string | null) {
    this.formData.recaptcha_token = token || '';
  }

  login() {
    this.error = '';

    if (!this.formData.email || !this.formData.password) {
      this.error = 'Por favor, rellena todos los campos';
      return;
    }

    if (!this.formData.recaptcha_token) {
      this.error = 'Por favor, completa el CAPTCHA.';
      return;
    }

    this.auth.login(this.formData).subscribe({
      next: (res: any) => {
        this.auth.setUser(res);
        if (this.auth.isAdmin()) {
          this.router.navigate(['/crear-reservas']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.error = (err.error && err.error.message) ? err.error.message : 'Email o contraseña incorrectos';
        this.cdr.detectChanges();
      }
    });
  }
}