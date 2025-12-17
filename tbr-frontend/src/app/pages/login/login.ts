import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  email = '';
  password = '';
  errorMessage = '';

  // MFA state (no new page needed)
  mfaStep = false;
  mfaCode = '';
  tempToken = '';

  constructor(private auth: AuthService, private router: Router) {}

  onLoginSubmit() {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Email and password are required.';
      return;
    }

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        // If MFA is required, show MFA input on the same page
        if (res.mfaRequired && res.tempToken) {
          this.mfaStep = true;
          this.tempToken = res.tempToken;
          localStorage.setItem('tbr_mfa_temp', res.tempToken);
          return;
        }

        // Normal login
        if (res.token) {
          this.router.navigate(['/home']);
          return;
        }

        this.errorMessage = res.message || 'Login failed.';
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Login failed.';
      },
    });
  }

  onMfaSubmit() {
    this.errorMessage = '';

    const temp = this.tempToken || localStorage.getItem('tbr_mfa_temp') || '';
    if (!temp) {
      this.errorMessage = 'MFA session expired. Please login again.';
      this.mfaStep = false;
      return;
    }

    if (!this.mfaCode || this.mfaCode.length < 6) {
      this.errorMessage = 'Enter the 6-digit code.';
      return;
    }

    this.auth.verifyMfa(temp, this.mfaCode).subscribe({
      next: () => {
        localStorage.removeItem('tbr_mfa_temp');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Invalid MFA code.';
      },
    });
  }

  backToLogin() {
    this.mfaStep = false;
    this.mfaCode = '';
    this.tempToken = '';
    localStorage.removeItem('tbr_mfa_temp');
  }
}
