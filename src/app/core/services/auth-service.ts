import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

interface AuthResponse { accessToken: string; refreshToken?: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // BehaviorSubject untuk token reactive di seluruh app
  private tokens$ = new BehaviorSubject<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  );

  readonly isLoggedIn$ = this.tokens$.pipe(map(t => !!t));
  readonly token = () => this.tokens$.value;

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.apiBaseUrl}/auth/login`,
      { username, password, expiresInMins: 30 }
    ).pipe(
      tap(res => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', res.accessToken);
        }
        this.tokens$.next(res.accessToken);
      })
    );
  }

  refreshToken(): Observable<string> {
    const current = this.tokens$.value;
    if (!current) return throwError(() => new Error('No token'));

    return this.http.post<AuthResponse>(
      `${environment.apiBaseUrl}/auth/refresh`,
      { refreshToken: current, expiresInMins: 30 }
    ).pipe(
      map(res => res.accessToken),
      tap(newToken => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', newToken);
        }
        this.tokens$.next(newToken);
      }),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
    this.tokens$.next(null);
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null { 
    return this.tokens$.value; 
  }
}