import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ServicoResponse {
  id: number;
  nome: string;
  descricao: string;
  duracaoMinutos: number;
  preco: number;
}

export interface ServicoPayload {
  nome: string;
  descricao: string;
  duracaoMinutos: number;
  preco: number;
}

@Injectable({ providedIn: 'root' })
export class ServicoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/servicos`;

  listar(): Observable<ServicoResponse[]> {
    return this.http.get<ServicoResponse[]>(this.baseUrl);
  }

  criar(payload: ServicoPayload): Observable<ServicoResponse> {
    return this.http.post<ServicoResponse>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: ServicoPayload): Observable<ServicoResponse> {
    return this.http.put<ServicoResponse>(`${this.baseUrl}/${id}`, payload);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

export function formatarDuracao(minutos: number): string {
  if (minutos < 60) {
    return `${minutos} min`;
  }
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (resto === 0) {
    return horas === 1 ? '1h' : `${horas}h`;
  }
  return `${horas}h ${resto}min`;
}

export function formatarPreco(preco: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(preco);
}
