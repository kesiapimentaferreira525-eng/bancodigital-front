# Banco Digital — interface Angular

Interface Angular 18 para o protótipo demonstrativo Banco Digital. O projeto de backend e o guia completo da aplicação ficam no diretório irmão `bancodigital`; consulte [`../bancodigital/README.md`](../bancodigital/README.md) para configuração do MySQL, API, fluxos, limitações e instruções completas.

## Executar no Windows

Pré-requisitos: Node.js 20 LTS e a API Java iniciada na porta `8081`.

No PowerShell, na pasta deste projeto:

```powershell
npm install
npm start
```

Abra `http://localhost:4200`. O proxy em `proxy.conf.json` encaminha as chamadas `/api` para `http://localhost:8081`.

## Fluxos da interface

- Cadastro de cliente e conta; após a resposta da API, o painel da conta recém-criada é exibido.
- Visualização de saldo e dados fictícios de Pix e cartão.
- Transferências de demonstração usando o ID interno das contas.
- Encerramento lógico da conta com confirmação da senha.
- Opção **Sair**, que retorna ao cadastro sem apagar nem encerrar a conta no banco.

O painel é mantido em memória no navegador e ainda não há autenticação para entrar novamente em uma conta existente. Esta interface é apenas demonstrativa e não realiza operações financeiras reais.

## Build

```powershell
npm run build
```
