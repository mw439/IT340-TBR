import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { NgIf, AsyncPipe } from '@angular/common';
import { AuthService } from './services/auth.service';  // adjust path if needed
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf, AsyncPipe],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {

  // observable that tells nav if user is logged in
  isLoggedIn$: Observable<boolean>;

  constructor(private auth: AuthService, private router: Router) {
    // hook isLoggedIn$ directly to AuthService
    this.isLoggedIn$ = this.auth.loggedIn$;

    // existing dark mode init (you can also keep this in ngOnInit if you prefer)
    const saved = localStorage.getItem('darkMode');
    if (saved === 'true') {
      document.body.classList.add('dark-mode');
    }
  }

  // Toggle between light and dark mode
  toggleDarkMode() {
    document.body.classList.toggle('dark-mode');

    const enabled = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', enabled ? 'true' : 'false');
  }

  onLogout() {
    this.auth.logout();
    this.router.navigate(['/']); // or '/home' if that’s your route
  }
}
