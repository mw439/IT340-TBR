import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AuthResponse {
  token: string;
  // add any other fields your backend returns if needed
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://192.168.229.20:5000/api/auth';

  // start as "logged in" if there's already a token in localStorage
  private loggedInSubject = new BehaviorSubject<boolean>(!!localStorage.getItem('tbr_token'));
  loggedIn$ = this.loggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((res) => {
        localStorage.setItem('tbr_token', res.token);
        this.loggedInSubject.next(true);
      })
    );
  }

  register(data: { username: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap((res) => {
        localStorage.setItem('tbr_token', res.token);
        this.loggedInSubject.next(true);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('tbr_token');
    this.loggedInSubject.next(false);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('tbr_token');
  }

  getUserFromToken() {
  const token = localStorage.getItem('tbr_token');
  if (!token) return null;

  // Decode token payload
  const payload = JSON.parse(atob(token.split('.')[1]));

  return {
    id: payload.id,
    email: payload.email,
    username: payload.username,
  };
}

}
