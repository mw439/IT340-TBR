import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';


export const routes: Routes = [

  // ---------- PUBLIC PAGES ----------
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home').then(m => m.Home),
  },
  {
    path: 'browse',
    loadComponent: () =>
      import('./pages/browse/browse').then(m => m.Browse),
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./pages/search/search').then(m => m.Search),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./pages/cart/cart').then(m => m.Cart),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout/checkout').then(m => m.Checkout),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact').then(m => m.Contact),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about').then(m => m.About),
  },
  {
    path: 'book-details',
    loadComponent: () =>
      import('./pages/book-details/book-details').then(m => m.BookDetails),
  },

  // ---------- AUTH PAGES ----------
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then(m => m.Login),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then(m => m.Register),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password').then(m => m.ForgotPassword),
  },

  // ---------- USER ----------
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile').then(m => m.Profile),
  },


  // ---------- FALLBACK ----------
  {
    path: 'not-found',
    loadComponent: () =>
      import('./pages/not-found/not-found').then(m => m.NotFound),
  },

  // ---------- DEFAULTS ----------
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/not-found' },

  { path: 'checkout', loadComponent: () => import('./pages/checkout/checkout').then(m => m.Checkout) },

];
