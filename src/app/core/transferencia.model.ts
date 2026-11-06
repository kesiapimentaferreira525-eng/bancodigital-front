export interface TransferenciaRequest { contaOrigemId: number; contaDestinoId: number; valor: number; }
export interface TransferenciaResponse {
  transacaoId: number; contaOrigemId: number; contaDestinoId: number;
  beneficiarioNome: string; numeroContaDestino: string;
  valor: number; status: string; dataHora: string;
}
export interface ApiErro { timestamp: string; status: number; erro: string; mensagem: string; erros?: Record<string, string>; }
