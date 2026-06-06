// frontend/src/app/core/services/complex.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResidentialComplex, CreateComplexDto, UpdateComplexDto } from '../models/complex.model';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

// ─── Query Params Interface ───────────────────────────────────────────────────
export interface ComplexQueryParams {
  page?:     number;
  per_page?: number;
  search?:   string;
}

@Injectable({
  providedIn: 'root'
})
export class ComplexService {
  private readonly apiUrl = `${environment.apiUrl}/complexes`;

  constructor(private http: HttpClient) {}

  // ─── GET /complexes ────────────────────────────────────────
  getComplexes(params: ComplexQueryParams = {}): Observable<PaginatedResponse<ResidentialComplex>> {
    let httpParams = new HttpParams();

    if (params.page)     httpParams = httpParams.set('page',     params.page);
    if (params.per_page) httpParams = httpParams.set('per_page', params.per_page);
    if (params.search)   httpParams = httpParams.set('search',   params.search);

    return this.http.get<PaginatedResponse<ResidentialComplex>>(this.apiUrl, { params: httpParams });
  }

  // ─── GET /complexes/:id ────────────────────────────────────
  getComplex(id: number): Observable<ApiResponse<ResidentialComplex>> {
    return this.http.get<ApiResponse<ResidentialComplex>>(`${this.apiUrl}/${id}`);
  }

  // ─── POST /complexes ───────────────────────────────────────
  createComplex(dto: CreateComplexDto): Observable<ApiResponse<ResidentialComplex>> {
    return this.http.post<ApiResponse<ResidentialComplex>>(this.apiUrl, dto);
  }

  // ─── PUT /complexes/:id ────────────────────────────────────
  updateComplex(id: number, dto: UpdateComplexDto): Observable<ApiResponse<ResidentialComplex>> {
    return this.http.put<ApiResponse<ResidentialComplex>>(`${this.apiUrl}/${id}`, dto);
  }

  // ─── DELETE /complexes/:id ─────────────────────────────────
  deleteComplex(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }
}