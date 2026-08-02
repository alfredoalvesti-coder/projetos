import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  template: `
    <div class="toasts" aria-live="polite" aria-atomic="true">
      @for (toast of toasts.messages(); track toast.id) {
        <div class="toast" [attr.data-type]="toast.type" role="status">
          <span>{{ toast.text }}</span>
          <button type="button" (click)="toasts.dismiss(toast.id)" aria-label="Fechar">×</button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toasts {
        position: fixed;
        right: 1rem;
        bottom: 1rem;
        z-index: 80;
        display: grid;
        gap: 0.55rem;
        width: min(100% - 2rem, 22rem);
        pointer-events: none;
      }

      .toast {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.85rem 0.95rem;
        border-radius: 0.75rem;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: #1b1b1b;
        color: #fff;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
        pointer-events: auto;
        animation: toast-in 0.2s ease both;
      }

      .toast[data-type='success'] {
        border-color: rgba(212, 175, 55, 0.45);
      }

      .toast[data-type='error'] {
        border-color: rgba(196, 92, 92, 0.55);
      }

      .toast button {
        border: 0;
        background: transparent;
        color: #aaa;
        font-size: 1.1rem;
        line-height: 1;
        cursor: pointer;
      }

      @keyframes toast-in {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `
  ]
})
export class ToastHostComponent {
  readonly toasts = inject(ToastService);
}
