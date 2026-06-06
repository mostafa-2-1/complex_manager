
// ─── Pagination ───────────────────────────────────────────────────────────────
export interface Pagination {
  total:    number;
  pages:    number;
  page:     number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

// ─── Base API Response ────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data:    T | null;
}

// ─── Paginated Data Wrapper ───────────────────────────────────────────────────
export interface PaginatedData<T> {
  items:      T[];
  pagination: Pagination;
}

// ─── Paginated API Response ───────────────────────────────────────────────────
// Used for all list endpoints
export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;