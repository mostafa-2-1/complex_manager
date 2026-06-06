// frontend/src/app/features/complexes/complex-form/complex-form.component.ts

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ComplexService } from '../../../core/services/complex.service';
import { AdminService } from '../../../core/services/admin.service';
import { Admin } from '../../../core/models/admin.model';
import { CreateComplexDto } from '../../../core/models/complex.model';

@Component({
  selector: 'app-complex-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './complex-form.component.html'
})
export class ComplexFormComponent {
  // ── 1. Modern Dependency Injection ────────────────────────
  private fb = inject(FormBuilder);
  private complexService = inject(ComplexService);
  private adminService = inject(AdminService);
  private router = inject(Router);

  // ── 2. Component State Signals ────────────────────────────
  loading = signal(false);
  loadingAdmins = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  complexAdmins = signal<Admin[]>([]);

  // ── 3. Declarative Type-Safe Form Initialization ──────────
  // Replaces form!: FormGroup and initForm() pattern entirely
  public readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    address: ['', Validators.required],
    city: ['', Validators.required],
    postal_code: [''],
    campaign_name: [''],
    campaign_start_date: [''],
    campaign_end_date: [''],
    admin_id: [null as number | null, Validators.required]
  });

  // ── 4. Structural Initializer Context ─────────────────────
  private _init = this.loadComplexAdmins();

  // ── 5. Data Fetching Logic ────────────────────────────────
  private loadComplexAdmins(): void {
    this.loadingAdmins.set(true);

    this.adminService.getAdminsByRole('complex_admin').subscribe({
      next: (res) => {
        this.complexAdmins.set(res.data?.items ?? []);
        this.loadingAdmins.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load complex admins.');
        this.loadingAdmins.set(false);
      }
    });
  }

  // ── 6. Form Submission Layout ─────────────────────────────
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    // Use getRawValue() for modern, type-safe form reads
    const formValue = this.form.getRawValue();

    const dto: CreateComplexDto = {
      name: formValue.name ?? '',
      address: formValue.address ?? '',
      city: formValue.city ?? '',
      postal_code: formValue.postal_code || undefined,
      campaign_name: formValue.campaign_name || undefined,
      campaign_start_date: formValue.campaign_start_date || undefined,
      campaign_end_date: formValue.campaign_end_date || undefined,
      admin_id: Number(formValue.admin_id)
    };

    this.complexService.createComplex(dto).subscribe({
      next: (res) => {
        this.successMessage.set(res.message);
        this.loading.set(false);

        setTimeout(() => {
          this.router.navigate(['/complexes']);
        }, 1500);
      },
      error: (err) => {
        this.errorMessage.set(
          err.error?.message || 'Failed to create complex.'
        );
        this.loading.set(false);
      }
    });
  }

  // ── 7. Field Validation Logic ─────────────────────────────
  isInvalid(path: string): boolean {
    const control = this.form.get(path);
    return !!(control?.invalid && control?.touched);
  }
}