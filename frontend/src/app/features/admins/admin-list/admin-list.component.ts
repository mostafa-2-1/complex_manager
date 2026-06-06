import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import {
  Admin,
  ROLE_OPTIONS,
  STATUS_OPTIONS
} from '../../../core/models/admin.model';

import { Pagination } from '../../../core/models/api-response.model';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-admin-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    PaginationComponent
  ],
  templateUrl: './admin-list.component.html'
})
export class AdminListComponent {
  // ── 1. Modern Dependency Injection ────────────────────────
  private adminService = inject(AdminService);
  public authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // ── 2. Content State Signals ──────────────────────────────
  readonly admins = signal<Admin[]>([]);
  readonly pagination = signal<Pagination | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');

  // ── 3. Component Model Inputs (Local Bindings) ────────────
  searchTerm = signal('');
  roleFilter = signal('');
  statusFilter = signal('');
  currentPage = signal(1);
  perPage = signal(10);

  readonly roleOptions = ROLE_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;

  constructor() {
    // Sync initial route query values to our signals instantly
    const params = this.route.snapshot.queryParams;
    this.currentPage.set(Number(params['page']) || 1);
    this.perPage.set(Number(params['per_page']) || 10);
    this.searchTerm.set(params['search'] || '');
    this.roleFilter.set(params['role'] || '');
    this.statusFilter.set(params['status'] || '');

    // Initial load call
    this.loadAdmins();

    // ── 4. Reactive Search Pipeline ──────────────────────────
    // Listens to character typing, debounces, then runs URL updating and refetches
    toObservable(this.searchTerm)
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage.set(1);
        this.loadAdmins();
      });

    // Reactive effect to keep URL queries perfectly synced whenever filters change
    effect(() => {
      this.updateUrl();
    });
  }

  // ── 5. Data Fetching Operations ───────────────────────────
  loadAdmins(): void {
    this.loading.set(true);
    this.error.set('');

    this.adminService.getAdmins({
      page: this.currentPage(),
      per_page: this.perPage(),
      search: this.searchTerm(),
      role: this.roleFilter(),
      status: this.statusFilter()
    }).subscribe({
      next: (res) => {
        this.admins.set(res.data?.items ?? []);
        this.pagination.set(res.data?.pagination ?? null);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load admins.');
        this.loading.set(false);
      }
    });
  }

  // ── 6. URL State Synchronization Mutators ─────────────────
  private updateUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.currentPage(),
        per_page: this.perPage(),
        search: this.searchTerm() || null,
        role: this.roleFilter() || null,
        status: this.statusFilter() || null
      },
      queryParamsHandling: 'merge'
    });
  }

  // ── 7. View Event Triggers ────────────────────────────────
  onSearch(value: string): void {
    this.searchTerm.set(value);
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadAdmins();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.roleFilter.set('');
    this.statusFilter.set('');
    this.currentPage.set(1);
    this.loadAdmins();
  }

  onPerPageChange(): void {
    this.currentPage.set(1);
    this.loadAdmins();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadAdmins();
  }

  onDelete(admin: Admin): void {
    if (!confirm(`Delete ${admin.first_name} ${admin.last_name}?`)) {
      return;
    }

    this.adminService.deleteAdmin(admin.id).subscribe({
      next: () => this.loadAdmins(),
      error: (err) => {
        alert(err.error?.message || 'Failed to delete admin.');
      }
    });
  }

  // ── 8. Memoized Derived UI States ─────────────────────────
  readonly hasActiveFilters = computed(() => {
    return !!(this.searchTerm() || this.roleFilter() || this.statusFilter());
  });

  getRoleBadgeClass(role: string): string {
    return {
      super_admin: 'badge bg-danger',
      complex_admin: 'badge bg-warning text-dark',
      building_admin: 'badge bg-info text-dark'
    }[role] ?? 'badge bg-secondary';
  }

  getAvatarClass(role: string): string {
    return {
      super_admin: 'bg-danger',
      complex_admin: 'bg-warning text-dark',
      building_admin: 'bg-info text-dark'
    }[role] ?? 'bg-secondary';
  }

  getRoleLabel(role: string): string {
    return this.roleOptions.find(r => r.value === role)?.label ?? role;
  }
}