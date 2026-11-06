import { Injectable, signal } from '@angular/core';

/** Estado reativo da conta logada. Ajuste contaId/saldo inicial a partir da sua sessão/login. */
@Injectable({ providedIn: 'root' })
export class SaldoStore {
  readonly contaId = signal<number>(1);
  readonly saldo = signal<number>(1000);
  debitar(valor: number) { this.saldo.update(s => +(s - valor).toFixed(2)); }
}
