import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ContaService {
  private readonly http = inject(HttpClient);

  encerrar(contaId: number, senha: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/contas/${contaId}/encerramento`, { senha });
  }
}
