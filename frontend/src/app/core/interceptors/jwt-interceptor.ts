
import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

// ── Safe localStorage read ─────────────────────────────────────────────────────
function getToken(): string | null {
  try {
    return window.localStorage.getItem('token');
  } catch {
    return null;
  }
}

export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const router = inject(Router);
  const token  = getToken();
  const authService = inject(AuthService);

  // ── Attach token ───────────────────────────────────────────
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(authReq).pipe(
    
    catchError((error: HttpErrorResponse) => {

    if (
      (error.status === 401 || error.status === 422) &&
      token
    ) {
      authService.logout();
    }

    return throwError(() => error);
  })
  );
};