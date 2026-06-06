// frontend/src/app/features/buildings/building-list/building-list.component.ts

import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Building } from '../../../core/models/building.model';
import { ResidentialComplex } from '../../../core/models/complex.model';
import { Pagination } from '../../../core/models/api-response.model';
import { BuildingService } from '../../../core/services/building.service';
import { ComplexService } from '../../../core/services/complex.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-building-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PaginationComponent],
  templateUrl: './building-list.component.html'
})
export class BuildingListComponent {
  // ── 1. Modern Dependency Injection ────────────────────────
  private buildingService = inject(BuildingService);
  private complexService = inject(ComplexService);
  public authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // ── 2. Content State Signals ──────────────────────────────
  readonly buildings = signal<Building[]>([]);
  readonly complexes = signal<ResidentialComplex[]>([]);
  readonly pagination = signal<Pagination | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');

  // ── 3. Component Model Inputs (Local Bindings) ────────────
  searchTerm = signal('');
  complexFilter = signal('');
  currentPage = signal(1);
  perPage = signal(10);

  // ── 4. Memoized Computed State ────────────────────────────
  readonly hasActiveFilters = computed(() => !!(this.searchTerm() || this.complexFilter()));

  constructor() {
    // Sync initial route query values to our signals instantly on boot
    const params = this.route.snapshot.queryParams;
    this.currentPage.set(Number(params['page']) || 1);
    this.perPage.set(Number(params['per_page']) || 10);
    this.searchTerm.set(params['search'] || '');
    this.complexFilter.set(params['complex_id'] || '');

    // Kickstart supporting filters and core data fetch
    this.loadComplexesForFilter();
    this.loadBuildings();

    // ── 5. Reactive Search Pipeline ──────────────────────────
    // Listens to user keystrokes, debounces typing spikes, resets page, and updates
    toObservable(this.searchTerm)
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage.set(1);
        this.loadBuildings();
      });

    // Reactive effect to automatically manage URL query sync as signals change
    effect(() => {
      this.updateUrl();
    });
  }

  // ── 6. Data Fetching Operations ───────────────────────────
  loadBuildings(): void {
    this.loading.set(true);
    this.error.set('');

    this.buildingService.getBuildings({
      page: this.currentPage(),
      per_page: this.perPage(),
      search: this.searchTerm(),
      complex_id: this.complexFilter() ? Number(this.complexFilter()) : undefined
    }).subscribe({
      next: (res) => {
        this.buildings.set(res.data?.items ?? []);
        this.pagination.set(res.data?.pagination ?? null);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load buildings.');
        this.loading.set(false);
      }
    });
  }

  private loadComplexesForFilter(): void {
    this.complexService.getComplexes({ per_page: 100 }).subscribe({
      next: (res) => this.complexes.set(res.data?.items ?? []),
      error: () => {} // Intentionally left blank
    });
  }

  // ── 7. URL State Synchronization Mutators ─────────────────
  private updateUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.currentPage(),
        per_page: this.perPage(),
        search: this.searchTerm() || null,
        complex_id: this.complexFilter() || null
      },
      queryParamsHandling: 'merge'
    });
  }

  // ── 8. View Event Triggers ────────────────────────────────
  onSearch(value: string): void {
    this.searchTerm.set(value);
  }

  onPerPageChange(): void {
    this.currentPage.set(1);
    this.loadBuildings();
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadBuildings();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.complexFilter.set('');
    this.currentPage.set(1);
    this.loadBuildings();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadBuildings();
  }

  onDelete(building: Building): void {
    if (!confirm(`Delete building "${building.name}"?\n\nThis action cannot be undone.`)) return;

    this.buildingService.deleteBuilding(building.id).subscribe({
      next: () => this.loadBuildings(),
      error: (err) => alert(err.error?.message || 'Failed to delete building.')
    });
  }
}