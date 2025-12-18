import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CartService, CartBook } from '../../services/cart.service';

type BookResult = {
  key: string;
  title: string;
  author: string;
  isbn?: string;
  coverUrl?: string | null;
  price?: number;
  firstPublishYear?: number | null;
};

type BrowseSection = {
  title: string;
  query: string;
  items: BookResult[];
  limit: number;
  loading: boolean;
  error: string;
};

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './browse.html',
  styleUrls: ['./browse.css'],
})
export class Browse implements OnInit {
  pageLoading = false;
  pageError = '';

  sections: BrowseSection[] = [
    { title: 'Harry Potter Collection', query: 'harry potter', items: [], limit: 12, loading: false, error: '' },
    { title: 'Wizarding World (Rowling / Fantastic Beasts)', query: 'j k rowling fantastic beasts hogwarts', items: [], limit: 12, loading: false, error: '' },
    { title: 'Fantasy Best Sellers', query: 'fantasy bestseller', items: [], limit: 12, loading: false, error: '' },
    { title: 'Similar Series', query: 'percy jackson lord of the rings hobbit', items: [], limit: 12, loading: false, error: '' },
    { title: 'YA Fantasy', query: 'young adult fantasy', items: [], limit: 12, loading: false, error: '' },
    { title: 'Mystery & Adventure', query: 'mystery adventure novel', items: [], limit: 12, loading: false, error: '' },
  ];

  constructor(private http: HttpClient, private cart: CartService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  async loadAll(): Promise<void> {
    this.pageLoading = true;
    this.pageError = '';

    try {
      await Promise.all(this.sections.map((s) => this.loadSection(s)));
      this.pageLoading = false;
    } catch (err: any) {
      this.pageLoading = false;
      this.pageError = err?.message || 'Browse failed. Check internet access on Front-End VM.';
    }
  }

  async loadMore(section: BrowseSection): Promise<void> {
    section.limit += 12;
    await this.loadSection(section);
  }

  async refresh(): Promise<void> {
    this.sections.forEach((s) => {
      s.items = [];
      s.limit = 12;
      s.loading = false;
      s.error = '';
    });
    await this.loadAll();
  }

  addToCart(book: BookResult): void {
    const cartBook: CartBook = {
      key: book.key,
      title: book.title,
      author: book.author,
      coverUrl: book.coverUrl || null,
      price: Number(book.price || 10),
      isbn: book.isbn || '',
      firstPublishYear: book.firstPublishYear || null,
    };
    this.cart.add(cartBook, 1);
  }

  private async loadSection(section: BrowseSection): Promise<void> {
    section.loading = true;
    section.error = '';

    try {
      const books = await this.fetchBooks(section.query, section.limit);

      const map = new Map<string, BookResult>();
      [...section.items, ...books].forEach((b: BookResult) => {
        if (b.key) map.set(b.key, b);
      });

      section.items = Array.from(map.values()).slice(0, section.limit);
      section.loading = false;
    } catch (err: any) {
      section.loading = false;
      section.error = err?.message || 'Failed to load section.';
    }
  }

  private fetchBooks(query: string, limit: number): Promise<BookResult[]> {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}&page=1`;

    return new Promise<BookResult[]>((resolve, reject) => {
      this.http.get<any>(url).subscribe({
        next: (data: any) => {
          const docs: any[] = Array.isArray(data?.docs) ? data.docs : [];

          const mapped: BookResult[] = docs.map((doc: any) => {
            const coverId = doc?.cover_i;
            const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null;

            const seed = (doc?.title?.length || 10) + (doc?.first_publish_year || 0);
            const price = 9 + (seed % 16);

            return {
              key: doc?.key || '',
              title: doc?.title || 'Untitled',
              author: (doc?.author_name && doc.author_name[0]) ? doc.author_name[0] : 'Unknown',
              isbn: (doc?.isbn && doc.isbn[0]) ? doc.isbn[0] : '',
              coverUrl,
              price,
              firstPublishYear: doc?.first_publish_year || null,
            };
          });

          const map = new Map<string, BookResult>();
          mapped.forEach((b: BookResult) => {
            if (b.key) map.set(b.key, b);
          });

          resolve(Array.from(map.values()));
        },
        error: (e: any) => reject(e),
      });
    });
  }
}
