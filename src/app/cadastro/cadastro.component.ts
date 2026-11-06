import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { CadastroApiError, CadastroRequest, CadastroResponse } from './cadastro.model';
import { CadastroService } from './cadastro.service';

function cpfValido(control: AbstractControl): ValidationErrors | null {
  const cpf = String(control.value ?? '').replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return { cpfInvalido: true };

  const calcularDigito = (base: string, pesoInicial: number): number => {
    const soma = [...base].reduce((total, digito, indice) => (
      total + Number(digito) * (pesoInicial - indice)
    ), 0);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const primeiroDigito = calcularDigito(cpf.slice(0, 9), 10);
  const segundoDigito = calcularDigito(cpf.slice(0, 10), 11);
  return Number(cpf[9]) === primeiroDigito && Number(cpf[10]) === segundoDigito
    ? null
    : { cpfInvalido: true };
}

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.css',
})
export class CadastroComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CadastroService);

  @Output() readonly cadastroPronto = new EventEmitter<CadastroResponse>();
  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly cadastroConcluido = signal<CadastroResponse | null>(null);
  readonly mostrarSenha = signal(false);

  readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    cpf: ['', [Validators.required, cpfValido]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    telefone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(16)]],
    senha: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
    agencia: ['', [Validators.required, Validators.pattern(/^\d{1,4}$/)]],
    tipoConta: this.fb.nonNullable.control<'corrente' | 'poupanca'>('corrente'),
    chavePix: ['', [Validators.maxLength(120)]],
  });

  formatarCpf(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digitos = input.value.replace(/\D/g, '').slice(0, 11);
    const formatado = digitos
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    this.form.controls.cpf.setValue(formatado, { emitEvent: false });
  }

  formatarTelefone(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digitos = input.value.replace(/\D/g, '').slice(0, 11);
    const formatado = digitos.length > 10
      ? digitos.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
      : digitos.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    this.form.controls.telefone.setValue(formatado, { emitEvent: false });
  }

  alternarVisibilidadeSenha(): void {
    this.mostrarSenha.update(visivel => !visivel);
  }

  cadastrar(): void {
    if (this.form.invalid || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.erro.set(null);
    this.cadastroConcluido.set(null);
    const dados = this.form.getRawValue();
    const payload: CadastroRequest = {
      nome: dados.nome.trim(),
      cpf: dados.cpf.replace(/\D/g, ''),
      email: dados.email.trim(),
      telefone: dados.telefone.replace(/\D/g, ''),
      senha: dados.senha,
      conta: {
        agencia: dados.agencia,
        tipo: dados.tipoConta,
        chavePix: dados.chavePix.trim() || null,
      },
    };

    this.enviando.set(true);
    this.api.cadastrar(payload)
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: (resposta) => {
          this.cadastroConcluido.set(resposta);
          this.cadastroPronto.emit(resposta);
        },
        error: (error: HttpErrorResponse) => this.erro.set(this.mensagemErro(error)),
      });
  }

  novoCadastro(): void {
    this.cadastroConcluido.set(null);
    this.erro.set(null);
    this.mostrarSenha.set(false);
    this.form.reset({ tipoConta: 'corrente' });
  }

  private mensagemErro(error: HttpErrorResponse): string {
    const body = error.error as CadastroApiError | null;
    if (body?.erros) return Object.values(body.erros).join(' • ');
    if (body?.mensagem) return body.mensagem;
    if (error.status === 0) return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
    if (error.status === 409) return 'Já existe um cadastro com esses dados. Confira o CPF e tente novamente.';
    return 'Não foi possível concluir o cadastro. Confira os dados e tente novamente.';
  }
}
