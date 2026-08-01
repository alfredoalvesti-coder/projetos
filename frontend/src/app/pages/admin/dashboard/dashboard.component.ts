import { Component, signal } from '@angular/core';
import { LucideArrowUpRight, LucideSparkles } from '@lucide/angular';
import { SummaryCardComponent } from '../shared/summary-card/summary-card.component';
import {
  AppointmentItem,
  AppointmentsListComponent
} from '../shared/appointments-list/appointments-list.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SummaryCardComponent, AppointmentsListComponent, LucideSparkles, LucideArrowUpRight],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  readonly todayLabel = 'Sábado, 1 de agosto';

  readonly summary = {
    appointmentsToday: 14,
    completed: 6,
    upcoming: 8,
    expectedRevenueLabel: 'R$ 980'
  };

  readonly upcomingAppointments = signal<AppointmentItem[]>([
    {
      id: 1,
      clientName: 'Lucas Ferreira',
      service: 'Corte + barba',
      barber: 'Carlos Singer',
      time: '15:00',
      status: 'em_atendimento',
      price: 70
    },
    {
      id: 2,
      clientName: 'Rafael Souza',
      service: 'Corte clássico',
      barber: 'Diego Alves',
      time: '15:40',
      status: 'confirmado',
      price: 45
    },
    {
      id: 3,
      clientName: 'Bruno Martins',
      service: 'Barba completa',
      barber: 'Rafael Lima',
      time: '16:20',
      status: 'confirmado',
      price: 35
    },
    {
      id: 4,
      clientName: 'Pedro Henrique',
      service: 'Corte clássico',
      barber: 'Carlos Singer',
      time: '17:00',
      status: 'pendente',
      price: 45
    },
    {
      id: 5,
      clientName: 'André Costa',
      service: 'Sobrancelha',
      barber: 'Diego Alves',
      time: '17:30',
      status: 'confirmado',
      price: 20
    }
  ]);

  readonly notice = signal('Movimento acima da média para o sábado. Cadeira 2 livre às 18h.');

  onNewAppointment(): void {
    // Visual only — next step wires real flow
  }
}
