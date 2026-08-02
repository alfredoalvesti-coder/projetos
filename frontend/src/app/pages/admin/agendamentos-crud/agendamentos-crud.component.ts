import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  LucideCalendarDays,
  LucideEye,
  LucidePencil,
  LucidePlus,
  LucideSearch,
  LucideX,
  LucideXCircle
} from '@lucide/angular';
import { debounceTime, distinctUntilChanged, merge } from 'rxjs';
import {
  AdminAgendamentoPayload,
  AgendamentoResponse,
  AgendamentoService,
  StatusAgendamento,
  statusAgendamentoLabel
} from '../../../core/agendamento.service';
import { BarbeiroResponse, BarbeiroService } from '../../../core/barbeiro.service';
import { ClienteResponse, ClienteService, formatarDataBr, toDateInputValue } from '../../../core/cliente.service';
import { ServicoResponse, ServicoService } from '../../../core/servico.service';
import { ToastService } from '../../../core/toast.service';

type ModalMode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-agendamentos-crud',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    LucidePlus,
    LucideSearch,
    LucideCalendarDays,
    LucideEye,
    LucidePencil,
    LucideXCircle,
    LucideX
  ],
  templateUrl: './agendamentos-crud.component.html',
  styleUrl: './agendamentos-crud.component.scss'
})
export class AgendamentosCrudComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly agendamentoApi = inject(AgendamentoService);
  private readonly clienteApi = inject(ClienteService);
  private readonly servicoApi = inject(ServicoService);
  private readonly barbeiroApi = inject(BarbeiroService);
  private readonly toast = inject(ToastService);

  readonly pageSize = 10;
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

  readonly agendamentos = signal<AgendamentoResponse[]>([]);
  readonly clientes = signal<ClienteResponse[]>([]);
  readonly servicos = signal<ServicoResponse[]>([]);
  readonly barbeiros = signal<BarbeiroResponse[]>([]);
  readonly horariosOcupados = signal<string[]>([]);
  readonly loading = signal(true);
  readonly loadingHorarios = signal(false);
  readonly saving = signal(false);
  readonly search = signal('');
  readonly page = signal(1);
  readonly modalOpen = signal(false);
  readonly modalMode = signal<ModalMode>('create');
  readonly editingId = signal<number | null>(null);
  readonly confirmCancel = signal<AgendamentoResponse | null>(null);
  readonly submitted = signal(false);

  readonly formatarDataBr = formatarDataBr;
  readonly statusLabel = statusAgendamentoLabel;

  readonly minData = new Date().toISOString().slice(0, 10);

  readonly form = this.fb.group({
    clienteId: this.fb.control<number | null>(null, Validators.required),
    servico: this.fb.nonNullable.control('', Validators.required),
    barbeiro: this.fb.nonNullable.control('', Validators.required),
    data: this.fb.nonNullable.control('', Validators.required),
    horario: this.fb.nonNullable.control('', Validators.required),
    observacao: this.fb.nonNullable.control('', Validators.maxLength(500)),
    status: this.fb.nonNullable.control<StatusAgendamento>('PENDENTE')
  });

  readonly filtrados = computed(() => {
    const termo = this.search().trim().toLowerCase();
    const lista = this.agendamentos();
    if (!termo) {
      return lista;
    }
    return lista.filter((item) => {
      const cliente = (item.clienteNome ?? '').toLowerCase();
      const telefone = (item.clienteTelefone ?? '').replace(/\D/g, '');
      const termoDigitos = termo.replace(/\D/g, '');
      const servico = item.servico?.toLowerCase() ?? '';
      const barbeiro = item.barbeiro?.toLowerCase() ?? '';
      const data = formatarDataBr(item.data).toLowerCase();
      const horario = item.horario?.toLowerCase() ?? '';
      const status = statusAgendamentoLabel(item.status).toLowerCase();
      return (
        cliente.includes(termo) ||
        servico.includes(termo) ||
        barbeiro.includes(termo) ||
        data.includes(termo) ||
        horario.includes(termo) ||
        status.includes(termo) ||
        (termoDigitos.length > 0 && telefone.includes(termoDigitos)) ||
        (item.clienteTelefone ?? '').toLowerCase().includes(termo)
      );
    });
  });

  readonly totalFiltrados = computed(() => this.filtrados().length);

  readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.totalFiltrados() / this.pageSize)));

  readonly paginaAtual = computed(() => {
    const total = this.totalPaginas();
    const atual = this.page();
    return Math.min(Math.max(atual, 1), total);
  });

  readonly pageItems = computed(() => {
    const start = (this.paginaAtual() - 1) * this.pageSize;
    return this.filtrados().slice(start, start + this.pageSize);
  });

  readonly rangeLabel = computed(() => {
    const total = this.totalFiltrados();
    if (total === 0) {
      return 'Mostrando 0 de 0 agendamentos';
    }
    const start = (this.paginaAtual() - 1) * this.pageSize + 1;
    const end = Math.min(this.paginaAtual() * this.pageSize, total);
    return `Mostrando ${start}–${end} de ${total} agendamentos`;
  });

  readonly modalTitle = computed(() => {
    switch (this.modalMode()) {
      case 'view':
        return 'Detalhes do agendamento';
      case 'edit':
        return 'Editar agendamento';
      default:
        return 'Novo agendamento';
    }
  });

  readonly isViewMode = computed(() => this.modalMode() === 'view');

  readonly horariosDisponiveis = computed(() => {
    const ocupados = new Set(this.horariosOcupados());
    const atual = this.form.controls.horario.value;
    return this.todosHorarios.filter((horario) => !ocupados.has(horario) || horario === atual);
  });

  readonly clientesAtivos = computed(() => {
    const selecionado = this.form.controls.clienteId.value;
    return this.clientes().filter(
      (cliente) => cliente.status === 'ATIVO' || cliente.id === selecionado
    );
  });

  ngOnInit(): void {
    this.carregar();

    merge(this.form.controls.barbeiro.valueChanges, this.form.controls.data.valueChanges)
      .pipe(debounceTime(150), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.atualizarHorariosOcupados());

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const clienteId = Number(params.get('clienteId'));
      const novo = params.get('novo') === '1';
      const temCliente = Number.isFinite(clienteId) && clienteId > 0;
      if (novo || temCliente) {
        this.openCreate(temCliente ? clienteId : undefined);
        void this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
      }
    });
  }

  carregar(): void {
    this.loading.set(true);

    this.agendamentoApi.listarAdmin().subscribe({
      next: (agendamentos) => {
        this.agendamentos.set(agendamentos);
        this.loading.set(false);
        this.garantirPaginaValida();
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Não foi possível carregar os agendamentos.');
      }
    });

    this.clienteApi.listar().subscribe({
      next: (clientes) => this.clientes.set(clientes),
      error: () => this.toast.error('Não foi possível carregar os clientes.')
    });

    this.servicoApi.listar().subscribe({
      next: (servicos) => this.servicos.set(servicos),
      error: () => this.toast.error('Não foi possível carregar os serviços.')
    });

    this.barbeiroApi.listar().subscribe({
      next: (barbeiros) => this.barbeiros.set(barbeiros),
      error: () => this.toast.error('Não foi possível carregar os barbeiros.')
    });
  }

  onSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  prevPage(): void {
    this.page.update((p) => Math.max(1, p - 1));
  }

  nextPage(): void {
    this.page.update((p) => Math.min(this.totalPaginas(), p + 1));
  }

  openCreate(clienteId?: number): void {
    this.modalMode.set('create');
    this.editingId.set(null);
    this.submitted.set(false);
    this.horariosOcupados.set([]);
    this.form.reset({
      clienteId: clienteId && clienteId > 0 ? clienteId : null,
      servico: '',
      barbeiro: '',
      data: '',
      horario: '',
      observacao: '',
      status: 'PENDENTE'
    });
    this.form.enable();
    this.modalOpen.set(true);
  }

  openView(item: AgendamentoResponse): void {
    this.fillForm(item);
    this.modalMode.set('view');
    this.form.disable();
    this.modalOpen.set(true);
    this.atualizarHorariosOcupados();
  }

  openEdit(item: AgendamentoResponse): void {
    if (item.status === 'CANCELADO') {
      this.toast.info('Agendamentos cancelados não podem ser editados.');
      return;
    }
    this.fillForm(item);
    this.modalMode.set('edit');
    this.form.enable();
    this.modalOpen.set(true);
    this.atualizarHorariosOcupados();
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.submitted.set(false);
    this.form.enable();
  }

  askCancel(item: AgendamentoResponse): void {
    if (item.status === 'CANCELADO') {
      return;
    }
    this.confirmCancel.set(item);
  }

  dismissCancel(): void {
    this.confirmCancel.set(null);
  }

  confirmCancelAction(): void {
    const item = this.confirmCancel();
    if (!item) {
      return;
    }

    this.agendamentoApi.cancelarAdmin(item.id).subscribe({
      next: () => {
        this.confirmCancel.set(null);
        if (this.editingId() === item.id) {
          this.closeModal();
        }
        this.toast.success('Agendamento cancelado.');
        this.carregar();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Não foi possível cancelar o agendamento.');
      }
    });
  }

  campoInvalido(
    nome: 'clienteId' | 'servico' | 'barbeiro' | 'data' | 'horario' | 'observacao'
  ): boolean {
    const campo = this.form.controls[nome];
    return campo.invalid && (campo.touched || this.submitted());
  }

  abrirCalendario(input: HTMLInputElement): void {
    input.showPicker?.();
    input.focus();
    input.click();
  }

  salvar(): void {
    if (this.isViewMode()) {
      return;
    }

    this.submitted.set(true);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.toast.error('Preencha os campos obrigatórios.');
      return;
    }

    const raw = this.form.getRawValue();
    const clienteId = Number(raw.clienteId);
    if (!clienteId) {
      this.toast.error('Selecione um cliente.');
      return;
    }

    const horario = raw.horario ?? '';
    if (!this.horariosDisponiveis().includes(horario)) {
      this.toast.error('Esse horário não está disponível. Escolha outro.');
      this.form.controls.horario.setValue('');
      this.atualizarHorariosOcupados();
      return;
    }

    const payload: AdminAgendamentoPayload = {
      clienteId,
      servico: (raw.servico ?? '').trim(),
      barbeiro: (raw.barbeiro ?? '').trim(),
      data: raw.data ?? '',
      horario,
      observacao: (raw.observacao ?? '').trim() || undefined,
      status: raw.status ?? 'PENDENTE'
    };

    this.saving.set(true);
    const id = this.editingId();
    const request$ =
      id == null ? this.agendamentoApi.criarAdmin(payload) : this.agendamentoApi.atualizarAdmin(id, payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.toast.success(id == null ? 'Agendamento criado.' : 'Agendamento atualizado.');
        this.carregar();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(err?.error?.message || 'Não foi possível salvar o agendamento.');
        this.atualizarHorariosOcupados();
      }
    });
  }

  initials(nome: string): string {
    return (nome || '?')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  private fillForm(item: AgendamentoResponse): void {
    this.editingId.set(item.id);
    this.submitted.set(false);
    this.form.reset({
      clienteId: item.clienteId ?? null,
      servico: item.servico ?? '',
      barbeiro: item.barbeiro ?? '',
      data: toDateInputValue(item.data),
      horario: item.horario ?? '',
      observacao: item.observacao ?? '',
      status: item.status ?? 'PENDENTE'
    });
  }

  private atualizarHorariosOcupados(): void {
    const barbeiro = this.form.controls.barbeiro.value;
    const data = this.form.controls.data.value;
    const ignoreId = this.editingId() ?? undefined;

    if (!barbeiro || !data || this.isViewMode()) {
      this.horariosOcupados.set([]);
      return;
    }

    this.loadingHorarios.set(true);
    this.agendamentoApi.horariosOcupados(barbeiro, data, ignoreId).subscribe({
      next: (ocupados) => {
        this.horariosOcupados.set(ocupados);
        this.loadingHorarios.set(false);
        const horarioAtual = this.form.controls.horario.value;
        if (horarioAtual && ocupados.includes(horarioAtual) && this.editingId() == null) {
          this.form.controls.horario.setValue('');
        }
      },
      error: () => {
        this.loadingHorarios.set(false);
        this.horariosOcupados.set([]);
      }
    });
  }

  private garantirPaginaValida(): void {
    if (this.page() > this.totalPaginas()) {
      this.page.set(this.totalPaginas());
    }
  }
}
