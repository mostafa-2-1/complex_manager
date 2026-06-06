// frontend/src/app/core/services/building.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Building, CreateBuildingDto, UpdateBuildingDto } from '../models/building.model';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';
import { Admin } from '../models/admin.model';
// ─── Query Params Interface ───────────────────────────────────────────────────
export interface BuildingQueryParams {
  page?:       number;
  per_page?:   number;
  search?:     string;
  complex_id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class BuildingService {
  private readonly apiUrl = `${environment.apiUrl}/buildings`;

  constructor(private http: HttpClient) {}

  // ─── GET /buildings ────────────────────────────────────────
  getBuildings(params: BuildingQueryParams = {}): Observable<PaginatedResponse<Building>> {
    let httpParams = new HttpParams();

    if (params.page)       httpParams = httpParams.set('page',       params.page);
    if (params.per_page)   httpParams = httpParams.set('per_page',   params.per_page);
    if (params.search)     httpParams = httpParams.set('search',     params.search);
    if (params.complex_id) httpParams = httpParams.set('complex_id', params.complex_id);

    return this.http.get<PaginatedResponse<Building>>(this.apiUrl, { params: httpParams });
  }

  // ─── GET /buildings/:id ────────────────────────────────────
  getBuilding(id: number): Observable<ApiResponse<Building>> {
    return this.http.get<ApiResponse<Building>>(`${this.apiUrl}/${id}`);
  }

  // ─── POST /buildings ───────────────────────────────────────
  createBuilding(dto: CreateBuildingDto): Observable<ApiResponse<Building>> {
    return this.http.post<ApiResponse<Building>>(this.apiUrl, dto);
  }

  // ─── PUT /buildings/:id ────────────────────────────────────
  updateBuilding(id: number, dto: UpdateBuildingDto): Observable<ApiResponse<Building>> {
    return this.http.put<ApiResponse<Building>>(`${this.apiUrl}/${id}`, dto);
  }

  // ─── DELETE /buildings/:id ─────────────────────────────────
  deleteBuilding(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }

}