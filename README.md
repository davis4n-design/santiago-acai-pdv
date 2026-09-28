# Santiago PDV Express | Lanchonete 🍔⚡

Aplicação web e mobile moderna, ágil e intuitiva para controlo de pedidos, caixa diário e despesas de lanchonete (estilo PDV rápido com Dark Mode profissional).

---

## 🎨 Identidade Visual & Design
- **Tema Dark Mode profissional:** Fundos em `#0f172a` e `#1e293b`, cartões em `#334155` e fontes ultra legíveis (*Plus Jakarta Sans* e *JetBrains Mono*).
- **Cores de destaque:**
  - 🟢 **Verde Esmeralda (`#10b981`):** Valores positivos, totais e botões de confirmação.
  - 🟡 **Âmbar (`#f59e0b`):** Alertas, saldos pendentes e contas a receber (fiados).
  - 🟠 **Laranja (`#f97316`):** Botões de ação, delivery e plataformas.
- **Responsividade Total:** Desenvolvido com ergonomia táctil para telemóveis (botões de polegar no rodapé) e modo balcão para tablets/computadores.

---

## 📱 Ecrãs Principais

### A) NOVO PEDIDO (PDV Rápido - 3 Toques)
- **Alternador de Tipo em destaque:** `[ Delivery 🛵 ]` | `[ Balcão 🏪 ]`
- **Canais com botões grandes e ícones:**
  - Delivery: WhatsApp, iFood, 99Food.
  - Balcão: Atendimento presencial.
- **Bairros & Taxas automáticas:**
  - Bairros pré-configurados com base real: VAA (R$ 4), VP (R$ 4), ME (R$ 5), Centro (R$ 5), JD CPV (R$ 4), VMJ (R$ 7), PINUS (R$ 8), etc.
  - Preenchimento automático da taxa sugerida com ajuste manual (+ / -).
- **Valor dos Produtos & Total Dinâmico:**
  - Teclado numérico ágil e botões de atalho: `+10`, `+20`, `+30`, `+50`, `+80`.
  - Cálculo instantâneo do valor total em destaque verde esmeralda.
- **Formas de Pagamento em 1 Toque:**
  - PIX | Cartão Crédito | Cartão Débito | Dinheiro | A Receber / Fiado | Pago Online (iFood/99).
  - Opções inteligentes: cálculo de troco para dinheiro e seleção rápida de clientes para fiado.
- **Botão Fixo no Rodapé:** `[ REGISTAR PEDIDO ]` com efeitos de confetes, áudio sonoro agradável e limpeza imediata para o próximo cliente.

### B) FECHAMENTO DIÁRIO & DASHBOARD
- **4 Cards de KPIs Diários:**
  - 💰 Total Faturado Hoje (R$)
  - 📦 Quantidade de Pedidos
  - 💸 Total de Despesas do Dia (R$)
  - ✨ Lucro Líquido do Dia (Faturamento - Despesas)
- **Gráficos Visuais:**
  - Vendas por canal (WhatsApp vs iFood vs 99Food vs Balcão)
  - Vendas por forma de pagamento (PIX, cartões, dinheiro, fiado, online)
- **Painel para Registo Rápido de Despesas:**
  - Categorias: `Frios / Fatinha`, `Hortifrúti`, `Pães`, `Gás`, `Outros`.
  - Campo de valor e observação (ex.: "Nota 272").
- **Exportação Rápida:** Botão para copiar o resumo do fechamento formatado para enviar no WhatsApp da administração.

### C) FIADOS / CONTAS A RECEBER
- Lista e saldo pendente dos clientes e mensalistas (Adriano, Felipe, Hudson, Tio Naldo, Ana Rita, Sergio, etc.).
- Barra de pesquisa instantânea por nome.
- Botão rápido para **Dar Baixa / Quitar** (total ou parcial com forma de recebimento).
- Botão direto para enviar lembrete amigável no WhatsApp do cliente com 1 clique.

### D) HISTÓRICO DE PEDIDOS
- Lista cronológica reversa completa.
- Filtros rápidos por Data (Hoje, Ontem, Todos), Canal e Forma de Pagamento.
- Busca textual por ID, bairro ou observação.
- Visualização de **Comprovante Térmico Digital** para impressão ou envio ao cliente.

---

## ⚡ Integração com Google Sheets (API Pronta)

O aplicativo está configurado para o endpoint:
```
https://script.google.com/macros/s/AKfycbwc5AAEe_MLUJBet6vK7xsIEk-N1swPJ9QhvobDopDnIUFVabQlzoS3iorHerH7dCmSZg/exec
```

- **Operação Offline & Local First:** O PDV salva todos os dados no `localStorage` de forma instantânea, permitindo que a lanchonete nunca pare de vender mesmo se a internet cair.
- **Fila de Sincronização:** Os registros são enfileirados e sincronizados com a planilha.
- **Script Google Apps Script Completo:** O código do `Code.gs` está incluído diretamente no modal de configurações do aplicativo com botão para copiar com um clique.

---

## 🚀 Como Iniciar

1. Clique duas vezes no arquivo `iniciar_pdv.bat` na pasta do projeto.
2. O sistema abrirá automaticamente em:
   - **Computador local:** `http://localhost:3000`
   - **Telemóveis / Tablets na mesma rede:** `http://192.168.15.8:3000` (ou o IP local indicado no terminal).
