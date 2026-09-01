import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse, LoginRequest } from '../models/auth.model';
import { User, MeResponse, UserRole } from '../models/user.model';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'choufli_hal_token';
const USER_KEY = 'choufli_hal_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  private currentUserSubject = new BehaviorSubject<User | null>(this.loadStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  // ─── Login ───────────────────────────────────────────────

  login(email: string, password: string): Observable<AuthResponse> {
    const body: LoginRequest = { email, password };
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, body).pipe(
      tap((res) => {
        this.storeToken(res.token);
        const user: User = {
          id: res.id,
          email: res.email,
          firstName: res.firstName,
          lastName: res.lastName,
          role: res.role as UserRole,
          isActive: res.isActive ?? true,
        };
        this.storeUser(user);
        this.currentUserSubject.next(user);
      })
    );
  }

  // ─── Register Customer ───────────────────────────────────

  registerCustomer(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Observable<AuthResponse> {
    const params = new HttpParams()
      .set('firstName', firstName)
      .set('lastName', lastName);
    const body: LoginRequest = { email, password };
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/auth/register/customer`,
      body,
      { params }
    );
  }

  // ─── Register Contractor ─────────────────────────────────

  registerContractor(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Observable<AuthResponse> {
    const params = new HttpParams()
      .set('firstName', firstName)
      .set('lastName', lastName);
    const body: LoginRequest = { email, password };
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/auth/register/contractor`,
      body,
      { params }
    );
  }

  // ─── Get Current User ────────────────────────────────────

  getMe(): Observable<User | null> {
    return this.http.get<MeResponse>(`${this.apiUrl}/auth/me`).pipe(
      map((res) => {
        if (!res.authenticated || !res.id) {
          return null;
        }
        const user: User = {
          id: res.id,
          email: res.email!,
          firstName: res.firstName!,
          lastName: res.lastName!,
          role: res.role as UserRole,
          isActive: res.isActive ?? true,
        };
        this.storeUser(user);
        this.currentUserSubject.next(user);
        return user;
      }),
      catchError(() => {
        this.clearAuth();
        return of(null);
      })
    );
  }

  // ─── Logout ──────────────────────────────────────────────

  logout(): void {
    this.clearAuth();
    this.router.navigate(['/']);
  }

  // ─── Token ───────────────────────────────────────────────

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // ─── Auth State ──────────────────────────────────────────

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    return !this.isTokenExpired(token);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserRole(): UserRole | null {
    return this.currentUserSubject.value?.role ?? null;
  }

  // ─── Storage Helpers ─────────────────────────────────────

  private storeToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  private storeUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  private loadStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw && this.isAuthenticated()) {
        return JSON.parse(raw);
      }
    } catch {
      // corrupt storage — clear it
    }
    return null;
  }

  private clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSubject.next(null);
  }

  // ─── JWT Expiration Check ────────────────────────────────

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = payload.exp * 1000;
      return Date.now() >= expiresAt;
    } catch {
      return true;
    }
  }
}
