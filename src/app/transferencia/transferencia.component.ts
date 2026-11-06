import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ContaService } from '../core/conta.service';
import { TransferenciaService } from '../core/transferencia.service';
import { ApiErro, TransferenciaResponse } from '../core/transferencia.model';
import { CadastroResponse } from '../cadastro/cadastro.model';
import { BrlMaskDirective } from './brl-mask.directive';

@Component({
  selector: 'app-transferencia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BrlMaskDirective],
  templateUrl: './transferencia.component.html',
  styleUrl: './transferencia.component.css',
})
export class TransferenciaComponent implements OnInit {
  @Input({ required: true }) cadastro!: CadastroResponse;
  @Output() readonly sair = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private contasApi = inject(ContaService);
  private api = inject(TransferenciaService);

  readonly enviando = signal(false);
  readonly encerrando = signal(false);
  readonly erroEncerramento = signal<string | null>(null);
  readonly confirmarEncerramento = signal(false);
  readonly contaEncerrada = signal(false);
  readonly erro = signal<string | null>(null);
  readonly comprovante = signal<TransferenciaResponse | null>(null);
  readonly saldoDisponivel = signal(0);
  readonly senhaEncerramento = this.fb.nonNullable.control('', Validators.required);

  private readonly contasDiferentes: ValidatorFn = (control) => {
    const origem = control.get('contaOrigemId')?.value;
    const destino = control.get('contaDestinoId')?.value;
    return origem != null && destino != null && Number(origem) === Number(destino)
      ? { mesmaConta: true }
      : null;
  };

  readonly form = this.fb.group({
    contaOrigemId: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    contaDestinoId: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    valor: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
  }, { validators: this.contasDiferentes });

  ngOnInit(): void {
    this.saldoDisponivel.set(this.cadastro.conta.saldo);
    this.form.controls.contaOrigemId.setValue(this.cadastro.conta.id);
    this.form.controls.contaOrigemId.disable();
  }

  sairDaConta(): void {
    this.sair.emit();
  }

  solicitarEncerramento(): void {
    this.erroEncerramento.set(null);
    this.confirmarEncerramento.set(true);
  }

  cancelarEncerramento(): void {
    this.confirmarEncerramento.set(false);
    this.erroEncerramento.set(null);
    this.senhaEncerramento.reset();
  }

  encerrarConta(): void {
    if (this.encerrando() || this.contaEncerrada()) return;
    if (this.senhaEncerramento.invalid) {
      this.senhaEncerramento.markAsTouched();
      return;
    }

    this.erroEncerramento.set(null);
    this.encerrando.set(true);
    this.contasApi.encerrar(this.cadastro.conta.id, this.senhaEncerramento.value)
      .pipe(finalize(() => this.encerrando.set(false)))
      .subscribe({
        next: () => {
          this.confirmarEncerramento.set(false);
          this.senhaEncerramento.reset();
          this.contaEncerrada.set(true);
        },
        error: (error: HttpErrorResponse) => {
          const body = error.error as ApiErro | null;
          this.erroEncerramento.set(
            body?.mensagem ?? 'Não foi possível encerrar a conta. Tente novamente.'
          );
        },
      });
  }

  confirmar() {
    if (this.form.invalid || this.enviando() || this.contaEncerrada()) {
      this.form.markAllAsTouched();
      return;
    }
    this.erro.set(null);
    this.comprovante.set(null);
    const { contaOrigemId, contaDestinoId, valor } = this.form.getRawValue();
    if (contaOrigemId == null || contaDestinoId == null || valor == null) {
      this.erro.set('Preencha os IDs das contas e o valor da transferência.');
      return;
    }
    this.enviando.set(true);
    this.api.transferir({ contaOrigemId, contaDestinoId, valor })
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: (res) => {
          this.comprovante.set(res);
          this.saldoDisponivel.update(saldo => Number((saldo - res.valor).toFixed(2)));
          this.form.reset({
            contaOrigemId: this.cadastro.conta.id,
            contaDestinoId: null,
            valor: null,
          });
          this.form.controls.contaOrigemId.disable();
        },
        error: (e: HttpErrorResponse) => this.erro.set(this.mensagemErro(e)),
      });
  }

  private mensagemErro(e: HttpErrorResponse): string {
    const body = e.error as ApiErro | null;
    if (body?.erros) return Object.values(body.erros).join(' • ');
    if (body?.mensagem && /conta não encontrada/i.test(body.mensagem)) {
      const conta = body.mensagem.match(/conta de (origem|destino) não encontrada \(ID: (\d+)\)/i);
      if (conta) {
        return `A conta de ${conta[1]} com ID ${conta[2]} não foi encontrada. Confira se ela está cadastrada e use o ID, não o número da conta.`;
      }
      return 'Não encontramos uma conta com um dos IDs informados. Confirme se as duas contas estão cadastradas e use o ID, não o número da conta.';
    }
    if (e.status === 404) return 'Uma das contas não foi encontrada. Confira os IDs informados.';
    if (body?.mensagem) return body.mensagem;
    if (e.status === 0) return 'Não foi possível conectar ao servidor. Tente novamente.';
    return 'Não foi possível concluir a transferência.';
  }
}
