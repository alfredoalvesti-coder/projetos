import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { LucideScissors, LucideUserRound } from '@lucide/angular';

export interface AppointmentItem {
  id: number;
  clientName: string;
  service: string;
  barber: string;
  time: string;
  status: 'confirmado' | 'pendente' | 'em_atendimento';
  price: number;
}

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [CurrencyPipe, LucideScissors, LucideUserRound],
  templateUrl: './appointments-list.component.html',
  styleUrl: './appointments-list.component.scss'
})
export class AppointmentsListComponent {
  readonly title = input('Próximos clientes');
  readonly items = input.required<AppointmentItem[]>();
  readonly emptyMessage = input('Nenhum atendimento próximo.');
  readonly itemClick = output<AppointmentItem>();

  statusLabel(status: AppointmentItem['status']): string {
    switch (status) {
      case 'confirmado':
        return 'Confirmado';
      case 'em_atendimento':
        return 'Em atendimento';
      default:
        return 'Pendente';
    }
  }
}
