import { Component, signal } from '@angular/core';
import { CadastroComponent } from './cadastro/cadastro.component';
import { CadastroResponse } from './cadastro/cadastro.model';
import { TransferenciaComponent } from './transferencia/transferencia.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CadastroComponent, TransferenciaComponent],
  template: `
    @if (cadastro(); as dados) {
      <app-transferencia [cadastro]="dados" (sair)="sairDaConta()" />
    } @else {
      <app-cadastro (cadastroPronto)="abrirConta($event)" />
    }
  `,
})
export class AppComponent {
  readonly cadastro = signal<CadastroResponse | null>(null);

  abrirConta(resposta: CadastroResponse): void {
    this.cadastro.set(resposta);
  }

  sairDaConta(): void {
    this.cadastro.set(null);
  }
}
