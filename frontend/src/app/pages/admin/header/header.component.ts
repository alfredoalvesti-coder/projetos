import { Component, input, output } from '@angular/core';
import { LucideBell, LucideMenu, LucidePlus } from '@lucide/angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LucideMenu, LucideBell, LucidePlus],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  readonly title = input('Dashboard');
  readonly subtitle = input('Visão geral da operação de hoje');
  readonly userName = input('Administrador');
  readonly menuToggle = output<void>();
  readonly newAppointment = output<void>();
}
