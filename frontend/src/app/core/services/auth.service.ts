// frontend/src/app/core/services/auth.service.ts

import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { tap, Observable } from 'rxjs';
import { Admin, AdminRole } from '../models/admin.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

// ─── Response Shape ───────────────────────────────────────────────────────────
interface LoginResponseData {
  token: string;
  admin: Admin;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl    = environment.apiUrl;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser  = isPlatformBrowser(this.platformId);

  // ─── Reactive State (Signals) ──────────────────────────────
  // Only used for auth state — not overbuilt elsewhere
  private _currentAdmin = signal<Admin | null>(null);
  private _token        = signal<string | null>(null);

  // ─── Public Readonly Signals ───────────────────────────────
  readonly currentAdmin = this._currentAdmin.asReadonly();
  readonly token        = this._token.asReadonly();

  // ─── Computed Signals ──────────────────────────────────────
  readonly isLoggedIn     = computed(() => !!this._token());
  readonly isSuperAdmin   = computed(() => this._currentAdmin()?.role === 'super_admin');
  readonly isComplexAdmin = computed(() => this._currentAdmin()?.role === 'complex_admin');
  readonly isBuildingAdmin = computed(() => this._currentAdmin()?.role === 'building_admin');

  constructor(
    private http:   HttpClient,
    private router: Router
  ) {
    // Rehydrate from localStorage on app start
    this.loadFromStorage();
  }

  // ─── Auth Actions ──────────────────────────────────────────

  login(email: string, password: string): Observable<ApiResponse<LoginResponseData>> {
    return this.http
      .post<ApiResponse<LoginResponseData>>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.persistSession(response.data.token, response.data.admin);
          }
        })
      );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  // ─── Role Checking ─────────────────────────────────────────

  hasRole(roles: AdminRole[]): boolean {
    const admin = this._currentAdmin();
    return admin ? roles.includes(admin.role) : false;
  }

  // ─── Storage Helpers ───────────────────────────────────────

  private persistSession(token: string, admin: Admin): void {
    this._token.set(token);
    this._currentAdmin.set(admin);

    if (this.isBrowser) {
      localStorage.setItem('token', token);
      localStorage.setItem('currentAdmin', JSON.stringify(admin));
    }
  }

  private loadFromStorage(): void {
    if (!this.isBrowser) return;

    const token    = localStorage.getItem('token');
    const adminStr = localStorage.getItem('currentAdmin');

    if (token && adminStr) {
      try {
        const admin = JSON.parse(adminStr) as Admin;
        this._token.set(token);
        this._currentAdmin.set(admin);
      } catch {
        // Corrupted storage — clear it
        this.clearSession();
      }
    }
  }

  private clearSession(): void {
    this._token.set(null);
    this._currentAdmin.set(null);

    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentAdmin');
    }
  }
}