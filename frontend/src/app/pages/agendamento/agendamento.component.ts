import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, forkJoin, merge } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { AgendamentoService } from '../../core/agendamento.service';
import { BarbeiroResponse, BarbeiroService } from '../../core/barbeiro.service';
import { ServicoResponse, ServicoService } from '../../core/servico.service';

@Component({
  selector: 'app-agendamento',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './agendamento.component.html',
  styleUrl: './agendamento.component.scss'
})
export class AgendamentoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly agendamentoService = inject(AgendamentoService);
  private readonly servicoApi = inject(ServicoService);
  private readonly barbeiroApi = inject(BarbeiroService);
  private readonly destroyRef = inject(DestroyRef);
  readonly auth = inject(AuthService);

  readonly enviado = signal(false);
  readonly loading = signal(false);
  readonly loadingHorarios = signal(false);
  readonly loadingOpcoes = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly ultimoId = signal<number | null>(null);
  readonly submitted = signal(false);
  readonly horariosOcupados = signal<string[]>([]);
  readonly servicos = signal<ServicoResponse[]>([]);
  readonly barbeiros = signal<BarbeiroResponse[]>([]);

  readonly form = this.fb.nonNullable.group({
    servico: ['', Validators.required],
    barbeiro: ['', Validators.required],
    data: ['', Validators.required],
    horario: ['', Validators.required],
    observacao: ['']
  });

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

  readonly horariosDisponiveis = computed(() => {
    const ocupados = new Set(this.horariosOcupados());
    return this.todosHorarios.filter((horario) => !ocupados.has(horario));
  });

  ngOnInit(): void {
    this.carregarOpcoes();

    merge(this.form.controls.barbeiro.valueChanges, this.form.controls.data.valueChanges)
      .pipe(debounceTime(150), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.atualizarHorariosOcupados());
  }

  private carregarOpcoes(): void {
    this.loadingOpcoes.set(true);
    forkJoin({
      servicos: this.servicoApi.listar(),
      barbeiros: this.barbeiroApi.listar()
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ servicos, barbeiros }) => {
          this.servicos.set(servicos);
          this.barbeiros.set(barbeiros);
          this.loadingOpcoes.set(false);

          const servicoPre = this.route.snapshot.queryParamMap.get('servico');
          if (servicoPre && servicos.some((item) => item.nome === servicoPre)) {
            this.form.controls.servico.setValue(servicoPre);
          }

          const barbeiroPre = this.route.snapshot.queryParamMap.get('barbeiro');
          if (barbeiroPre && barbeiros.some((item) => item.nome === barbeiroPre)) {
            this.form.controls.barbeiro.setValue(barbeiroPre);
          }
        },
        error: () => {
          this.loadingOpcoes.set(false);
          this.errorMessage.set('Não foi possível carregar serviços e barbeiros.');
        }
      });
  }

  irParaLogin(): void {
    void this.router.navigate(['/login'], { queryParams: { returnUrl: '/agendamento' } });
  }

  campoInvalido(nome: 'servico' | 'barbeiro' | 'data' | 'horario'): boolean {
    const campo = this.form.controls[nome];
    return campo.invalid && (campo.touched || this.submitted());
  }

  abrirCalendario(input: HTMLInputElement): void {
    input.showPicker?.();
    input.focus();
    input.click();
  }

  private atualizarHorariosOcupados(): void {
    const barbeiro = this.form.controls.barbeiro.value;
    const data = this.form.controls.data.value;

    if (!barbeiro || !data) {
      this.horariosOcupados.set([]);
      return;
    }

    this.loadingHorarios.set(true);
    this.agendamentoService.horariosOcupados(barbeiro, data).subscribe({
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

  submit(): void {
    if (!this.auth.isAuthenticated()) {
      this.irParaLogin();
      return;
    }

    this.submitted.set(true);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.errorMessage.set('Preencha os campos obrigatórios para continuar.');
      return;
    }

    if (!this.horariosDisponiveis().includes(this.form.controls.horario.value)) {
      this.errorMessage.set('Esse horário não está mais disponível. Escolha outro.');
      this.form.controls.horario.setValue('');
      this.atualizarHorariosOcupados();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { servico, barbeiro, data, horario, observacao } = this.form.getRawValue();

    this.agendamentoService
      .criar({
        servico,
        barbeiro,
        data,
        horario,
        observacao: observacao.trim() || undefined
      })
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          this.ultimoId.set(response.id);
          this.enviado.set(true);
          this.submitted.set(false);
          this.horariosOcupados.set([]);
          this.form.reset({
            servico: '',
            barbeiro: '',
            data: '',
            horario: '',
            observacao: ''
          });
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err?.error?.message || 'Não foi possível salvar o agendamento.');
          this.atualizarHorariosOcupados();
        }
      });
  }
}
