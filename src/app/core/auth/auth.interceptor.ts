import { inject } from '@angular/core';
import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, finalize, switchMap, take, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models';
import { TokenService } from './token.service';
import { AuthStore } from './auth.store';

const isRefreshing$ = new BehaviorSubject<boolean>(false);
const refreshTokenSubject$ = new BehaviorSubject<string | null>(null);

const addToken = (request: HttpRequest<unknown>, token: string): HttpRequest<unknown> =>
  request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

const skipAuth = (url: string): boolean =>
  url.includes('/api/auth/login') || url.includes('/api/auth/refresh-token') || url.endsWith('/auth/login') || url.endsWith('/auth/refresh-token');

const handle401 = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  tokenService: TokenService,
  http: HttpClient,
  authStore: InstanceType<typeof AuthStore>,
  router: Router,
) => {
  const token = tokenService.getToken();
  const refreshToken = tokenService.getRefreshToken();

  if (!token || !refreshToken) {
    void authStore.logout().then(() => router.navigate(['/login']));
    return throwError(() => new Error('Missing refresh token'));
  }

  if (isRefreshing$.value) {
    return refreshTokenSubject$.pipe(
      filter((newToken): newToken is string => newToken !== null),
      take(1),
      switchMap(newToken => next(addToken(req, newToken))),
    );
  }

  isRefreshing$.next(true);
  refreshTokenSubject$.next(null);

  return http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh-token`, { token, refreshToken }).pipe(
    switchMap(response => {
      tokenService.setTokens(response.token, response.refreshToken);
      authStore.setUserFromToken(response.token);
      refreshTokenSubject$.next(response.token);
      return next(addToken(req, response.token));
    }),
    catchError(error => {
      void authStore.logout().then(() => router.navigate(['/login']));
      return throwError(() => error);
    }),
    finalize(() => isRefreshing$.next(false)),
  );
};

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const http = inject(HttpClient);
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const token = tokenService.getToken();
  const request = token && !skipAuth(req.url) ? addToken(req, token) : req;

  return next(request).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !skipAuth(req.url)) {
        return handle401(request, next, tokenService, http, authStore, router);
      }
      return throwError(() => error);
    }),
  );
};
