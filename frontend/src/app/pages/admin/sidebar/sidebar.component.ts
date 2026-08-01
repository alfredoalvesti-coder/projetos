import { Component, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideCalendarDays,
  LucideClock3,
  LucideGlobe,
  LucideLayoutDashboard,
  LucideLogOut,
  LucideScissors,
  LucideSettings,
  LucideUsers,
  LucideUserRound
} from '@lucide/angular';
import { AuthService } from '../../../core/auth.service';

export interface AdminNavItem {
  label: string;
  icon:
    | 'dashboard'
    | 'appointments'
    | 'services'
    | 'barbers'
    | 'clients'
    | 'hours'
    | 'site'
    | 'settings';
  route?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    LucideLayoutDashboard,
    LucideCalendarDays,
    LucideScissors,
    LucideUsers,
    LucideUserRound,
    LucideClock3,
    LucideGlobe,
    LucideSettings,
    LucideLogOut
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);

  readonly open = input(false);
  readonly closeMenu = output<void>();

  readonly items: AdminNavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Agendamentos', icon: 'appointments', disabled: true },
    { label: 'Serviços', icon: 'services', disabled: true },
    { label: 'Barbeiros', icon: 'barbers', disabled: true },
    { label: 'Clientes', icon: 'clients', disabled: true },
    { label: 'Horários', icon: 'hours', disabled: true },
    { label: 'Configuração do site', icon: 'site', disabled: true },
    { label: 'Configurações', icon: 'settings', disabled: true }
  ];

  onNavigate(): void {
    this.closeMenu.emit();
  }

  logout(): void {
    this.closeMenu.emit();
    this.auth.logout();
  }
}
