import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import {
  LucideCalendar,
  LucideCalendarCheck,
  LucideClock3,
  LucideWallet
} from '@lucide/angular';

export type SummaryIcon = 'calendar' | 'check' | 'clock' | 'wallet';

@Component({
  selector: 'app-summary-card',
  standalone: true,
  imports: [NgClass, LucideCalendar, LucideCalendarCheck, LucideClock3, LucideWallet],
  templateUrl: './summary-card.component.html',
  styleUrl: './summary-card.component.scss'
})
export class SummaryCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly hint = input<string>('');
  readonly icon = input<SummaryIcon>('calendar');
  readonly accent = input<'gold' | 'muted'>('gold');
}
