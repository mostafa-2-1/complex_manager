// frontend/src/app/core/services/admin.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Admin, CreateAdminDto, UpdateAdminDto } from '../models/admin.model';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

// ─── Query Params Interface ───────────────────────────────────────────────────
export interface AdminQueryParams {
  page?:     number;
  per_page?: number;
  search?:   string;
  role?:     string;
  status?:   string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly apiUrl = `${environment.apiUrl}/admins`;

  constructor(private http: HttpClient) {}

  // ─── GET /admins ───────────────────────────────────────────
  getAdmins(params: AdminQueryParams = {}): Observable<PaginatedResponse<Admin>> {
    let httpParams = new HttpParams();

    if (params.page)     httpParams = httpParams.set('page',     params.page);
    if (params.per_page) httpParams = httpParams.set('per_page', params.per_page);
    if (params.search)   httpParams = httpParams.set('search',   params.search);
    if (params.role)     httpParams = httpParams.set('role',     params.role);
    if (params.status)   httpParams = httpParams.set('status',   params.status);

    return this.http.get<PaginatedResponse<Admin>>(this.apiUrl, { params: httpParams });
  }

  // ─── GET /admins/:id ───────────────────────────────────────
  getAdmin(id: number): Observable<ApiResponse<Admin>> {
    return this.http.get<ApiResponse<Admin>>(`${this.apiUrl}/${id}`);
  }

  // ─── POST /admins ──────────────────────────────────────────
  createAdmin(dto: CreateAdminDto): Observable<ApiResponse<Admin>> {
    return this.http.post<ApiResponse<Admin>>(this.apiUrl, dto);
  }

  // ─── PUT /admins/:id ───────────────────────────────────────
  updateAdmin(id: number, dto: UpdateAdminDto): Observable<ApiResponse<Admin>> {
    return this.http.put<ApiResponse<Admin>>(`${this.apiUrl}/${id}`, dto);
  }

  // ─── DELETE /admins/:id ────────────────────────────────────
  deleteAdmin(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }

  // ─── GET admins filtered by role (fetch all, no pagination limit) ──────────
  getAdminsByRole(role: string): Observable<PaginatedResponse<Admin>> {
    const params = new HttpParams()
      .set('role', role)
      .set('per_page', 100)
      .set('status', 'active');

    return this.http.get<PaginatedResponse<Admin>>(this.apiUrl, { params });
  }
}