// frontend/src/app/features/complexes/complex-list/complex-list.component.ts

import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { ResidentialComplex } from '../../../core/models/complex.model';
import { Pagination } from '../../../core/models/api-response.model';
import { ComplexService } from '../../../core/services/complex.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-complex-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PaginationComponent, DatePipe],
  templateUrl: './complex-list.component.html'
})
export class ComplexListComponent {
  // ── 1. Modern Dependency Injection ────────────────────────
  public authService = inject(AuthService);
  private complexService = inject(ComplexService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // ── 2. Signals State ──────────────────────────────────────
  complexes = signal<ResidentialComplex[]>([]);
  pagination = signal<Pagination | null>(null);
  loading = signal(false);
  error = signal('');

  // Transform standard filter values into reactive state signals
  searchTerm = signal('');
  currentPage = signal(1);
  perPage = signal(10);

  constructor() {
    // Sync initial route query values to our signals
    const params = this.route.snapshot.queryParams;
    this.currentPage.set(Number(params['page']) || 1);
    this.perPage.set(Number(params['per_page']) || 10);
    this.searchTerm.set(params['search'] || '');

    // ── 3. Reactive Search and Data Pipeline ─────────────────
    // This cleanly replaces the old OnInit / searchSubject implementation.
    toObservable(this.searchTerm)
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(() => {
        // Reset to page 1 whenever the user types a new search phrase
        this.currentPage.set(1);
        this.updateUrl();
        this.loadComplexes();
      });

    // Reactive effect to keep URL queries perfectly synced whenever filters change
    effect(() => {
      this.updateUrl();
    });
  }

  private updateUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.currentPage(),
        per_page: this.perPage(),
        search: this.searchTerm() || null,
      },
      queryParamsHandling: 'merge' // Prevent dropping other global query structures
    });
  }

  // ── 4. Load Data ──────────────────────────────────────────
  loadComplexes(): void {
    this.loading.set(true);
    this.error.set('');

    this.complexService.getComplexes({
      page: this.currentPage(),
      per_page: this.perPage(),
      search: this.searchTerm()
    }).subscribe({
      next: (res) => {
        this.complexes.set(res.data?.items ?? []);
        this.pagination.set(res.data?.pagination ?? null);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load complexes.');
        this.loading.set(false);
      }
    });
  }

  // ── 5. User UI Actions ────────────────────────────────────
  onSearch(value: string): void {
    this.searchTerm.set(value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.loadComplexes();
  }

  onPerPageChange(): void {
    this.currentPage.set(1);
    this.loadComplexes();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadComplexes();
  }

  onDelete(complex: ResidentialComplex): void {
    if (!confirm(`Delete "${complex.name}"?\n\nThis will also delete all buildings in this complex.\nThis action cannot be undone.`)) return;

    this.complexService.deleteComplex(complex.id).subscribe({
      next: () => this.loadComplexes(),
      error: (err) => alert(err.error?.message || 'Failed to delete complex.')
    });
  }

  // ── 6. Advanced Derived UI States (Memoized Helper Signals) ──
  // Replaces heavy, recurrent getter functions inside templates with light mapped lookups
  readonly complexUIStates = computed(() => {
    const now = new Date();
    
    return this.complexes().reduce((acc, complex) => {
      let status = 'none';
      const start = complex.campaign_start_date ? new Date(complex.campaign_start_date) : null;
      const end = complex.campaign_end_date ? new Date(complex.campaign_end_date) : null;

      if (complex.campaign_name) {
        if (start && end) {
          if (now >= start && now <= end) status = 'active';
          else if (now < start) status = 'upcoming';
          else status = 'ended';
        } else {
          status = 'set';
        }
      }

      const badgeMap: Record<string, string> = {
        active: 'badge bg-success',
        upcoming: 'badge bg-warning text-dark',
        ended: 'badge bg-secondary',
        set: 'badge bg-info text-dark',
        none: ''
      };

      const labelMap: Record<string, string> = {
        active: 'Active Campaign',
        upcoming: 'Upcoming Campaign',
        ended: 'Campaign Ended',
        set: 'Campaign Set',
        none: ''
      };

      acc[complex.id] = {
        badge: badgeMap[status] ?? '',
        label: labelMap[status] ?? ''
      };

      return acc;
    }, {} as Record<string, { badge: string; label: string }>);
  });
}