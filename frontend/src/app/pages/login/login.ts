import { Component, inject } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  formData = {
    email: '',
    password: ''
  };
  
  error = '';

  private auth = inject(Auth);
  private router = inject(Router);

  login() {
    this.error = '';

    if (!this.formData.email || !this.formData.password) {
      this.error = 'Por favor, rellena todos los campos';
      return;
    }

    this.auth.login(this.formData).subscribe({
      next: (res: any) => {
        this.auth.setUser(res);
        this.router.navigate(['/']);
      },
      error: () => {
        this.error = 'El email o la contraseña no son correctos';
      },
    });
  }
}