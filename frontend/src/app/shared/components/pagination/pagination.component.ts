import {
  Component,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pagination } from '../../../core/models/api-response.model';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html'
})
export class PaginationComponent {
  // ── Inputs ────────────────────────────────────────────────
  @Input({ required: true }) pagination!: Pagination;
  @Input() currentPage: number = 1;

  // ── Outputs ───────────────────────────────────────────────
  @Output() pageChange = new EventEmitter<number>();

  // ── Page Numbers ──────────────────────────────────────────
  // Generates smart page window:
  // Always shows first, last, current, and 2 neighbours
  // Uses null as separator (renders as "...")
  get pageNumbers(): (number | null)[] {
    const total   = this.pagination.pages;
    const current = this.currentPage;

    if (total <= 7) {
      // Show all pages if total is small
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | null)[] = [];

    // Always include page 1
    pages.push(1);

    // Left ellipsis
    if (current > 3) {
      pages.push(null);
    }

    // Pages around current
    const start = Math.max(2, current - 1);
    const end   = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Right ellipsis
    if (current < total - 2) {
      pages.push(null);
    }

    // Always include last page
    pages.push(total);

    return pages;
  }

  // Calculates the ending result number safely using Math.min
  getDisplayEnd(): number {
    return Math.min(
      this.currentPage * this.pagination.per_page,
      this.pagination.total
    );
  }

  // ── Actions ───────────────────────────────────────────────
  goToPage(page: number | null): void {
    if (
      page === null ||
      page === this.currentPage ||
      page < 1 ||
      page > this.pagination.pages
    ) {
      return;
    }
    this.pageChange.emit(page);
  }

  previous(): void {
    if (this.pagination.has_prev) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  next(): void {
    if (this.pagination.has_next) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }
}