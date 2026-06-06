
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

function hasTokenInStorage(): boolean {
  try {
    return !!window.localStorage.getItem('token');
  } catch {
    return false;
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  // Check both signal and localStorage directly
  if (authService.isLoggedIn() || hasTokenInStorage()) {
    return true;
  }

  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};