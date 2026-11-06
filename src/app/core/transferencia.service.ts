import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TransferenciaRequest, TransferenciaResponse } from './transferencia.model';

@Injectable({ providedIn: 'root' })
export class TransferenciaService {
  private http = inject(HttpClient);
  transferir(req: TransferenciaRequest): Observable<TransferenciaResponse> {
    return this.http.post<TransferenciaResponse>(`${environment.apiUrl}/transacoes/transferencia`, req);
  }
}
