import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, merge } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import {
  AgendamentoResponse,
  AgendamentoService,
  StatusAgendamento
} from '../../core/agendamento.service';

type Aba = 'proximos' | 'historico';

@Component({
  selector: 'app-meus-agendamentos',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './meus-agendamentos.component.html',
  styleUrl: './meus-agendamentos.component.scss'
})
export class MeusAgendamentosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly agendamentoService = inject(AgendamentoService);
  private readonly destroyRef = inject(DestroyRef);
  readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly loadingHorarios = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly itens = signal<AgendamentoResponse[]>([]);
  readonly aba = signal<Aba>('proximos');
  readonly horariosOcupados = signal<string[]>([]);

  readonly editando = signal<AgendamentoResponse | null>(null);
  readonly cancelando = signal<AgendamentoResponse | null>(null);

  readonly servicos = ['Corte clássico', 'Barba completa', 'Corte + barba', 'Sobrancelha'];
  readonly barbeiros = ['Carlos Singer', 'Rafael Lima', 'Diego Alves'];
  readonly todosHorarios = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00'
  ];

  readonly form = this.fb.nonNullable.group({
    servico: ['', Validators.required],
    barbeiro: ['', Validators.required],
    data: ['', Validators.required],
    horario: ['', Validators.required],
    observacao: ['']
  });

  readonly horariosDisponiveis = computed(() => {
    const ocupados = new Set(this.horariosOcupados());
    return this.todosHorarios.filter((horario) => !ocupados.has(horario));
  });

  readonly proximos = computed(() =>
    this.itens()
      .filter((item) => this.isProximo(item))
      .sort((a, b) => `${a.data}${a.horario}`.localeCompare(`${b.data}${b.horario}`))
  );

  readonly historico = computed(() =>
    this.itens()
      .filter((item) => !this.isProximo(item))
      .sort((a, b) => `${b.data}${b.horario}`.localeCompare(`${a.data}${a.horario}`))
  );

  readonly listaAtual = computed(() => (this.aba() === 'proximos' ? this.proximos() : this.historico()));

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) {
      void this.router.navigate(['/login'], { queryParams: { returnUrl: '/meus-agendamentos' } });
      return;
    }
    this.carregar();

    merge(this.form.controls.barbeiro.valueChanges, this.form.controls.data.valueChanges)
      .pipe(debounceTime(150), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.editando()) {
          this.atualizarHorariosOcupados();
        }
      });
  }

  setAba(aba: Aba): void {
    this.aba.set(aba);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  carregar(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.agendamentoService.meus().subscribe({
      next: (itens) => {
        this.itens.set(itens);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message || 'Não foi possível carregar seus agendamentos.');
      }
    });
  }

  statusLabel(status: StatusAgendamento): string {
    switch (status) {
      case 'PENDENTE':
        return 'Pendente';
      case 'CONFIRMADO':
        return 'Confirmado';
      case 'CANCELADO':
        return 'Cancelado';
    }
  }

  formatarData(data: string): string {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  podeGerenciar(item: AgendamentoResponse): boolean {
    return this.isProximo(item);
  }

  abrirEdicao(item: AgendamentoResponse): void {
    this.cancelando.set(null);
    this.editando.set(item);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.form.setValue({
      servico: item.servico,
      barbeiro: item.barbeiro,
      data: item.data,
      horario: item.horario,
      observacao: item.observacao ?? ''
    });
    this.atualizarHorariosOcupados();
  }

  fecharEdicao(): void {
    this.editando.set(null);
    this.horariosOcupados.set([]);
  }

  private atualizarHorariosOcupados(): void {
    const atual = this.editando();
    const barbeiro = this.form.controls.barbeiro.value;
    const data = this.form.controls.data.value;

    if (!atual || !barbeiro || !data) {
      this.horariosOcupados.set([]);
      return;
    }

    this.loadingHorarios.set(true);
    this.agendamentoService.horariosOcupados(barbeiro, data, atual.id).subscribe({
      next: (ocupados) => {
        this.horariosOcupados.set(ocupados);
        this.loadingHorarios.set(false);
        const horarioAtual = this.form.controls.horario.value;
        if (horarioAtual && ocupados.includes(horarioAtual)) {
          this.form.controls.horario.setValue('');
        }
      },
      error: () => {
        this.loadingHorarios.set(false);
        this.horariosOcupados.set([]);
      }
    });
  }

  salvarEdicao(): void {
    const atual = this.editando();
    if (!atual || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    const { servico, barbeiro, data, horario, observacao } = this.form.getRawValue();

    this.agendamentoService
      .atualizar(atual.id, {
        servico,
        barbeiro,
        data,
        horario,
        observacao: observacao.trim() || undefined
      })
      .subscribe({
        next: (atualizado) => {
          this.saving.set(false);
          this.itens.update((lista) => lista.map((item) => (item.id === atualizado.id ? atualizado : item)));
          this.editando.set(null);
          this.horariosOcupados.set([]);
          this.successMessage.set('Agendamento atualizado.');
        },
        error: (err) => {
          this.saving.set(false);
          this.errorMessage.set(err?.error?.message || 'Não foi possível atualizar.');
          this.atualizarHorariosOcupados();
        }
      });
  }

  pedirCancelamento(item: AgendamentoResponse): void {
    this.editando.set(null);
    this.cancelando.set(item);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  fecharCancelamento(): void {
    this.cancelando.set(null);
  }

  confirmarCancelamento(): void {
    const atual = this.cancelando();
    if (!atual) {
      return;
    }

    this.saving.set(true);
    this.agendamentoService.cancelar(atual.id).subscribe({
      next: (cancelado) => {
        this.saving.set(false);
        this.itens.update((lista) => lista.map((item) => (item.id === cancelado.id ? cancelado : item)));
        this.cancelando.set(null);
        this.successMessage.set('Agendamento cancelado. O horário voltou a ficar disponível.');
        this.aba.set('historico');
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMessage.set(err?.error?.message || 'Não foi possível cancelar.');
      }
    });
  }

  private isProximo(item: AgendamentoResponse): boolean {
    if (item.status === 'CANCELADO') {
      return false;
    }
    const agora = new Date();
    const dataHora = new Date(`${item.data}T${item.horario}:00`);
    return dataHora.getTime() > agora.getTime();
  }
}
