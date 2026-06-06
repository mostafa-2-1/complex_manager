import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AdminService } from '../../../core/services/admin.service';

import {
  CIVILITY_OPTIONS,
  ROLE_OPTIONS,
  STATUS_OPTIONS
} from '../../../core/models/admin.model';

@Component({
  selector: 'app-admin-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './admin-form.component.html'
})
export class AdminFormComponent {

  form: FormGroup;

  readonly loading = signal(false);
  readonly successMessage = signal('');
  readonly errorMessage = signal('');

  readonly civilityOptions = CIVILITY_OPTIONS;
  readonly roleOptions = ROLE_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private router: Router
  ) {

    this.form = this.fb.group({
      civility: ['Mr', Validators.required],

      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],

      email: ['', [Validators.required, Validators.email]],
      phone: [''],

      role: ['building_admin', Validators.required],
      status: ['active', Validators.required],

      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.adminService.createAdmin(this.form.value).subscribe({
      next: (res) => {
        this.successMessage.set(res.message);
        this.loading.set(false);

        setTimeout(() => {
          this.router.navigate(['/admins']);
        }, 1200);
      },

      error: (err) => {
        this.errorMessage.set(
          err.error?.message || 'Failed to create admin.'
        );
        this.loading.set(false);
      }
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }
}