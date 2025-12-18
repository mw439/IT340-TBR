import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { NgIf, AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';

import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf, AsyncPipe],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  isLoggedIn$: Observable<boolean>;
  cartCount$: Observable<number>;

  constructor(
    private auth: AuthService,
    private router: Router,
    private cart: CartService
  ) {
    this.isLoggedIn$ = this.auth.loggedIn$;
    this.cartCount$ = this.cart.count$;

    const saved = localStorage.getItem('darkMode');
    if (saved === 'true') {
      document.body.classList.add('dark-mode');
    }
  }

  toggleDarkMode(): void {
    document.body.classList.toggle('dark-mode');
    const enabled = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', enabled ? 'true' : 'false');
  }

  onLogout(): void {
    this.auth.logout();
    this.router.navigate(['/home']);
  }
}
