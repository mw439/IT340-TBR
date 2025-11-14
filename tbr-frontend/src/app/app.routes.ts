// // import { Routes } from '@angular/router';

// // export const routes: Routes = [];
// import { Login} from './pages/login/login';
// import { Register} from './pages/register/register';
// import { ForgotPassword} from './pages/forgot-password/forgot-password';
// import { Browse} from './pages/browse/browse';
// import { Search} from './pages/search/search';
// import { Cart } from './pages/cart/cart';
// import { Checkout} from './pages/checkout/checkout';
// import { BookDetails} from './pages/book-details/book-details';
// import { Profile} from './pages/profile/profile';
// import { About} from './pages/about/about';
// import { Contact } from './pages/contact/contact';
// import { NotFound} from './pages/not-found/not-found';

// export const routes: Routes = [
//   { path: '', redirectTo: '/browse', pathMatch: 'full' },
//   { path: 'login', component: Login },
//   { path: 'register', component: Register},
//   { path: 'forgot-password', component: ForgotPassword },
//   { path: 'browse', component: Browse},
//   { path: 'search', component: Search },
//   { path: 'cart', component: Cart },
//   { path: 'checkout', component: Checkout},
//   { path: 'book-details', component: BookDetails},
//   { path: 'profile', component: Profile},
//   { path: 'about', component: About},
//   { path: 'contact', component: Contact},
//   { path: '**', component: NotFound}
// ];

// import { Routes } from '@angular/router';

// // Standalone page imports
// import { Home } from './home/home';
// import { Login } from './pages/login/login';
// import { Register } from './pages/register/register';
// import { ForgotPassword } from './pages/forgot-password/forgot-password';
// import { Browse } from './pages/browse/browse';
// import { Search } from './pages/search/search';
// import { Cart } from './pages/cart/cart';
// import { Checkout } from './pages/checkout/checkout';
// import { BookDetails } from './pages/book-details/book-details';
// import { Profile } from './pages/profile/profile';
// import { About } from './pages/about/about';
// import { Contact } from './pages/contact/contact';
// import { NotFound } from './pages/not-found/not-found';

// export const routes: Routes = [
//   { path: '', component: Home }, // Home page
//   { path: 'login', component: Login },
//   { path: 'register', component: Register },
//   { path: 'forgot-password', component: ForgotPassword },
//   { path: 'browse', component: Browse },
//   { path: 'search', component: Search },
//   { path: 'cart', component: Cart },
//   { path: 'checkout', component: Checkout },
//   { path: 'book-details', component: BookDetails },
//   { path: 'profile', component: Profile },
//   { path: 'about', component: About },
//   { path: 'contact', component: Contact },
//   { path: '**', component: NotFound }, // 404 fallback
// ];
import { Routes } from '@angular/router';

import { Home } from './home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { Browse } from './pages/browse/browse';
import { Search } from './pages/search/search';
import { Cart } from './pages/cart/cart';
import { Checkout } from './pages/checkout/checkout';
import { BookDetails } from './pages/book-details/book-details';
import { Profile } from './pages/profile/profile';
import { About } from './pages/about/about';
import { Contact } from './pages/contact/contact';
import { NotFound } from './pages/not-found/not-found';

export const routes: Routes = [
  { path: '', component: Home }, // Home page
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'browse', component: Browse },
  { path: 'search', component: Search },
  { path: 'cart', component: Cart },
  { path: 'checkout', component: Checkout },
  { path: 'book-details', component: BookDetails },
  { path: 'profile', component: Profile },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },
  { path: '**', component: NotFound }, // 404 fallback
];
