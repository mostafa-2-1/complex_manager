// frontend/src/app/features/auth/login/login.component.ts

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  // ── 1. Modern Functional Dependency Injection ─────────────
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // ── 2. UI State Signals ───────────────────────────────────
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly showPassword = signal(false);

  private returnUrl = '/dashboard';

  // ── 3. Declarative Form Definition ────────────────────────
  public readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  // ── 4. Early-Exit Structural Guard Verification ──────────
  constructor() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  // ── 5. Form Submission Execution Handler ─────────────────
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.form.getRawValue();

    this.authService.login(email, password).subscribe({
      next: (response) => {
        if (response.success) {
          setTimeout(() => {
            this.router.navigateByUrl(this.returnUrl);
          }, 100);
          return;
        }

        this.errorMessage.set(response.message);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          err.error?.message || 'Login failed. Please try again.'
        );
        this.loading.set(false);
      }
    });
  }

  // ── 6. UI Logic Interactions ──────────────────────────────
  togglePassword(): void {
    this.showPassword.update(value => !value);
  }

  // ── 7. Exploded Controls for Strict Template Scoping ──────
  get emailControl() {
    return this.form.controls.email;
  }

  get passwordControl() {
    return this.form.controls.password;
  }
}