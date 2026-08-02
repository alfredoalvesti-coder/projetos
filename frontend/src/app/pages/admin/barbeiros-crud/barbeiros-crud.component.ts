import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucideEye,
  LucidePencil,
  LucidePlus,
  LucideSearch,
  LucideTrash2,
  LucideUser,
  LucideX
} from '@lucide/angular';
import {
  BarbeiroPayload,
  BarbeiroResponse,
  BarbeiroService
} from '../../../core/barbeiro.service';
import { ToastService } from '../../../core/toast.service';

type ModalMode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-barbeiros-crud',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    LucidePlus,
    LucideSearch,
    LucideUser,
    LucideEye,
    LucidePencil,
    LucideTrash2,
    LucideX
  ],
  templateUrl: './barbeiros-crud.component.html',
  styleUrl: './barbeiros-crud.component.scss'
})
export class BarbeirosCrudComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly barbeiroApi = inject(BarbeiroService);
  private readonly toast = inject(ToastService);

  readonly pageSize = 10;

  readonly barbeiros = signal<BarbeiroResponse[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly search = signal('');
  readonly page = signal(1);
  readonly modalOpen = signal(false);
  readonly modalMode = signal<ModalMode>('create');
  readonly editingId = signal<number | null>(null);
  readonly confirmDelete = signal<BarbeiroResponse | null>(null);
  readonly submitted = signal(false);

  readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    telefone: ['', [Validators.required, Validators.maxLength(30)]],
    especialidade: ['', [Validators.required, Validators.maxLength(120)]],
    bio: ['', [Validators.required, Validators.maxLength(500)]]
  });

  readonly filtrados = computed(() => {
    const termo = this.search().trim().toLowerCase();
    const lista = this.barbeiros();
    if (!termo) {
      return lista;
    }
    return lista.filter((barbeiro) => {
      const nome = barbeiro.nome?.toLowerCase() ?? '';
      const especialidade = barbeiro.especialidade?.toLowerCase() ?? '';
      const bio = barbeiro.bio?.toLowerCase() ?? '';
      const telefone = (barbeiro.telefone ?? '').replace(/\D/g, '');
      const termoDigitos = termo.replace(/\D/g, '');
      return (
        nome.includes(termo) ||
        especialidade.includes(termo) ||
        bio.includes(termo) ||
        (termoDigitos.length > 0 && telefone.includes(termoDigitos)) ||
        (barbeiro.telefone ?? '').toLowerCase().includes(termo)
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
      return 'Mostrando 0 de 0 barbeiros';
    }
    const start = (this.paginaAtual() - 1) * this.pageSize + 1;
    const end = Math.min(this.paginaAtual() * this.pageSize, total);
    return `Mostrando ${start}–${end} de ${total} barbeiros`;
  });

  readonly modalTitle = computed(() => {
    switch (this.modalMode()) {
      case 'view':
        return 'Detalhes do barbeiro';
      case 'edit':
        return 'Editar barbeiro';
      default:
        return 'Novo barbeiro';
    }
  });

  readonly isViewMode = computed(() => this.modalMode() === 'view');

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.loading.set(true);
    this.barbeiroApi.listar().subscribe({
      next: (lista) => {
        this.barbeiros.set(lista);
        this.loading.set(false);
        this.garantirPaginaValida();
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Não foi possível carregar os barbeiros.');
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
      especialidade: '',
      bio: ''
    });
    this.form.enable();
    this.modalOpen.set(true);
  }

  openView(barbeiro: BarbeiroResponse): void {
    this.fillForm(barbeiro);
    this.modalMode.set('view');
    this.form.disable();
    this.modalOpen.set(true);
  }

  openEdit(barbeiro: BarbeiroResponse): void {
    this.fillForm(barbeiro);
    this.modalMode.set('edit');
    this.form.enable();
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.submitted.set(false);
    this.form.enable();
  }

  askDelete(barbeiro: BarbeiroResponse): void {
    this.confirmDelete.set(barbeiro);
  }

  cancelDelete(): void {
    this.confirmDelete.set(null);
  }

  confirmDeleteAction(): void {
    const barbeiro = this.confirmDelete();
    if (!barbeiro) {
      return;
    }

    this.barbeiroApi.excluir(barbeiro.id).subscribe({
      next: () => {
        this.confirmDelete.set(null);
        if (this.editingId() === barbeiro.id) {
          this.closeModal();
        }
        this.toast.success('Barbeiro excluído.');
        this.carregar();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Não foi possível excluir o barbeiro.');
      }
    });
  }

  campoInvalido(nome: 'nome' | 'telefone' | 'especialidade' | 'bio'): boolean {
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
    const payload: BarbeiroPayload = {
      nome: raw.nome.trim(),
      telefone: raw.telefone.trim(),
      especialidade: raw.especialidade.trim(),
      bio: raw.bio.trim()
    };

    this.saving.set(true);
    const id = this.editingId();
    const request$ = id == null ? this.barbeiroApi.criar(payload) : this.barbeiroApi.atualizar(id, payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.toast.success(id == null ? 'Barbeiro cadastrado.' : 'Barbeiro atualizado.');
        this.carregar();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(err?.error?.message || 'Não foi possível salvar o barbeiro.');
      }
    });
  }

  initials(nome: string): string {
    return nome
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  private fillForm(barbeiro: BarbeiroResponse): void {
    this.editingId.set(barbeiro.id);
    this.submitted.set(false);
    this.form.reset({
      nome: barbeiro.nome ?? '',
      telefone: barbeiro.telefone ?? '',
      especialidade: barbeiro.especialidade ?? '',
      bio: barbeiro.bio ?? ''
    });
  }

  private garantirPaginaValida(): void {
    if (this.page() > this.totalPaginas()) {
      this.page.set(this.totalPaginas());
    }
  }
}
