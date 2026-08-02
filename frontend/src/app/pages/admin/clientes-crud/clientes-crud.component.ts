import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucideCalendarPlus,
  LucideEye,
  LucidePencil,
  LucidePlus,
  LucideSearch,
  LucideTrash2,
  LucideUsers,
  LucideX
} from '@lucide/angular';
import {
  ClientePayload,
  ClienteResponse,
  ClienteService,
  StatusCliente,
  formatarDataBr,
  toDateInputValue
} from '../../../core/cliente.service';
import { ToastService } from '../../../core/toast.service';

type ModalMode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-clientes-crud',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    LucidePlus,
    LucideSearch,
    LucideUsers,
    LucideEye,
    LucidePencil,
    LucideTrash2,
    LucideCalendarPlus,
    LucideX
  ],
  templateUrl: './clientes-crud.component.html',
  styleUrl: './clientes-crud.component.scss'
})
export class ClientesCrudComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly clienteApi = inject(ClienteService);
  private readonly toast = inject(ToastService);

  readonly pageSize = 10;

  readonly clientes = signal<ClienteResponse[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly search = signal('');
  readonly page = signal(1);
  readonly modalOpen = signal(false);
  readonly modalMode = signal<ModalMode>('create');
  readonly editingId = signal<number | null>(null);
  readonly confirmDelete = signal<ClienteResponse | null>(null);
  readonly submitted = signal(false);

  readonly formatarDataBr = formatarDataBr;

  readonly maxDataNascimento = (() => {
    const hoje = new Date();
    hoje.setDate(hoje.getDate() - 1);
    return hoje.toISOString().slice(0, 10);
  })();

  readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    telefone: ['', [Validators.required, Validators.maxLength(30)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(180)]],
    dataNascimento: [''],
    observacoes: ['', [Validators.maxLength(1000)]],
    status: this.fb.nonNullable.control<StatusCliente>('ATIVO')
  });

  readonly filtrados = computed(() => {
    const termo = this.search().trim().toLowerCase();
    const lista = this.clientes();
    if (!termo) {
      return lista;
    }
    return lista.filter((cliente) => {
      const nome = cliente.nome?.toLowerCase() ?? '';
      const email = cliente.email?.toLowerCase() ?? '';
      const telefone = (cliente.telefone ?? '').replace(/\D/g, '');
      const termoDigitos = termo.replace(/\D/g, '');
      return (
        nome.includes(termo) ||
        email.includes(termo) ||
        (termoDigitos.length > 0 && telefone.includes(termoDigitos)) ||
        (cliente.telefone ?? '').toLowerCase().includes(termo)
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
      return 'Mostrando 0 de 0 clientes';
    }
    const start = (this.paginaAtual() - 1) * this.pageSize + 1;
    const end = Math.min(this.paginaAtual() * this.pageSize, total);
    return `Mostrando ${start}–${end} de ${total} clientes`;
  });

  readonly modalTitle = computed(() => {
    switch (this.modalMode()) {
      case 'view':
        return 'Detalhes do cliente';
      case 'edit':
        return 'Editar cliente';
      default:
        return 'Novo cliente';
    }
  });

  readonly isViewMode = computed(() => this.modalMode() === 'view');

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.loading.set(true);
    this.clienteApi.listar().subscribe({
      next: (lista) => {
        this.clientes.set(lista);
        this.loading.set(false);
        this.garantirPaginaValida();
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Não foi possível carregar os clientes.');
      }
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

  openCreate(): void {
    this.modalMode.set('create');
    this.editingId.set(null);
    this.submitted.set(false);
    this.form.reset({
      nome: '',
      telefone: '',
      email: '',
      dataNascimento: '',
      observacoes: '',
      status: 'ATIVO'
    });
    this.form.enable();
    this.modalOpen.set(true);
  }

  openView(cliente: ClienteResponse): void {
    this.fillForm(cliente);
    this.modalMode.set('view');
    this.form.disable();
    this.modalOpen.set(true);
  }

  openEdit(cliente: ClienteResponse): void {
    this.fillForm(cliente);
    this.modalMode.set('edit');
    this.form.enable();
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.submitted.set(false);
    this.form.enable();
  }

  askDelete(cliente: ClienteResponse): void {
    this.confirmDelete.set(cliente);
  }

  cancelDelete(): void {
    this.confirmDelete.set(null);
  }

  confirmDeleteAction(): void {
    const cliente = this.confirmDelete();
    if (!cliente) {
      return;
    }

    this.clienteApi.excluir(cliente.id).subscribe({
      next: () => {
        this.confirmDelete.set(null);
        if (this.editingId() === cliente.id) {
          this.closeModal();
        }
        this.toast.success('Cliente excluído.');
        this.carregar();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Não foi possível excluir o cliente.');
      }
    });
  }

  novoAgendamento(cliente: ClienteResponse): void {
    this.toast.info(`Em breve: agendar para ${cliente.nome}.`);
  }

  campoInvalido(nome: 'nome' | 'telefone' | 'email' | 'dataNascimento' | 'observacoes'): boolean {
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
    const payload: ClientePayload = {
      nome: raw.nome.trim(),
      telefone: raw.telefone.trim(),
      email: raw.email.trim().toLowerCase(),
      dataNascimento: raw.dataNascimento || null,
      observacoes: raw.observacoes.trim() || undefined,
      status: raw.status
    };

    this.saving.set(true);
    const id = this.editingId();
    const request$ = id == null ? this.clienteApi.criar(payload) : this.clienteApi.atualizar(id, payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.toast.success(id == null ? 'Cliente cadastrado.' : 'Cliente atualizado.');
        this.carregar();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(err?.error?.message || 'Não foi possível salvar o cliente.');
      }
    });
  }

  statusLabel(status: StatusCliente): string {
    return status === 'ATIVO' ? 'Ativo' : 'Inativo';
  }

  initials(nome: string): string {
    return nome
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  private fillForm(cliente: ClienteResponse): void {
    this.editingId.set(cliente.id);
    this.submitted.set(false);
    this.form.reset({
      nome: cliente.nome ?? '',
      telefone: cliente.telefone ?? '',
      email: cliente.email ?? '',
      dataNascimento: toDateInputValue(cliente.dataNascimento),
      observacoes: cliente.observacoes ?? '',
      status: cliente.status ?? 'ATIVO'
    });
  }

  private garantirPaginaValida(): void {
    if (this.page() > this.totalPaginas()) {
      this.page.set(this.totalPaginas());
    }
  }
}
