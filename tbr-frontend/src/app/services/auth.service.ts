import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

const API = 'http://192.168.229.20:5000/api/auth';

export interface LoginResponse {
  token?: string;
  mfaRequired?: boolean;
  tempToken?: string;
  message?: string;
}

export interface RegisterResponse {
  enrollRequired?: boolean;
  enrollToken?: string;
  qrDataUrl?: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedInSubject = new BehaviorSubject<boolean>(!!localStorage.getItem('tbr_token'));
  loggedIn$ = this.loggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Step 1: Register returns QR + enrollToken (NO final JWT yet)
  register(data: { username: string; email: string; password: string }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${API}/register`, data);
  }

  // Step 2: Complete enrollment with OTP -> returns real JWT
  completeEnroll(enrollToken: string, code: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${API}/mfa/complete-enroll`, {
      enrollToken,
      token: code,
    }).pipe(
      tap((res) => {
        localStorage.setItem('tbr_token', res.token);
        this.loggedInSubject.next(true);
      })
    );
  }

  // Step 1: Login returns tempToken (always)
  login(data: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API}/login`, data).pipe(
      tap((res) => {
        // ✅ Normal login: save token + mark logged in
        if (res?.token) {
          localStorage.setItem('tbr_token', res.token);
          this.loggedInSubject.next(true);
        }
      })
    );
  }


  // Step 2: Verify OTP -> returns real JWT
  verifyMfa(tempToken: string, code: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${API}/mfa/verify`, {
      tempToken,
      token: code,
    }).pipe(
      tap((res) => {
        localStorage.setItem('tbr_token', res.token);
        this.loggedInSubject.next(true);
      })
    );
  }
  getUserFromToken() {
    const token = localStorage.getItem('tbr_token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.id,
        email: payload.email,
        username: payload.username,
      };
    } catch {
      return null;
    }
  }
  
  logout(): void {
    localStorage.removeItem('tbr_token');
    localStorage.removeItem('tbr_mfa_temp');
    localStorage.removeItem('tbr_enroll_token');
    this.loggedInSubject.next(false);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('tbr_token');
  }
}
