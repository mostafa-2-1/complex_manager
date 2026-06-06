import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

import { BuildingService } from '../../../core/services/building.service';
import { ComplexService } from '../../../core/services/complex.service';
import { AdminService } from '../../../core/services/admin.service';

import { ResidentialComplex } from '../../../core/models/complex.model';
import { Admin } from '../../../core/models/admin.model';
import { CreateBuildingDto } from '../../../core/models/building.model';

@Component({
  selector: 'app-building-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './building-form.component.html'
})
export class BuildingFormComponent {
  // ── 1. Modern Functional Dependency Injection ─────────────
  private fb = inject(FormBuilder);
  private buildingService = inject(BuildingService);
  private complexService = inject(ComplexService);
  private adminService = inject(AdminService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // ── 2. Structural State Signals ───────────────────────────
  complexes = signal<ResidentialComplex[]>([]);
  buildingAdmins = signal<Admin[]>([]);

  loading = signal(false);
  loadingComplexes = signal(false);
  loadingAdmins = signal(false);

  successMessage = signal('');
  errorMessage = signal('');
  formSubmitted = signal(false);

  // ── 3. Declarative Form Definition ────────────────────────
  public readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    address: ['', Validators.required],
    floors: [null as number | null],
    units: [null as number | null],
    complex_id: [null as number | null, Validators.required],
    admin_id: [null as number | null, Validators.required]
  });

  // ── 4. Structural Initialization context ──────────────────
  constructor() {
    this.loadComplexes();
    this.loadBuildingAdmins();
  }

  // ── 5. Data Fetching Operations ───────────────────────────
  private loadComplexes(): void {
    this.loadingComplexes.set(true);

    this.complexService.getComplexes({ per_page: 100 }).subscribe({
      next: (res) => {
        this.complexes.set(res.data?.items ?? []);
        this.loadingComplexes.set(false);

        const queryComplexId = this.route.snapshot.queryParams['complex_id'];
        if (queryComplexId) {
          this.form.patchValue({ complex_id: Number(queryComplexId) });
        }
      },
      error: () => {
        this.errorMessage.set('Failed to load complexes.');
        this.loadingComplexes.set(false);
      }
    });
  }

  private loadBuildingAdmins(): void {
    this.loadingAdmins.set(true);

    this.adminService.getAdminsByRole('building_admin').subscribe({
      next: (res) => {
        this.buildingAdmins.set(res.data?.items ?? []);
        this.loadingAdmins.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load building admins.');
        this.loadingAdmins.set(false);
      }
    });
  }

    // ── 6. Resource Payload Submissions ───────────────────────
  onSubmit(): void {
    
    // Log the exact validation state of EVERY field
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
    
    });

    this.formSubmitted.set(true);
    
    if (this.form.invalid) {
       this.form.markAllAsTouched();
      this.errorMessage.set('Form is invalid. Please check the highlighted fields.');
      return; 
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const raw = this.form.getRawValue();

    const dto: CreateBuildingDto = {
      name:      raw.name?.trim() ?? '',
      address:   raw.address?.trim() ?? '',
      floors:    raw.floors != null ? Number(raw.floors) : undefined,
      units:     raw.units != null ? Number(raw.units) : undefined,
      complex_id: Number(raw.complex_id),
      admin_id:  Number(raw.admin_id)
    };

   
    this.buildingService.createBuilding(dto).subscribe({
      next: (res) => {
        this.successMessage.set(res.message);
        this.loading.set(false);
        setTimeout(() => this.router.navigate(['/buildings']), 1500);
      },
      error: (err) => {
        console.error('❌ [DEBUG] Backend Error Triggered!');
        console.error('📉 HTTP Status Code:', err.status);
        console.error('📄 Full Error Object:', err);
        console.error('📝 Error Body (err.error):', err.error);

        // Your existing error parsing
        const msg = err.error?.message;
        const text = Array.isArray(msg) ? msg.join('. ') : msg;
        this.errorMessage.set(text || 'Failed to create building.');
        this.loading.set(false);
      }
    });
  }

  // ── 7. Helpers ────────────────────────────────────────────
  isInvalid(path: string): boolean {
    const control = this.form.get(path);
    return !!(
      control &&
      control.invalid &&
      (control.touched || this.formSubmitted())
    );
  }
}