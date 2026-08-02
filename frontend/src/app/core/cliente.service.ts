import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type StatusCliente = 'ATIVO' | 'INATIVO';

export interface ClienteResponse {
  id: number;
  nome: string;
  telefone: string | null;
  email: string | null;
  dataNascimento: string | number[] | null;
  observacoes: string | null;
  status: StatusCliente;
  ultimoAgendamento: string | number[] | null;
  ultimoAgendamentoHorario: string | null;
}

export interface ClientePayload {
  nome: string;
  telefone: string;
  email: string;
  dataNascimento?: string | null;
  observacoes?: string;
  status?: StatusCliente;
}

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/clientes`;

  listar(): Observable<ClienteResponse[]> {
    return this.http.get<ClienteResponse[]>(this.baseUrl);
  }

  buscar(id: number): Observable<ClienteResponse> {
    return this.http.get<ClienteResponse>(`${this.baseUrl}/${id}`);
  }

  criar(payload: ClientePayload): Observable<ClienteResponse> {
    return this.http.post<ClienteResponse>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: ClientePayload): Observable<ClienteResponse> {
    return this.http.put<ClienteResponse>(`${this.baseUrl}/${id}`, payload);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

export function toDateInputValue(data: string | number[] | null | undefined): string {
  if (data == null || data === '') {
    return '';
  }

  if (Array.isArray(data) && data.length >= 3) {
    const [ano, mes, dia] = data;
    return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
  }

  if (typeof data === 'string') {
    return data.slice(0, 10);
  }

  return '';
}

export function formatarDataBr(data: string | number[] | null | undefined): string {
  const iso = toDateInputValue(data);
  if (!iso) {
    return '—';
  }
  const [ano, mes, dia] = iso.split('-');
  if (!ano || !mes || !dia) {
    return iso;
  }
  return `${dia}/${mes}/${ano}`;
}
