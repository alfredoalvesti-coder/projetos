import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  type: ToastType;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  private readonly messagesSignal = signal<ToastMessage[]>([]);

  readonly messages = this.messagesSignal.asReadonly();

  success(text: string): void {
    this.push('success', text);
  }

  error(text: string): void {
    this.push('error', text);
  }

  info(text: string): void {
    this.push('info', text);
  }

  dismiss(id: number): void {
    this.messagesSignal.update((list) => list.filter((item) => item.id !== id));
  }

  private push(type: ToastType, text: string): void {
    const id = ++this.seq;
    this.messagesSignal.update((list) => [...list, { id, type, text }]);
    window.setTimeout(() => this.dismiss(id), 3200);
  }
}
