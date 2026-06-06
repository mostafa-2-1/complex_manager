
import { Admin, AdminSubDto } from './admin.model';
import { Building } from './building.model';

// ─── Core Entity ──────────────────────────────────────────────────────────────
export interface ResidentialComplex {
  id:                  number;
  name:                string;
  address:             string;
  city:                string;
  postal_code?:        string;
  campaign_name?:      string;
  campaign_start_date?: string;
  campaign_end_date?:  string;
  admin_id?:           number;
  admin?:              Admin;
  buildings?:          Building[];
  created_at?:         string;
  updated_at?:         string;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface CreateComplexDto {
  name:                 string;
  address:              string;
  city:                 string;
  postal_code?:         string;
  campaign_name?:       string;
  campaign_start_date?: string;
  campaign_end_date?:   string;
  admin_id: number;
}

export interface UpdateComplexDto {
  name?:                string;
  address?:             string;
  city?:                string;
  postal_code?:         string;
  admin_id?:            number;
  campaign_name?:       string;
  campaign_start_date?: string;
  campaign_end_date?:   string;
}