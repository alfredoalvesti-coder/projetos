import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  BarbeiroPayload,
  BarbeiroResponse,
  BarbeiroService
} from '../../../core/barbeiro.service';

@Component({
  selector: 'app-barbeiros-crud',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './barbeiros-crud.component.html',
  styleUrl: './barbeiros-crud.component.scss'
})
export class BarbeirosCrudComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly barbeiroApi = inject(BarbeiroService);

  readonly barbeiros = signal<BarbeiroResponse[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly submitted = signal(false);

  readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(80)]],
    especialidade: ['', [Validators.required, Validators.maxLength(120)]],
    bio: ['', [Validators.required, Validators.maxLength(500)]]
  });

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.barbeiroApi.listar().subscribe({
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

  editar(barbeiro: BarbeiroResponse): void {
    this.editingId.set(barbeiro.id);
    this.submitted.set(false);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.form.setValue({
      nome: barbeiro.nome,
      especialidade: barbeiro.especialidade,
      bio: barbeiro.bio
    });
  }

  cancelarEdicao(): void {
    this.editingId.set(null);
    this.submitted.set(false);
    this.form.reset({
      nome: '',
      especialidade: '',
      bio: ''
    });
  }

  campoInvalido(nome: 'nome' | 'especialidade' | 'bio'): boolean {
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
    const payload: BarbeiroPayload = {
      nome: raw.nome.trim(),
      especialidade: raw.especialidade.trim(),
      bio: raw.bio.trim()
    };

    this.saving.set(true);
    const id = this.editingId();
    const request$ = id == null ? this.barbeiroApi.criar(payload) : this.barbeiroApi.atualizar(id, payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set(id == null ? 'Barbeiro cadastrado.' : 'Barbeiro atualizado.');
        this.cancelarEdicao();
        this.carregar();
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMessage.set(err?.error?.message || 'Não foi possível salvar o barbeiro.');
      }
    });
  }

  excluir(barbeiro: BarbeiroResponse): void {
    const ok = window.confirm(`Excluir o barbeiro "${barbeiro.nome}"?`);
    if (!ok) {
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.barbeiroApi.excluir(barbeiro.id).subscribe({
      next: () => {
        if (this.editingId() === barbeiro.id) {
          this.cancelarEdicao();
        }
        this.successMessage.set('Barbeiro excluído.');
        this.carregar();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Não foi possível excluir o barbeiro.');
      }
    });
  }
}
