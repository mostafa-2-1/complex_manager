
import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  // Show navbar only when authenticated
  readonly showNavbar = computed(() => this.authService.isLoggedIn());

  constructor(public authService: AuthService) {}
}