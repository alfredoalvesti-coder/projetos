import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucideEye,
  LucidePencil,
  LucidePlus,
  LucideScissors,
  LucideSearch,
  LucideTrash2,
  LucideX
} from '@lucide/angular';
import {
  ServicoPayload,
  ServicoResponse,
  ServicoService,
  formatarDuracao,
  formatarPreco
} from '../../../core/servico.service';
import { ToastService } from '../../../core/toast.service';

type ModalMode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-servicos-crud',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    LucidePlus,
    LucideSearch,
    LucideScissors,
    LucideEye,
    LucidePencil,
    LucideTrash2,
    LucideX
  ],
  templateUrl: './servicos-crud.component.html',
  styleUrl: './servicos-crud.component.scss'
})
export class ServicosCrudComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicoApi = inject(ServicoService);
  private readonly toast = inject(ToastService);

  readonly pageSize = 10;

  readonly servicos = signal<ServicoResponse[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly search = signal('');
  readonly page = signal(1);
  readonly modalOpen = signal(false);
  readonly modalMode = signal<ModalMode>('create');
  readonly editingId = signal<number | null>(null);
  readonly confirmDelete = signal<ServicoResponse | null>(null);
  readonly submitted = signal(false);

  readonly formatarDuracao = formatarDuracao;
  readonly formatarPreco = formatarPreco;

  readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    descricao: ['', [Validators.required, Validators.maxLength(500)]],
    duracaoMinutos: [30, [Validators.required, Validators.min(5)]],
    preco: [0, [Validators.required, Validators.min(0)]]
  });

  readonly filtrados = computed(() => {
    const termo = this.search().trim().toLowerCase();
    const lista = this.servicos();
    if (!termo) {
      return lista;
    }
    return lista.filter((servico) => {
      const nome = servico.nome?.toLowerCase() ?? '';
      const descricao = servico.descricao?.toLowerCase() ?? '';
      return nome.includes(termo) || descricao.includes(termo);
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
      return 'Mostrando 0 de 0 serviços';
    }
    const start = (this.paginaAtual() - 1) * this.pageSize + 1;
    const end = Math.min(this.paginaAtual() * this.pageSize, total);
    return `Mostrando ${start}–${end} de ${total} serviços`;
  });

  readonly modalTitle = computed(() => {
    switch (this.modalMode()) {
      case 'view':
        return 'Detalhes do serviço';
      case 'edit':
        return 'Editar serviço';
      default:
        return 'Novo serviço';
    }
  });

  readonly isViewMode = computed(() => this.modalMode() === 'view');

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.loading.set(true);
    this.servicoApi.listar().subscribe({
      next: (lista) => {
        this.servicos.set(lista);
        this.loading.set(false);
        this.garantirPaginaValida();
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Não foi possível carregar os serviços.');
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
      descricao: '',
      duracaoMinutos: 30,
      preco: 0
    });
    this.form.enable();
    this.modalOpen.set(true);
  }

  openView(servico: ServicoResponse): void {
    this.fillForm(servico);
    this.modalMode.set('view');
    this.form.disable();
    this.modalOpen.set(true);
  }

  openEdit(servico: ServicoResponse): void {
    this.fillForm(servico);
    this.modalMode.set('edit');
    this.form.enable();
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.submitted.set(false);
    this.form.enable();
  }

  askDelete(servico: ServicoResponse): void {
    this.confirmDelete.set(servico);
  }

  cancelDelete(): void {
    this.confirmDelete.set(null);
  }

  confirmDeleteAction(): void {
    const servico = this.confirmDelete();
    if (!servico) {
      return;
    }

    this.servicoApi.excluir(servico.id).subscribe({
      next: () => {
        this.confirmDelete.set(null);
        if (this.editingId() === servico.id) {
          this.closeModal();
        }
        this.toast.success('Serviço excluído.');
        this.carregar();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Não foi possível excluir o serviço.');
      }
    });
  }

  campoInvalido(nome: 'nome' | 'descricao' | 'duracaoMinutos' | 'preco'): boolean {
    const campo = this.form.controls[nome];
    return campo.invalid && (campo.touched || this.submitted());
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
    const payload: ServicoPayload = {
      nome: raw.nome.trim(),
      descricao: raw.descricao.trim(),
      duracaoMinutos: Number(raw.duracaoMinutos),
      preco: Number(raw.preco)
    };

    this.saving.set(true);
    const id = this.editingId();
    const request$ = id == null ? this.servicoApi.criar(payload) : this.servicoApi.atualizar(id, payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.toast.success(id == null ? 'Serviço cadastrado.' : 'Serviço atualizado.');
        this.carregar();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(err?.error?.message || 'Não foi possível salvar o serviço.');
      }
    });
  }

  private fillForm(servico: ServicoResponse): void {
    this.editingId.set(servico.id);
    this.submitted.set(false);
    this.form.reset({
      nome: servico.nome ?? '',
      descricao: servico.descricao ?? '',
      duracaoMinutos: servico.duracaoMinutos ?? 30,
      preco: Number(servico.preco) || 0
    });
  }

  private garantirPaginaValida(): void {
    if (this.page() > this.totalPaginas()) {
      this.page.set(this.totalPaginas());
    }
  }
}
