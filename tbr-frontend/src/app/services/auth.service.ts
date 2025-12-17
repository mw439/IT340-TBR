import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginResponse {
  token?: string;
  mfaRequired?: boolean;
  tempToken?: string;
  message?: string;
}

export interface AuthResponse {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://192.168.229.20:5000/api/auth';

  private loggedInSubject = new BehaviorSubject<boolean>(!!localStorage.getItem('tbr_token'));
  loggedIn$ = this.loggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(data: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((res) => {
        // ONLY store token if backend returned a real JWT (non-MFA users)
        if (res.token) {
          localStorage.setItem('tbr_token', res.token);
          this.loggedInSubject.next(true);
        }
      })
    );
  }

  verifyMfa(tempToken: string, code: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/mfa/verify`, {
      tempToken,
      token: code,
    }).pipe(
      tap((res) => {
        localStorage.setItem('tbr_token', res.token);
        this.loggedInSubject.next(true);
      })
    );
  }

  // Used to enable MFA (QR + confirm). You can call these later from curl/Postman.
  setupMfa(): Observable<{ qrDataUrl: string; message: string }> {
    const token = localStorage.getItem('tbr_token') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<{ qrDataUrl: string; message: string }>(`${this.apiUrl}/mfa/setup`, {}, { headers });
  }

  enableMfa(code: string): Observable<{ message: string }> {
    const token = localStorage.getItem('tbr_token') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<{ message: string }>(`${this.apiUrl}/mfa/enable`, { token: code }, { headers });
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
    localStorage.removeItem('tbr_mfa_temp');
    this.loggedInSubject.next(false);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('tbr_token');
  }

  getUserFromToken() {
    const token = localStorage.getItem('tbr_token');
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.id,
      email: payload.email,
      username: payload.username,
    };
  }
}
