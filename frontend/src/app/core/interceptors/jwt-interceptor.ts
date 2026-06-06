
import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

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
          token) {
        // Token was sent but rejected — clear and redirect
        try {
          window.localStorage.removeItem('token');
          window.localStorage.removeItem('currentAdmin');
        } catch { /* silent */ }
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};