import { Routes } from '@angular/router';
import { adminGuard, authGuard, clientOnlyGuard, guestGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/site-layout.component').then((m) => m.SiteLayoutComponent),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent)
      },
      {
        path: 'servicos',
        loadComponent: () => import('./pages/servicos/servicos.component').then((m) => m.ServicosComponent)
      },
      {
        path: 'barbeiros',
        loadComponent: () => import('./pages/barbeiros/barbeiros.component').then((m) => m.BarbeirosComponent)
      },
      {
        path: 'agendamento',
        canActivate: [clientOnlyGuard],
        loadComponent: () =>
          import('./pages/agendamento/agendamento.component').then((m) => m.AgendamentoComponent)
      },
      {
        path: 'meus-agendamentos',
        canActivate: [clientOnlyGuard],
        loadComponent: () =>
          import('./pages/meus-agendamentos/meus-agendamentos.component').then(
            (m) => m.MeusAgendamentosComponent
          )
      },
      {
        path: 'sobre',
        loadComponent: () => import('./pages/sobre/sobre.component').then((m) => m.SobreComponent)
      },
      {
        path: 'contato',
        loadComponent: () => import('./pages/contato/contato.component').then((m) => m.ContatoComponent)
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./pages/admin/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/admin/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'agendamentos',
        loadComponent: () =>
          import('./pages/admin/agendamentos-crud/agendamentos-crud.component').then(
            (m) => m.AgendamentosCrudComponent
          )
      },
      {
        path: 'servicos',
        loadComponent: () =>
          import('./pages/admin/servicos-crud/servicos-crud.component').then(
            (m) => m.ServicosCrudComponent
          )
      },
      {
        path: 'barbeiros',
        loadComponent: () =>
          import('./pages/admin/barbeiros-crud/barbeiros-crud.component').then(
            (m) => m.BarbeirosCrudComponent
          )
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./pages/admin/clientes-crud/clientes-crud.component').then(
            (m) => m.ClientesCrudComponent
          )
      }
    ]
  },
  { path: '**', redirectTo: 'home' }
];
