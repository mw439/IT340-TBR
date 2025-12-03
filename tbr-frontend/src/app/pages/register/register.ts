// src/app/pages/register/register.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService, AuthResponse } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  // form fields
  registerUsername = '';
  registerEmail = '';
  registerPassword = '';
  registerConfirm = '';

  // messages
  errorMessage = '';
  successMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

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
        // after a moment, go to login page
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Registration failed.';
      }
    });
  }
}
