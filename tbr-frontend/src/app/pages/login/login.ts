import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // RouterModule required for routerLink
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {  // Keep class name 'Login' to match route
  email = '';
  password = '';
  errorMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  onLoginSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Email and password are required.';
      return;
    }

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        localStorage.setItem('tbr_token', res.token);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Login failed.';
      },
    });
  }
}
