import { Admin } from './admin.model';

// ─── Core Entity ──────────────────────────────────────────────────────────────
export interface Building {
  id:           number;
  name:         string;
  address:      string;
  floors?:      number;
  units?:       number;
  complex_id:   number;
  complex_name?: string;
  admin_id?:    number;
  admin?:       Admin;
  created_at?:  string;
  updated_at?:  string;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface CreateBuildingDto {
  name:       string;
  address:    string;
  floors?:    number;
  units?:     number;
  complex_id: number;
  admin_id:   number;
}

export interface UpdateBuildingDto {
  name?:       string;
  address?:    string;
  floors?:     number;
  units?:      number;
  complex_id?: number;
  admin_id?:   number;
}