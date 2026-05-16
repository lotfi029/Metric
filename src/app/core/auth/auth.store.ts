import { computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { firstValueFrom, interval, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthState, AuthResponse, LoginRequest, EffectivePermissionsResponse } from '../models';
import { TokenService } from './token.service';

interface AuthStoreState {
  user: AuthState | null;
  isLoading: boolean;
  error: string | null;
  polling: Subscription | null;
}

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthStoreState>({ user: null, isLoading: false, error: null, polling: null }),
  withComputed((store) => ({
    isAuthenticated: computed(() => store.user() !== null),
    permissions: computed(() => store.user()?.permissions ?? []),
    roles: computed(() => store.user()?.roles ?? []),
    isSupervisor: computed(() => store.user()?.isSupervisor ?? false),
  })),
  withMethods((store, http = inject(HttpClient), tokenService = inject(TokenService)) => ({
    can(permission: string): boolean {
      return store.user()?.permissions.includes(permission) ?? false;
    },

    hasRole(role: string): boolean {
      return store.user()?.roles.includes(role) ?? false;
    },

    setUserFromToken(token: string): void {
      patchState(store, { user: tokenService.parseUser(token), error: null });
    },

    updatePermissions(permissions: string[]): void {
      patchState(store, (state) => ({
        user: state.user ? { ...state.user, permissions } : null,
      }));
    },

    async login(credentials: LoginRequest): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const response = await firstValueFrom(
          http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials),
        );
        tokenService.setTokens(response.token, response.refreshToken);
        patchState(store, { user: tokenService.parseUser(response.token), isLoading: false });
      } catch (err: any) {
        const errors = err?.error?.extensions?.errors;
        const message = errors ? String(Object.values(errors).flat()[0]) : 'Login failed';
        patchState(store, { error: message, isLoading: false });
      }
    },

    async refreshPermissions(): Promise<void> {
      if (!store.user()) {
        return;
      }

      try {
        const response = await firstValueFrom(
          http.get<EffectivePermissionsResponse>(`${environment.apiUrl}/permissions/me`),
        );
        patchState(store, (state) => ({
          user: state.user ? { ...state.user, permissions: response.permissions } : null,
        }));
      } catch {
        // Keep the current UI permissions if this background refresh fails.
      }
    },

    initFromStorage(): void {
      const token = tokenService.getToken();
      if (token && !tokenService.isTokenExpired(token)) {
        patchState(store, { user: tokenService.parseUser(token), error: null });
      } else {
        tokenService.clear();
        patchState(store, { user: null });
      }
    },

    startPermissionPolling(): void {
      if (store.polling()) {
        return;
      }

      const subscription = interval(600_000).subscribe(() => {
        void this.refreshPermissions();
      });
      patchState(store, { polling: subscription });
    },

    stopPermissionPolling(): void {
      store.polling()?.unsubscribe();
      patchState(store, { polling: null });
    },

    async logout(): Promise<void> {
      const token = tokenService.getToken();
      const refreshToken = tokenService.getRefreshToken();
      if (token && refreshToken) {
        await firstValueFrom(
          http.post(`${environment.apiUrl}/auth/revoke-refresh-token`, { token, refreshToken }),
        ).catch(() => undefined);
      }
      this.stopPermissionPolling();
      tokenService.clear();
      patchState(store, { user: null });
    },
  })),
);
