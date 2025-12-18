import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css'],
})
export class Checkout {
  // Shipping / contact (demo)
  fullName = '';
  email = '';
  address = '';
  city = '';
  state = '';
  zip = '';

  // Payment (demo fields only)
  cardName = '';
  cardNumber = '';
  exp = '';
  cvv = '';

  errorMessage = '';
  success = false;
  orderId = '';

  constructor(public cart: CartService, private router: Router) {}

  subtotal(): number {
    return this.cart.subtotal();
  }

  // Simple demo totals
  tax(): number {
    return Math.round(this.subtotal() * 0.07 * 100) / 100; // 7% demo tax
  }

  total(): number {
    return Math.round((this.subtotal() + this.tax()) * 100) / 100;
  }

  placeOrder(): void {
    this.errorMessage = '';

    if (this.cart.getItems().length === 0) {
      this.errorMessage = 'Your cart is empty.';
      return;
    }

    // Basic required fields
    const required = [this.fullName, this.email, this.address, this.city, this.state, this.zip];
    if (required.some(v => !String(v || '').trim())) {
      this.errorMessage = 'Please fill in all shipping/contact fields.';
      return;
    }

    // Payment is demo — we only check presence (no real charge)
    const payRequired = [this.cardName, this.cardNumber, this.exp, this.cvv];
    if (payRequired.some(v => !String(v || '').trim())) {
      this.errorMessage = 'Please fill in the payment fields (demo).';
      return;
    }

    // Success: generate an order id, clear cart
    this.orderId = 'TBR-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    this.cart.clear();
    this.success = true;

    // Optional: auto return after a few seconds (you can remove this)
    setTimeout(() => {
      this.router.navigate(['/home']);
    }, 2000);
  }
}
