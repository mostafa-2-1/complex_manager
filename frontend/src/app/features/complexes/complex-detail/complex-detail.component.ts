// frontend/src/app/features/complexes/complex-detail/complex-detail.component.ts

import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ResidentialComplex } from '../../../core/models/complex.model';
import { ComplexService } from '../../../core/services/complex.service';
import { AuthService } from '../../../core/services/auth.service';
import { AdminService } from '../../../core/services/admin.service'; // 1. Import Admin Service
import { Admin } from '../../../core/models/admin.model';

@Component({
  selector: 'app-complex-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, DatePipe],
  templateUrl: './complex-detail.component.html'
})
export class ComplexDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private complexService = inject(ComplexService);
  public authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService); // 2. Inject Admin Service

  complex = signal<ResidentialComplex | null>(null);
  loading = signal(true);
  editMode = signal(false);
  updateLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  
  // 3. Signal to store potential complex admins for selection
  complexAdmins = signal<Admin[]>([]);
  loadingAdmins = signal(false);

  buildingCount = computed(() => this.complex()?.buildings?.length ?? 0);

  // 4. Added admin_id tracking into the reactive form group
  public readonly editForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    address: ['', Validators.required],
    city: ['', Validators.required],
    postal_code: [''],
    admin_id: ['', Validators.required], // Added control
    campaign_name: [''],
    campaign_start_date: [''],
    campaign_end_date: ['']
  });

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadComplex(id);
    this.loadAvailableAdmins(); // Load admins on initialization
  }

  private loadComplex(id: number): void {
    this.loading.set(true);
    this.complexService.getComplex(id).subscribe({
      next: (res) => {
        this.complex.set(res.data);
        this.loading.set(false);
        this.patchFormValues();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Complex not found.');
        this.loading.set(false);
      }
    });
  }

  // 5. Fetch available complex administrators
  private loadAvailableAdmins(): void {
    this.loadingAdmins.set(true);
    this.adminService.getAdminsByRole('complex_admin').subscribe({
      next: (res) => {
        this.complexAdmins.set(res.data?.items ?? []);
        this.loadingAdmins.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load available complex administrators.');
        this.loadingAdmins.set(false);
      }
    });
  }

  private patchFormValues(): void {
    const currentComplex = this.complex();
    if (!currentComplex) return;

    this.editForm.patchValue({
      name: currentComplex.name,
      address: currentComplex.address,
      city: currentComplex.city,
      postal_code: currentComplex.postal_code ?? '',
      admin_id: currentComplex.admin_id !== undefined && currentComplex.admin_id !== null ? String(currentComplex.admin_id) : '', // Sync Safely
      campaign_name: currentComplex.campaign_name ?? '',
      campaign_start_date: currentComplex.campaign_start_date ?? '',
      campaign_end_date: currentComplex.campaign_end_date ?? ''
    });
  }

  toggleEditMode(): void {
    this.editMode.update(mode => !mode);
    this.successMessage.set('');
    this.errorMessage.set('');

    if (!this.editMode() && this.complex()) {
      this.patchFormValues();
    }
  }

  onUpdate(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.updateLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const currentId = this.complex()!.id;
    const rawValue = this.editForm.getRawValue();

    // 6. Include mapped admin_id down to the Update DTO payload
    const updateDto = {
      name: rawValue.name ?? '',
      address: rawValue.address ?? '',
      city: rawValue.city ?? '',
      postal_code: rawValue.postal_code || undefined,
      admin_id: rawValue.admin_id ? Number(rawValue.admin_id) : undefined, // Appended field conversion
      campaign_name: rawValue.campaign_name || undefined,
      campaign_start_date: rawValue.campaign_start_date || undefined,
      campaign_end_date: rawValue.campaign_end_date || undefined
    };

    this.complexService.updateComplex(currentId, updateDto).subscribe({
      next: (res) => {
        this.complex.set(res.data);
        this.updateLoading.set(false);
        this.editMode.set(false);
        this.successMessage.set(res.message);

        setTimeout(() => {
          this.successMessage.set('');
        }, 3000);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Update failed.');
        this.updateLoading.set(false);
      }
    });
  }

  onDelete(): void {
    const currentComplex = this.complex();
    if (!currentComplex) return;

    if (!confirm(`Delete "${currentComplex.name}"?\n\nThis will also delete all buildings.\nThis cannot be undone.`)) return;

    this.complexService.deleteComplex(currentComplex.id).subscribe({
      next: () => this.router.navigate(['/complexes']),
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Delete failed.');
      }
    });
  }

  isInvalid(field: string): boolean {
    const control = this.editForm.get(field);
    return !!(control?.invalid && control?.touched);
  }
}