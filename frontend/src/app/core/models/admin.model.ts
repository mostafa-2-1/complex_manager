
// ─── Enums ────────────────────────────────────────────────────────────────────
export type Civility = 'Mr' | 'Mrs' | 'Ms' | 'Dr' | 'Prof';
export type AdminRole = 'super_admin' | 'complex_admin' | 'building_admin';
export type AdminStatus = 'active' | 'inactive';

// ─── Core Entity ──────────────────────────────────────────────────────────────
export interface Admin {
  id:         number;
  civility:   Civility;
  first_name: string;
  last_name:  string;
  email:      string;
  phone?:     string;
  role:       AdminRole;
  status:     AdminStatus;
  created_at?: string;
  updated_at?: string;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface CreateAdminDto {
  civility:   Civility;
  first_name: string;
  last_name:  string;
  email:      string;
  phone?:     string;
  role:       AdminRole;
  status:     AdminStatus;
  password:   string;
}

export interface UpdateAdminDto {
  civility?:   Civility;
  first_name?: string;
  last_name?:  string;
  email?:      string;
  phone?:      string;
  role?:       AdminRole;
  status?:     AdminStatus;
  password?:   string;
}

// ─── Nested Admin DTO (used inside complex/building creation) ─────────────────
export interface AdminSubDto {
  civility:   Civility;
  first_name: string;
  last_name:  string;
  email:      string;
  phone?:     string;
  password:   string;
}

// ─── Constants (for dropdowns) ────────────────────────────────────────────────
export const CIVILITY_OPTIONS: Civility[] = ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'];

export const ROLE_OPTIONS: { value: AdminRole; label: string }[] = [
  { value: 'super_admin',    label: 'Super Admin'    },
  { value: 'complex_admin',  label: 'Complex Admin'  },
  { value: 'building_admin', label: 'Building Admin' }
];

export const STATUS_OPTIONS: { value: AdminStatus; label: string }[] = [
  { value: 'active',   label: 'Active'   },
  { value: 'inactive', label: 'Inactive' }
];