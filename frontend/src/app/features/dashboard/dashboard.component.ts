// frontend/src/app/features/dashboard/dashboard.component.ts
import { Component, signal, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, finalize } from 'rxjs';

// Services
import { AuthService } from '../../core/services/auth.service';
import { AdminService } from '../../core/services/admin.service';
import { ComplexService } from '../../core/services/complex.service';
import { BuildingService } from '../../core/services/building.service';

import { CommonModule, DecimalPipe } from '@angular/common';
// Interfaces
interface StatCard { label: string; value: number; icon: string; route: string; color: string; }
interface QuickAction { label: string; route: string; icon: string; style: string; roles: string[]; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // Note: In Angular 21, you can drop CommonModule if you use the new @if and @for syntax in HTML
  imports: [RouterLink, CommonModule, DecimalPipe], 
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  // ── 1. Modern Dependency Injection ────────────────────────
  // Replaces constructor boilerplate. Properties are private by default.
  public authService = inject(AuthService);
  private adminService = inject(AdminService);
  private complexService = inject(ComplexService);
  private buildingService = inject(BuildingService);

  // ── 2. Reactive State ─────────────────────────────────────
  loading = signal(true);
  
  stats = signal<StatCard[]>([
    { label: 'Total Admins', value: 0, icon: '👥', route: '/admins', color: 'primary' },
    { label: 'Complexes', value: 0, icon: '🏘️', route: '/complexes', color: 'success' },
    { label: 'Buildings', value: 0, icon: '🏗️', route: '/buildings', color: 'info' }
  ]);

  // Static data doesn't need to be a signal
  readonly quickActions: QuickAction[] = [
    { label: 'Add Admin', route: '/admins/new', icon: '👤', style: 'btn-outline-primary', roles: ['super_admin'] },
    { label: 'Add Complex', route: '/complexes/new', icon: '🏘️', style: 'btn-outline-success', roles: ['super_admin'] },
    { label: 'Add Building', route: '/buildings/new', icon: '🏗️', style: 'btn-outline-info', roles: ['super_admin', 'complex_admin'] }
  ];

  // ── 3. Derived State (Replaces Getters) ───────────────────
  // computed() caches the result and ONLY recalculates when currentAdmin() changes.
  readonly visibleQuickActions = computed(() => {
    const role = this.authService.currentAdmin()?.role;
    if (!role) return [];
    return this.quickActions.filter(action => action.roles.includes(role));
  });

  // Note: We keep greeting as a standard getter because Date is not reactive. 
  // A computed signal wouldn't auto-update when the hour changes anyway.
  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  // ── 4. Initialization ─────────────────────────────────────
  // In modern standalone Angular, DI is resolved before the constructor.
  // We can safely trigger data fetches here, eliminating the need for ngOnInit.
  constructor() {
    this.loadStats();
  }

  // ── 5. Data Fetching ──────────────────────────────────────
  private loadStats(): void {
    this.loading.set(true);

    forkJoin({
      admins: this.adminService.getAdmins({ per_page: 1 }),
      complexes: this.complexService.getComplexes({ per_page: 1 }),
      buildings: this.buildingService.getBuildings({ per_page: 1 })
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ admins, complexes, buildings }) => {
          this.stats.update(current => [
            { ...current[0], value: admins.data?.pagination.total ?? 0 },
            { ...current[1], value: complexes.data?.pagination.total ?? 0 },
            { ...current[2], value: buildings.data?.pagination.total ?? 0 }
          ]);
        },
        error: err => console.error('Failed to load dashboard stats:', err)
      });
  }
}