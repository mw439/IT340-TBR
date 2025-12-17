import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register {
  username = '';
  email = '';
  password = '';
  errorMessage = '';

  // MFA enrollment step
  enrollStep = false;
  qrDataUrl = '';
  enrollToken = '';
  mfaCode = '';

  constructor(private auth: AuthService, private router: Router) {}

  onRegisterSubmit() {
    this.errorMessage = '';

    if (!this.username || !this.email || !this.password) {
      this.errorMessage = 'All fields are required.';
      return;
    }

    this.auth.register({ username: this.username, email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        if (res.enrollRequired && res.qrDataUrl && res.enrollToken) {
          this.enrollStep = true;
          this.qrDataUrl = res.qrDataUrl;
          this.enrollToken = res.enrollToken;
          localStorage.setItem('tbr_enroll_token', res.enrollToken);
          return;
        }

        this.errorMessage = res.message || 'Registration failed.';
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Registration failed.';
      },
    });
  }

  completeEnrollment() {
    this.errorMessage = '';

    const enrollToken = this.enrollToken || localStorage.getItem('tbr_enroll_token') || '';
    if (!enrollToken) {
      this.errorMessage = 'Enrollment expired. Please register again.';
      this.enrollStep = false;
      return;
    }

    if (!this.mfaCode || this.mfaCode.length < 6) {
      this.errorMessage = 'Enter the 6-digit code from Google Authenticator.';
      return;
    }

    this.auth.completeEnroll(enrollToken, this.mfaCode).subscribe({
      next: () => {
        localStorage.removeItem('tbr_enroll_token');
        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Invalid MFA code.';
      },
    });
  }
}
