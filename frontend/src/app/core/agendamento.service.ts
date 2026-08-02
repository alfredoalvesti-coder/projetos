import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CreateAgendamentoPayload {
  servico: string;
  barbeiro: string;
  data: string;
  horario: string;
  observacao?: string;
}

export interface AdminAgendamentoPayload {
  clienteId: number;
  servico: string;
  barbeiro: string;
  data: string;
  horario: string;
  observacao?: string;
  status?: StatusAgendamento;
}

export type StatusAgendamento = 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO';

export interface AgendamentoResponse {
  id: number;
  clienteId?: number;
  clienteNome?: string;
  clienteTelefone?: string | null;
  servico: string;
  barbeiro: string;
  data: string;
  horario: string;
  observacao: string | null;
  status: StatusAgendamento;
  criadoEm: string;
}

@Injectable({ providedIn: 'root' })
export class AgendamentoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/agendamentos`;

  criar(payload: CreateAgendamentoPayload): Observable<AgendamentoResponse> {
    return this.http.post<AgendamentoResponse>(this.baseUrl, payload);
  }

  meus(): Observable<AgendamentoResponse[]> {
    return this.http.get<AgendamentoResponse[]>(`${this.baseUrl}/me`);
  }

  listarAdmin(): Observable<AgendamentoResponse[]> {
    return this.http.get<AgendamentoResponse[]>(this.baseUrl);
  }

  criarAdmin(payload: AdminAgendamentoPayload): Observable<AgendamentoResponse> {
    return this.http.post<AgendamentoResponse>(`${this.baseUrl}/admin`, payload);
  }

  atualizarAdmin(id: number, payload: AdminAgendamentoPayload): Observable<AgendamentoResponse> {
    return this.http.put<AgendamentoResponse>(`${this.baseUrl}/admin/${id}`, payload);
  }

  cancelarAdmin(id: number): Observable<AgendamentoResponse> {
    return this.http.post<AgendamentoResponse>(`${this.baseUrl}/admin/${id}/cancelar`, {});
  }

  horariosOcupados(barbeiro: string, data: string, ignoreId?: number): Observable<string[]> {
    let params = new HttpParams().set('barbeiro', barbeiro).set('data', data);
    if (ignoreId != null) {
      params = params.set('ignoreId', String(ignoreId));
    }
    return this.http.get<string[]>(`${this.baseUrl}/horarios-ocupados`, { params });
  }

  atualizar(id: number, payload: CreateAgendamentoPayload): Observable<AgendamentoResponse> {
    return this.http.put<AgendamentoResponse>(`${this.baseUrl}/${id}`, payload);
  }

  cancelar(id: number): Observable<AgendamentoResponse> {
    return this.http.post<AgendamentoResponse>(`${this.baseUrl}/${id}/cancelar`, {});
  }
}

export function statusAgendamentoLabel(status: StatusAgendamento): string {
  switch (status) {
    case 'CONFIRMADO':
      return 'Confirmado';
    case 'CANCELADO':
      return 'Cancelado';
    default:
      return 'Pendente';
  }
}
