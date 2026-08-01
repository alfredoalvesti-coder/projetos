import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  ServicoResponse,
  ServicoService,
  formatarDuracao,
  formatarPreco
} from '../../core/servico.service';

@Component({
  selector: 'app-servicos',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './servicos.component.html',
  styleUrl: './servicos.component.scss'
})
export class ServicosComponent implements OnInit {
  private readonly servicoApi = inject(ServicoService);
  private readonly destroyRef = inject(DestroyRef);

  readonly servicos = signal<ServicoResponse[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  readonly formatarDuracao = formatarDuracao;
  readonly formatarPreco = formatarPreco;

  ngOnInit(): void {
    this.servicoApi
      .listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lista) => {
          this.servicos.set(lista);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.errorMessage.set('Não foi possível carregar os serviços.');
        }
      });
  }
}
