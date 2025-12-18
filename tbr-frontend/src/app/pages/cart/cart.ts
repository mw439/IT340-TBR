import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css'],
})
export class Cart {
  constructor(public cart: CartService) {}

  items(): CartItem[] {
    return this.cart.getItems();
  }

  subtotal(): number {
    return this.cart.subtotal();
  }

  inc(item: CartItem): void {
    this.cart.setQty(item.book.key, item.qty + 1);
  }

  dec(item: CartItem): void {
    this.cart.setQty(item.book.key, Math.max(1, item.qty - 1));
  }

  remove(item: CartItem): void {
    this.cart.remove(item.book.key);
  }

  clear(): void {
    this.cart.clear();
  }
}
