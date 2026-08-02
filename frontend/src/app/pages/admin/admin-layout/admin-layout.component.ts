import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { AuthService } from '../../../core/auth.service';
import { ToastHostComponent } from '../../../shared/toast-host/toast-host.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, ToastHostComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly menuOpen = signal(false);

  readonly userName = this.auth.session()?.nome ?? 'Administrador';

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  readonly pageTitle = computed(() => {
    const url = this.currentUrl();
    if (url.includes('/admin/agendamentos')) {
      return '';
    }
    if (url.includes('/admin/servicos')) {
      return 'Serviços';
    }
    if (url.includes('/admin/barbeiros')) {
      return 'Barbeiros';
    }
    if (url.includes('/admin/clientes')) {
      return '';
    }
    return 'Dashboard';
  });

  readonly pageSubtitle = computed(() => {
    const url = this.currentUrl();
    if (url.includes('/admin/agendamentos')) {
      return '';
    }
    if (url.includes('/admin/servicos')) {
      return 'Cadastro e gestão dos serviços da barbearia';
    }
    if (url.includes('/admin/barbeiros')) {
      return 'Cadastro e gestão dos profissionais';
    }
    if (url.includes('/admin/clientes')) {
      return '';
    }
    return 'Visão geral da operação de hoje';
  });

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  onNewAppointment(): void {
    void this.router.navigate(['/admin/agendamentos'], { queryParams: { novo: '1' } });
  }
}
