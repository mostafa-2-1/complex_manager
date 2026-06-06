
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [

  // ── Public ────────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent)
  },

  // ── Protected ─────────────────────────────────────────────
  {
    path: '',
    canActivate: [authGuard],
    children: [

      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },

      // ── Admins ──────────────────────────────────────────
      {
        path: 'admins',
        loadComponent: () =>
          import('./features/admins/admin-list/admin-list.component')
            .then(m => m.AdminListComponent)
      },
      {
        path: 'admins/new',
        canActivate: [roleGuard(['super_admin'])],
        loadComponent: () =>
          import('./features/admins/admin-form/admin-form.component')
            .then(m => m.AdminFormComponent)
      },
      {
        path: 'admins/:id',
        loadComponent: () =>
          import('./features/admins/admin-detail/admin-detail.component')
            .then(m => m.AdminDetailComponent)
      },

      // ── Complexes ────────────────────────────────────────
      {
        path: 'complexes',
        loadComponent: () =>
          import('./features/complexes/complex-list/complex-list.component')
            .then(m => m.ComplexListComponent)
      },
      {
        path: 'complexes/new',
        canActivate: [roleGuard(['super_admin'])],
        loadComponent: () =>
          import('./features/complexes/complex-form/complex-form.component')
            .then(m => m.ComplexFormComponent)
      },
      {
        path: 'complexes/:id',
        loadComponent: () =>
          import('./features/complexes/complex-detail/complex-detail.component')
            .then(m => m.ComplexDetailComponent)
      },

      // ── Buildings ────────────────────────────────────────
      {
        path: 'buildings',
        loadComponent: () =>
          import('./features/buildings/building-list/building-list.component')
            .then(m => m.BuildingListComponent)
      },
      {
        path: 'buildings/new',
        canActivate: [roleGuard(['super_admin', 'complex_admin'])],
        loadComponent: () =>
          import('./features/buildings/building-form/building-form.component')
            .then(m => m.BuildingFormComponent)
      },
      {
        path: 'buildings/:id',
        loadComponent: () =>
          import('./features/buildings/building-detail/building-detail.component')
            .then(m => m.BuildingDetailComponent)
      },
      // ── Default redirect ─────────────────────────────────
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // ── Fallback ──────────────────────────────────────────────
  {
    path: '**',
    redirectTo: 'login'
  }
];