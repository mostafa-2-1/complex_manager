
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AdminRole } from '../models/admin.model';

export const roleGuard = (allowedRoles: AdminRole[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router      = inject(Router);

    // ── Not logged in at all ───────────────────────────────
    if (!authService.isLoggedIn()) {
      router.navigate(['/login']);
      return false;
    }

    // ── Logged in but wrong role ───────────────────────────
    if (!authService.hasRole(allowedRoles)) {
      // Redirect to dashboard — they are authenticated but unauthorized
      router.navigate(['/dashboard']);
      return false;
    }

    return true;
  };
};