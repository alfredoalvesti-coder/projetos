import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { BarbeiroResponse, BarbeiroService } from '../../core/barbeiro.service';

@Component({
  selector: 'app-barbeiros',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './barbeiros.component.html',
  styleUrl: './barbeiros.component.scss'
})
export class BarbeirosComponent implements OnInit {
  private readonly barbeiroApi = inject(BarbeiroService);
  private readonly destroyRef = inject(DestroyRef);

  readonly barbeiros = signal<BarbeiroResponse[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.barbeiroApi
      .listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lista) => {
          this.barbeiros.set(lista);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.errorMessage.set('Não foi possível carregar os barbeiros.');
        }
      });
  }

  primeiroNome(nome: string): string {
    return nome.trim().split(/\s+/)[0] || nome;
  }
}
