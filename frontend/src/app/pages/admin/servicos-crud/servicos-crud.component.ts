import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth.service';
import {
  ServicoPayload,
  ServicoResponse,
  ServicoService,
  formatarDuracao,
  formatarPreco
} from '../../../core/servico.service';

@Component({
  selector: 'app-servicos-crud',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './servicos-crud.component.html',
  styleUrl: './servicos-crud.component.scss'
})
export class ServicosCrudComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicoApi = inject(ServicoService);
  readonly auth = inject(AuthService);

  readonly servicos = signal<ServicoResponse[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly submitted = signal(false);

  readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(80)]],
    descricao: ['', [Validators.required, Validators.maxLength(500)]],
    duracaoMinutos: [30, [Validators.required, Validators.min(5)]],
    preco: [0, [Validators.required, Validators.min(0)]]
  });

  readonly formatarDuracao = formatarDuracao;
  readonly formatarPreco = formatarPreco;

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.servicoApi.listar().subscribe({
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

  editar(servico: ServicoResponse): void {
    this.editingId.set(servico.id);
    this.submitted.set(false);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.form.setValue({
      nome: servico.nome,
      descricao: servico.descricao,
      duracaoMinutos: servico.duracaoMinutos,
      preco: Number(servico.preco)
    });
  }

  cancelarEdicao(): void {
    this.editingId.set(null);
    this.submitted.set(false);
    this.form.reset({
      nome: '',
      descricao: '',
      duracaoMinutos: 30,
      preco: 0
    });
  }

  campoInvalido(nome: 'nome' | 'descricao' | 'duracaoMinutos' | 'preco'): boolean {
    const campo = this.form.controls[nome];
    return campo.invalid && (campo.touched || this.submitted());
  }

  salvar(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.form.invalid) {
      this.errorMessage.set('Preencha os campos corretamente.');
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
        this.successMessage.set(id == null ? 'Serviço cadastrado.' : 'Serviço atualizado.');
        this.cancelarEdicao();
        this.carregar();
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMessage.set(err?.error?.message || 'Não foi possível salvar o serviço.');
      }
    });
  }

  excluir(servico: ServicoResponse): void {
    const ok = window.confirm(`Excluir o serviço "${servico.nome}"?`);
    if (!ok) {
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.servicoApi.excluir(servico.id).subscribe({
      next: () => {
        if (this.editingId() === servico.id) {
          this.cancelarEdicao();
        }
        this.successMessage.set('Serviço excluído.');
        this.carregar();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Não foi possível excluir o serviço.');
      }
    });
  }
}
