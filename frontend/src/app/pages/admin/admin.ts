import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  
  private auth = inject(Auth);
  private router = inject(Router);

  ngOnInit() {
    const usuario = this.auth.getUser();

    if (usuario === null) {
      this.router.navigate(['/']);
      return;
    }

    if (usuario.roles && usuario.roles.includes('ROLE_ADMIN')) {
      console.log('Acceso concedido para el admin');
    } else {
      this.router.navigate(['/']);
    }
  }
}