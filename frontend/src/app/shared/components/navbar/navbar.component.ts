
import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface NavLink {
  path:  string;
  label: string;
  icon:  string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  // ── Mobile menu toggle ────────────────────────────────────
  menuOpen = false;

  // ── Nav links visible to all authenticated roles ──────────
  readonly navLinks: NavLink[] = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/admins',    label: 'Admins',    icon: '👥' },
    { path: '/complexes', label: 'Complexes', icon: '🏘️' },
    { path: '/buildings', label: 'Buildings', icon: '🏗️' }
  ];

  // ── Full name computed from signal ─────────────────────────
  readonly fullName = computed(() => {
    const admin = this.authService.currentAdmin();
    if (!admin) return '';
    return `${admin.civility} ${admin.first_name} ${admin.last_name}`;
  });

  // ── Role label computed from signal ───────────────────────
  readonly roleLabel = computed(() => {
    const role = this.authService.currentAdmin()?.role;
    const map: Record<string, string> = {
      super_admin:    'Super Admin',
      complex_admin:  'Complex Admin',
      building_admin: 'Building Admin'
    };
    return role ? (map[role] ?? role) : '';
  });

  // ── Role badge color ──────────────────────────────────────
  readonly roleBadgeClass = computed(() => {
    const role = this.authService.currentAdmin()?.role;
    const map: Record<string, string> = {
      super_admin:    'badge bg-danger',
      complex_admin:  'badge bg-warning text-dark',
      building_admin: 'badge bg-info text-dark'
    };
    return role ? (map[role] ?? 'badge bg-secondary') : '';
  });

  constructor(public authService: AuthService) {}

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  onLogout(): void {
    this.closeMenu();
    this.authService.logout();
  }
}