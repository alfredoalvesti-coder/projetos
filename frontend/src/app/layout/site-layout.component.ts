import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-site-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './site-layout.component.html',
  styleUrl: './site-layout.component.scss'
})
export class SiteLayoutComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly menuOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.menuOpen.set(false));
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  logout(): void {
    this.auth.logout();
  }
}
