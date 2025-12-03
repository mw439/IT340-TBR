// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // IMPORTANT:
  // If Angular is running in the browser on the *front-end VM*,
  // use the *backend VM's IP* here (NOT localhost on your Mac).
  //
  // Example if backend VM = 192.168.101.20:
  // private apiUrl = 'http://192.168.101.20:5000/api/auth';

  private apiUrl = 'http://localhost:5000/api/auth'; // adjust to your setup

  constructor(private http: HttpClient) {}

  register(data: { username: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data);
  }

  login(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data);
  }
}
