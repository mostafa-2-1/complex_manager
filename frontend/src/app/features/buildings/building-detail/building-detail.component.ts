// frontend/src/app/features/buildings/building-detail/building-detail.component.ts

import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Building } from '../../../core/models/building.model';
import { Admin } from '../../../core/models/admin.model';
import { BuildingService } from '../../../core/services/building.service';
import { AuthService } from '../../../core/services/auth.service';

import { AdminService } from '../../../core/services/admin.service'; // 1. Import Admin Service


@Component({
  selector: 'app-building-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './building-detail.component.html'
})
export class BuildingDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private buildingService = inject(BuildingService); // Primary target service
  public authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);

  building = signal<Building | null>(null);
  
  buildingAdmins = signal<Admin[]>([]); // Renamed safely to maintain domain separation
  loading = signal(true);
  loadingAdmins = signal(false);
  editMode = signal(false);
  updateLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  editForm!: FormGroup;

  canEdit = computed(() => {
    if (this.authService.isSuperAdmin() || this.authService.isComplexAdmin()) {
      return true;
    }
    const currentBuilding = this.building();
    if (this.authService.isBuildingAdmin()) {
      return currentBuilding?.admin_id === this.authService.currentAdmin()?.id;
    }
    return false;
  });

  canDelete = computed(() => this.authService.isSuperAdmin());

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadBuilding(id);
    this.loadAvailableAdmins();
  }

  private loadBuilding(id: number): void {
    this.loading.set(true);
    this.buildingService.getBuilding(id).subscribe({
      next: (res) => {
        this.building.set(res.data);
        this.loading.set(false);
        this.buildForm();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Building not found.');
        this.loading.set(false);
      }
    });
  }

  // FIXED: Now calls the explicit building admin service endpoint
  // 5. Fetch available complex administrators
  private loadAvailableAdmins(): void {
    this.loadingAdmins.set(true);
    this.adminService.getAdminsByRole('building_admin').subscribe({
      next: (res) => {
        this.buildingAdmins.set(res.data?.items ?? []);
        this.loadingAdmins.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load available complex administrators.');
        this.loadingAdmins.set(false);
      }
    });
  }

  private buildForm(): void {
    const currentBuilding = this.building();
    if (!currentBuilding) return;

    this.editForm = this.fb.group({
      name: [currentBuilding.name, [Validators.required, Validators.minLength(2)]],
      address: [currentBuilding.address, Validators.required],
      floors: [currentBuilding.floors ?? null],
      units: [currentBuilding.units ?? null],
      admin_id: [currentBuilding.admin_id ?? '', Validators.required]
    });

    if (!this.canEdit()) {
      this.editForm.disable();
    }
  }

  toggleEditMode(): void {
    this.editMode.set(!this.editMode());
    this.successMessage.set('');
    this.errorMessage.set('');
    if (!this.editMode() && this.building()) {
      this.buildForm();
    }
  }

  onUpdate(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const currentBuilding = this.building();
    if (!currentBuilding) return;

    this.updateLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const rawForm = this.editForm.getRawValue();

    const payload = {
      name: rawForm.name ?? '',
      address: rawForm.address ?? '',
      floors: rawForm.floors ? Number(rawForm.floors) : undefined,
      units: rawForm.units ? Number(rawForm.units) : undefined,
      admin_id: rawForm.admin_id ? Number(rawForm.admin_id) : undefined
    };

    this.buildingService.updateBuilding(currentBuilding.id, payload).subscribe({
      next: (res) => {
        this.building.set(res.data);
        this.updateLoading.set(false);
        this.editMode.set(false);
        this.successMessage.set(res.message);

        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Update failed.');
        this.updateLoading.set(false);
      }
    });
  }

  onDelete(): void {
    const currentBuilding = this.building();
    if (!currentBuilding) return;

    if (!confirm(`Delete building "${currentBuilding.name}"?\n\nThis action cannot be undone.`)) return;

    this.buildingService.deleteBuilding(currentBuilding.id).subscribe({
      next: () => this.router.navigate(['/buildings']),
      error: (err) => this.errorMessage.set(err.error?.message || 'Delete failed.')
    });
  }

  isInvalid(field: string): boolean {
    const control = this.editForm?.get(field);
    return !!(control?.invalid && control?.touched);
  }
}