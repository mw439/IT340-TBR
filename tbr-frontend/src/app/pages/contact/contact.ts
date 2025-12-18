import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css'],
})
export class Contact {
  name = '';
  email = '';
  subject = '';
  message = '';

  errorMessage = '';
  successMessage = '';

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.name.trim() || !this.email.trim() || !this.subject.trim() || !this.message.trim()) {
      this.errorMessage = 'Please fill in all fields before sending.';
      return;
    }

    // Demo send (Milestone 3 friendly)
    this.successMessage = `Thanks, ${this.name}! Your message was sent (demo).`;

    // Clear form
    this.name = '';
    this.email = '';
    this.subject = '';
    this.message = '';
  }
}
