import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

type BookResult = {
  key: string;
  title: string;
  author: string;
  isbn?: string;
  coverUrl?: string | null;
  price?: number;
  firstPublishYear?: number | null;
};

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.html',
  styleUrls: ['./search.css'],
})
export class Search {
  query = '';
  loading = false;
  errorMessage = '';
  results: BookResult[] = [];

  constructor(private http: HttpClient) {}

  onSearch(): void {
    this.errorMessage = '';
    const q = (this.query || '').trim();

    if (!q) {
      this.results = [];
      this.errorMessage = 'Type something to search (example: harry potter).';
      return;
    }

    this.loading = true;
    this.results = [];

    // Open Library search (frontend has internet access per IT340 design)
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=25`;

    this.http.get<any>(url).subscribe({
      next: (data: any) => {
        const docs = Array.isArray(data?.docs) ? data.docs : [];

        this.results = docs.map((doc: any) => {
          const coverId = doc?.cover_i;
          const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null;

          // simple demo price (store-style)
          const price = 10 + Math.floor(Math.random() * 15);

          return {
            key: doc?.key || '',
            title: doc?.title || 'Untitled',
            author: (doc?.author_name && doc.author_name[0]) ? doc.author_name[0] : 'Unknown',
            isbn: (doc?.isbn && doc.isbn[0]) ? doc.isbn[0] : '',
            coverUrl,
            price,
            firstPublishYear: doc?.first_publish_year || null,
          } as BookResult;
        });

        if (this.results.length === 0) {
          this.errorMessage = 'No results found. Try a different keyword.';
        }

        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.results = [];
        this.errorMessage =
          err?.message ||
          'Search failed. This VM may not have internet access.';
      },
    });
  }

  clear(): void {
    this.query = '';
    this.results = [];
    this.errorMessage = '';
    this.loading = false;
  }
}
