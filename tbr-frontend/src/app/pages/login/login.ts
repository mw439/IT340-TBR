import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AuthResponse } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  showLogin = true;
  showRegister = false;
  showForgot = false;

  loginEmail = '';
  loginPassword = '';

  registerUsername = '';
  registerEmail = '';
  registerPassword = '';
  registerConfirm = '';

  errorMessage = '';
  successMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  onLoginSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    this.auth.login({ email: this.loginEmail, password: this.loginPassword })
      .subscribe({
        next: (res: AuthResponse) => {
          localStorage.setItem('tbr_token', res.token);
          this.successMessage = 'Login successful! Redirecting...';
          this.router.navigate(['/browse']);
        },
        error: (err: any) => {
          this.errorMessage = err.error?.message || 'Login failed. Please check your email and password.';
        }
      });
  }

  onRegisterSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerPassword !== this.registerConfirm) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.auth.register({
      username: this.registerUsername,
      email: this.registerEmail,
      password: this.registerPassword
    }).subscribe({
      next: (res: AuthResponse) => {
        this.successMessage = 'Account created! You can now log in.';
        this.showRegister = false;
        this.showLogin = true;
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Registration failed.';
      }
    });
  }
}
