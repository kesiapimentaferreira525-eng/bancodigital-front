import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CadastroRequest, CadastroResponse } from './cadastro.model';

@Injectable({ providedIn: 'root' })
export class CadastroService {
  private readonly http = inject(HttpClient);

  cadastrar(dados: CadastroRequest): Observable<CadastroResponse> {
    return this.http.post<CadastroResponse>(`${environment.apiUrl}/usuarios`, dados);
  }
}
