import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
// remove the Register import completely

export const routes: Routes = [
  { path: 'login', component: Login },

  // Optional: make /register also show the Login page,
  // since your login page has the Register panel built-in.
  { path: 'register', component: Login },

  // other routes...
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
