import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BarbeiroResponse {
  id: number;
  nome: string;
  especialidade: string;
  bio: string;
}

export interface BarbeiroPayload {
  nome: string;
  especialidade: string;
  bio: string;
}

@Injectable({ providedIn: 'root' })
export class BarbeiroService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/barbeiros`;

  listar(): Observable<BarbeiroResponse[]> {
    return this.http.get<BarbeiroResponse[]>(this.baseUrl);
  }

  criar(payload: BarbeiroPayload): Observable<BarbeiroResponse> {
    return this.http.post<BarbeiroResponse>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: BarbeiroPayload): Observable<BarbeiroResponse> {
    return this.http.put<BarbeiroResponse>(`${this.baseUrl}/${id}`, payload);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
