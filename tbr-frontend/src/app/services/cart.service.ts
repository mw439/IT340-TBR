import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type CartBook = {
  key: string;
  title: string;
  author: string;
  coverUrl?: string | null;
  price: number;
  isbn?: string;
  firstPublishYear?: number | null;
};

export type CartItem = {
  book: CartBook;
  qty: number;
};

const STORAGE_KEY = 'tbr_cart_v1';

@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>(this.read());
  items$ = this.itemsSubject.asObservable();

  private countSubject = new BehaviorSubject<number>(this.countItems(this.itemsSubject.value));
  count$ = this.countSubject.asObservable();

  getItems(): CartItem[] {
    return this.itemsSubject.value;
  }

  add(book: CartBook, qty: number = 1): void {
    const items = [...this.itemsSubject.value];

    const idx = items.findIndex(i => i.book.key === book.key);
    if (idx >= 0) {
      items[idx] = { ...items[idx], qty: items[idx].qty + qty };
    } else {
      items.push({ book, qty });
    }

    this.write(items);
    this.itemsSubject.next(items);
    this.countSubject.next(this.countItems(items));
  }

  remove(bookKey: string): void {
    const items = this.itemsSubject.value.filter(i => i.book.key !== bookKey);
    this.write(items);
    this.itemsSubject.next(items);
    this.countSubject.next(this.countItems(items));
  }

  setQty(bookKey: string, qty: number): void {
    const safeQty = Math.max(1, Math.floor(qty || 1));
    const items = this.itemsSubject.value.map(i =>
      i.book.key === bookKey ? { ...i, qty: safeQty } : i
    );
    this.write(items);
    this.itemsSubject.next(items);
    this.countSubject.next(this.countItems(items));
  }

  clear(): void {
    this.write([]);
    this.itemsSubject.next([]);
    this.countSubject.next(0);
  }

  subtotal(): number {
    return this.itemsSubject.value.reduce((sum, i) => sum + (i.book.price * i.qty), 0);
  }

  private countItems(items: CartItem[]): number {
    return items.reduce((sum, i) => sum + i.qty, 0);
  }

  private read(): CartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed as CartItem[];
    } catch {
      return [];
    }
  }

  private write(items: CartItem[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
}
