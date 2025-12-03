import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // RouterModule needed for routerLink
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register {
  username = '';
  email = '';
  password = '';
  confirm = '';
  errorMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  onRegisterSubmit() {
    if (!this.username || !this.email || !this.password) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    if (this.password !== this.confirm) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.auth
      .register({ username: this.username, email: this.email, password: this.password })
      .subscribe({
        next: (res) => {
          localStorage.setItem('tbr_token', res.token);
          this.router.navigate(['/login']); // optional: navigate to login after successful register
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Registration failed.';
        },
      });
  }
}
