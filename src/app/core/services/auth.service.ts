import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, computed, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, Observable, of, tap } from 'rxjs';
import { apiConfig, buildApiUrl } from '../config/api.config';
import { AuthResponse, LoginRequest } from '../../shared/models/auth.models';

const AUTH_STORAGE_KEY = 'prazos-sign.auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly sessionState = signal<AuthResponse | null>(this.readStoredSession());

  readonly session = this.sessionState.asReadonly();
  readonly user = computed(() => this.sessionState()?.user ?? null);
  readonly isAuthenticated = computed(() => Boolean(this.sessionState()?.accessToken));

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(buildApiUrl(apiConfig.endpoints.login), credentials)
      .pipe(tap((response) => this.persistSession(response)));
  }

  logout(): Observable<void> {
    if (!this.getAccessToken()) {
      this.clearSession();
      return of(void 0);
    }

    return this.http.post<void>(buildApiUrl(apiConfig.endpoints.logout), null).pipe(
      catchError(() => of(void 0)),
      tap(() => this.clearSession())
    );
  }

  getAccessToken(): string | null {
    return this.sessionState()?.accessToken ?? null;
  }

  private persistSession(response: AuthResponse): void {
    this.sessionState.set(response);

    if (!this.isBrowser()) {
      return;
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(response));
  }

  private clearSession(): void {
    this.sessionState.set(null);

    if (!this.isBrowser()) {
      return;
    }

    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  private readStoredSession(): AuthResponse | null {
    if (!this.isBrowser()) {
      return null;
    }

    const rawSession = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!rawSession) {
      return null;
    }

    try {
      return JSON.parse(rawSession) as AuthResponse;
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
