import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then((m) => m.Register),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile').then((m) => m.Profile),
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
