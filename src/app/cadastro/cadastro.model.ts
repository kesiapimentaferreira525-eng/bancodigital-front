export type TipoConta = 'corrente' | 'poupanca';

export interface CadastroRequest {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  senha: string;
  conta: {
    agencia: string;
    tipo: TipoConta;
    chavePix: string | null;
  };
}

export interface CadastroResponse {
  usuario: {
    id: number;
    nome: string;
  };
  conta: {
    id: number;
    agencia: string;
    numero: string;
    tipo: string;
    saldo: number;
    limiteConta: number;
  };
  demonstracao: {
    limiteCredito: number;
    faturaAtual: number;
    cartaoFinal: string;
    chavePix: string;
    dadosFicticios: boolean;
  };
}

export interface CadastroApiError {
  mensagem?: string;
  erros?: Record<string, string>;
}
