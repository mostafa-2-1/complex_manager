
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // ── Router ──────────────────────────────────────────────
    // withComponentInputBinding allows route params as @Input()
    provideRouter(routes, withComponentInputBinding()),

    // ── HTTP Client ──────────────────────────────────────────
    // withFetch     → uses native fetch API (fixes SSR warning)
    // withInterceptors → attaches JWT token to every request
    provideHttpClient(
       withFetch(),
      withInterceptors([jwtInterceptor])
    )
  ]
};