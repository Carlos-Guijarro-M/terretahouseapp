import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Guias } from './pages/guias/guias';
import { Ofertas } from './pages/ofertas/ofertas';
import { Contacto } from './pages/contacto/contacto';
import { Admin } from './pages/admin/admin';
import { MisReservas } from './pages/mis-reservas/mis-reservas';
import { CrearReservas } from './pages/crear-reservas/crear-reservas';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'guias', component: Guias },
  { path: 'ofertas', component: Ofertas },
  { path: 'contacto', component: Contacto },
  { path: 'admin', component: Admin },
  { path: 'mis-reservas', component: MisReservas },
  { path: 'crear-reservas', component: CrearReservas }
];