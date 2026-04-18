import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoginRequest, AuthResponse, RefreshTokenRequest } from '../models/auth.model';
import { Router } from '@angular/router';
import { catchError, of, tap, finalize } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  isAuthenticated = signal(!!this.getToken());

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  login(request: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => this.storeTokens(response)),
      catchError(err => {
        console.log(request);
        console.error('Login failed:', err);
        throw err;
      })
    );
  }

  storeTokens(response: AuthResponse) {
    localStorage.setItem('access_token', response.token);
    localStorage.setItem('refresh_token', response.refreshToken);
    localStorage.setItem('token_expiration', response.expiration);
    this.isAuthenticated.set(true);
  }

  refreshToken() {
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return;
    }

    const request = { token, refreshToken };
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, request).pipe(
      tap(response => this.storeTokens(response)),
      catchError(err => {
        console.error('Token refresh failed:', err);
        this.logout();
        throw err;
      })
    );
  }

  revokeRefreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return of(null);

    return this.http.post(`${this.apiUrl}/revoke-refresh-token`, { refreshToken }).pipe(
      catchError(err => {
        console.error('Revoke failed:', err);
        return of(null);
      })
    );
  }

  logout() {
    this.revokeRefreshToken().pipe(
      finalize(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_expiration');
        this.isAuthenticated.set(false);
        this.router.navigate(['/login']);
      })
    ).subscribe();
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
