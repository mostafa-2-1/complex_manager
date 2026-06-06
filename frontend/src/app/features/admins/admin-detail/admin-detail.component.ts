// frontend/src/app/features/admins/admin-detail/admin-detail.component.ts

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import {
  Admin,
  CIVILITY_OPTIONS,
  ROLE_OPTIONS,
  STATUS_OPTIONS
} from '../../../core/models/admin.model';

import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './admin-detail.component.html'
})
export class AdminDetailComponent implements OnInit {

  // ── State ───────────────────────────────────────────────
  admin = signal<Admin | null>(null);

  loading = signal(true);
  editMode = signal(false);
  updateLoading = signal(false);

  successMessage = signal('');
  errorMessage = signal('');

  editForm!: FormGroup;

  // ── Options ──────────────────────────────────────────────
  readonly civilityOptions = CIVILITY_OPTIONS;
  readonly roleOptions = ROLE_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    public authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.errorMessage.set('Invalid admin ID');
      this.loading.set(false);
      return;
    }
    this.loadAdmin(id);
  }

  // ── Load ────────────────────────────────────────────────
  private loadAdmin(id: number): void {
    this.loading.set(true);

    this.adminService.getAdmin(id).subscribe({
      next: (res) => {
        this.admin.set(res.data);
        this.loading.set(false);
        this.buildForm();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Admin not found.');
        this.loading.set(false);
      }
    });
  }

  // ── Form ────────────────────────────────────────────────
  private buildForm(): void {
    const admin = this.admin();
    if (!admin) return;

    this.editForm = this.fb.group({
      civility: [admin.civility, Validators.required],
      first_name: [admin.first_name, [Validators.required, Validators.minLength(2)]],
      last_name: [admin.last_name, [Validators.required, Validators.minLength(2)]],
      email: [admin.email, [Validators.required, Validators.email]],
      phone: [admin.phone ?? ''],
      role: [admin.role, Validators.required],
      status: [admin.status, Validators.required],
      password: ['']
    });
  }

  // ── Toggle Edit ─────────────────────────────────────────
  toggleEditMode(): void {
    const next = !this.editMode();

    this.editMode.set(next);
    this.successMessage.set('');
    this.errorMessage.set('');

    // reset form when leaving edit mode
    if (!next) {
      const admin = this.admin();
      if (admin) this.buildForm();
    }
  }

  // ── Update ──────────────────────────────────────────────
  onUpdate(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const admin = this.admin();
    if (!admin) return;

    this.updateLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const payload = { ...this.editForm.value };

    if (!payload.password) {
      delete payload.password;
    }

    this.adminService.updateAdmin(admin.id, payload).subscribe({
      next: (res) => {
        this.admin.set(res.data);
        this.updateLoading.set(false);
        this.editMode.set(false);
        this.successMessage.set(res.message);

        setTimeout(() => this.successMessage.set(''), 2500);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Update failed.');
        this.updateLoading.set(false);
      }
    });
  }

  // ── Delete ──────────────────────────────────────────────
  onDelete(): void {
    const admin = this.admin();
    if (!admin) return;

    if (!confirm(`Delete ${admin.first_name} ${admin.last_name}?`)) return;

    this.adminService.deleteAdmin(admin.id).subscribe({
      next: () => this.router.navigate(['/admins']),
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Delete failed.');
      }
    });
  }

  // ── Helpers ─────────────────────────────────────────────
  isInvalid(field: string): boolean {
    const c = this.editForm?.get(field);
    return !!(c?.invalid && c?.touched);
  }

  getRoleBadgeClass(role: string): string {
    const map: Record<string, string> = {
      super_admin: 'badge bg-danger',
      complex_admin: 'badge bg-warning text-dark',
      building_admin: 'badge bg-info text-dark'
    };
    return map[role] ?? 'badge bg-secondary';
  }

  getRoleLabel(role: string): string {
    return this.roleOptions.find(r => r.value === role)?.label ?? role;
  }

  get isOwnProfile(): boolean {
    const current = this.authService.currentAdmin?.();
    const admin = this.admin();
    return !!current && !!admin && current.id === admin.id;
  }
}