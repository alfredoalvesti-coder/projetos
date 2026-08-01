import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export type Role = 'CLIENTE' | 'ADMIN';

export interface AuthResponse {
  token: string;
  nome: string;
  email: string;
  role: Role;
}

export interface UserResponse {
  id: number;
  nome: string;
  email: string;
  role: Role;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface RegisterPayload {
  nome: string;
  email: string;
  senha: string;
}

interface StoredSession {
  token: string;
  nome: string;
  email: string;
  role: Role;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'barbearia_singer_auth';
  private readonly sessionSignal = signal<StoredSession | null>(this.readSession());

  readonly session = this.sessionSignal.asReadonly();

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/api/auth/login`, payload)
      .pipe(tap((response) => this.persist(response)));
  }

  register(payload: RegisterPayload): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${environment.apiUrl}/api/auth/register`, payload);
  }

  me(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${environment.apiUrl}/api/auth/me`);
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.sessionSignal.set(null);
    void this.router.navigateByUrl('/home');
  }

  getToken(): string | null {
    return this.sessionSignal()?.token ?? null;
  }

  isAuthenticated(): boolean {
    return !!this.sessionSignal()?.token;
  }

  redirectAfterLogin(role: Role, returnUrl?: string | null): void {
    if (role === 'ADMIN') {
      void this.router.navigateByUrl('/admin/dashboard');
      return;
    }

    const safeReturn =
      returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/home';
    void this.router.navigateByUrl(safeReturn);
  }

  private persist(response: AuthResponse): void {
    const session: StoredSession = {
      token: response.token,
      nome: response.nome,
      email: response.email,
      role: response.role
    };
    localStorage.setItem(this.storageKey, JSON.stringify(session));
    this.sessionSignal.set(session);
  }

  private readSession(): StoredSession | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as StoredSession;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }
}
