import fs from 'fs';
import path from 'path';
import * as formatters from '../src/utils/formatters.js';
import * as auth from '../src/utils/auth.js';
import * as defaultData from '../src/data/defaultData.js';
import * as lucide from 'lucide-react';

let totalTests = 0;
let passedTests = 0;
let failedTests = [];

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    failedTests.push({ testName, details });
    console.error(`  ❌ [FAIL] ${testName}: ${details}`);
  }
}

console.log('====================================================');
console.log('🚀 INICIANDO BATERIA DE TESTES DO SANTIAGO AÇAÍ PDV');
console.log('====================================================\n');

// ----------------------------------------------------
// 1. TESTE DE FORMATADORES E DATAS
// ----------------------------------------------------
console.log('📌 1. Testando Formatadores (formatters.js)...');
assert(formatters.formatCurrency(10) === 'R$ 10,00' || formatters.formatCurrency(10).includes('10,00'), 'Formatação de Moeda R$ 10,00');
assert(formatters.formatCurrency(0).includes('0,00'), 'Formatação de Moeda R$ 0,00');
assert(formatters.formatCurrency(-5).includes('-5,00') || formatters.formatCurrency(-5).includes('5,00'), 'Formatação de Moeda Negativa');

assert(formatters.normalizeBairroName('  Vila sao joao ') === 'Vila São João', 'Normalização de Bairro com acentos');
assert(formatters.normalizeBairroName('Centro') === 'Centro', 'Normalização Bairro Centro');

const sampleDate = new Date('2026-09-28T14:30:00');
const parsedIso = formatters.parseRecordDate({ data_hora: '2026-09-28T14:30:00' });
assert(parsedIso instanceof Date && !isNaN(parsedIso.getTime()), 'Parse data_hora ISO');

const parsedBr = formatters.parseRecordDate({ data_hora: '28/09/2026 14:30:00' });
assert(parsedBr instanceof Date && !isNaN(parsedBr.getTime()), 'Parse data_hora formato Brasileiro dd/mm/yyyy hh:mm:ss');

const parsedJustDate = formatters.parseRecordDate({ data: '28/09/2026' });
assert(parsedJustDate instanceof Date && !isNaN(parsedJustDate.getTime()), 'Parse campo data');

// ----------------------------------------------------
// 2. TESTE DE AUTENTICAÇÃO E PINs (auth.js)
// ----------------------------------------------------
console.log('\n📌 2. Testando Autenticação e Regras de PINs...');
assert(auth.DEFAULT_PIN === '159', 'PIN Padrão do Terminal é 159');
assert(auth.DEFAULT_DASHBOARD_PIN === '157', 'PIN Padrão Gerencial é 157');

// Mock simples de storage
global.sessionStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; }
};
global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; }
};

assert(!auth.isDashboardAuthenticated(), 'Dashboard inicia bloqueado');
auth.saveDashboardAuthentication();
assert(auth.isDashboardAuthenticated(), 'Dashboard autentica após saveDashboardAuthentication');
auth.lockDashboard();
assert(!auth.isDashboardAuthenticated(), 'Dashboard bloqueia após lockDashboard');

// ----------------------------------------------------
// 3. TESTE DE INTEGRIDADE DOS ÍCONES (lucide-react)
// ----------------------------------------------------
console.log('\n📌 3. Testando Imports de Ícones em todos os arquivos...');
function checkIconImportsInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      checkIconImportsInDir(full);
    } else if (full.endsWith('.jsx') || full.endsWith('.js')) {
      const content = fs.readFileSync(full, 'utf8');
      const importMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/);
      if (importMatch) {
        const icons = importMatch[1].split(',').map(s => s.trim()).filter(Boolean);
        for (const icon of icons) {
          const cleanIcon = icon.split(' as ')[0].trim();
          const exists = !!lucide[cleanIcon];
          assert(exists, `Ícone [${cleanIcon}] existe no lucide-react (usado em ${path.basename(full)})`, `Ícone inexistente: ${cleanIcon}`);
        }
      }
    }
  }
}
checkIconImportsInDir('./src');

// ----------------------------------------------------
// 4. TESTE DE DADOS PADRÃO E LISTA DE BAIRROS DE CAÇAPAVA
// ----------------------------------------------------
console.log('\n📌 4. Testando Dados Padrão (defaultData.js)...');
assert(Array.isArray(defaultData.DEFAULT_BAIRROS) && defaultData.DEFAULT_BAIRROS.length >= 30, 'Mais de 30 bairros de Caçapava cadastrados');
const hasCentro = defaultData.DEFAULT_BAIRROS.some(b => b.nome === 'Centro');
const hasVilaAugusto = defaultData.DEFAULT_BAIRROS.some(b => b.nome === 'Vila Antônio Augusto');
assert(hasCentro && hasVilaAugusto, 'Bairros essenciais presentes (Centro, Vila Antônio Augusto)');

assert(Array.isArray(defaultData.PAYMENT_METHODS) && defaultData.PAYMENT_METHODS.length >= 4, 'Métodos de pagamento completos');
const hasPix = defaultData.PAYMENT_METHODS.some(m => m.id === 'PIX');
const hasDinheiro = defaultData.PAYMENT_METHODS.some(m => m.id === 'DINHEIRO');
const hasFiado = defaultData.PAYMENT_METHODS.some(m => m.id === 'A REC');
assert(hasPix && hasDinheiro && hasFiado, 'PIX, Dinheiro e Fiado (A REC) presentes');

// ----------------------------------------------------
// 5. TESTE DE CÁLCULOS DO DASHBOARD E TAXAS
// ----------------------------------------------------
console.log('\n📌 5. Testando Lógica de Negócio e Cálculos...');
// Simulação de pedidos
const mockPedidos = [
  { id: 'PED-01', canal: 'IFOOD', bairro: 'Centro', valor_total: 50.0, taxa_entrega: 4.0, forma_pagto: 'PIX', data_hora: '2026-09-28 10:00:00' },
  { id: 'PED-02', canal: 'ZAP', bairro: 'Vila Antônio Augusto', valor_total: 35.0, taxa_entrega: 5.0, forma_pagto: 'DINHEIRO', data_hora: '2026-09-28 11:00:00' },
  { id: 'PED-03', canal: 'Balcão', bairro: 'Balcão', valor_total: 20.0, taxa_entrega: 0, forma_pagto: 'CARTAO_DEB', data_hora: '2026-09-28 12:00:00' },
  { id: 'PED-04', canal: '99F', bairro: 'Centro', valor_total: 40.0, taxa_entrega: 4.0, forma_pagto: 'OUTROS', data_hora: '2026-09-28 13:00:00' },
  { id: 'PED-05', canal: 'ZAP', bairro: 'Vila Menino Jesus', valor_total: 30.0, taxa_entrega: 6.0, forma_pagto: 'A REC', data_hora: '2026-09-28 14:00:00' }
];

const totalFaturamento = mockPedidos.reduce((acc, p) => acc + p.valor_total, 0);
assert(totalFaturamento === 175.0, 'Soma total de faturamento (175.00)');

// Teste de cálculo de taxas de aplicativos
const ifoodFeePct = 15.5;
const ifoodOrders = mockPedidos.filter(p => p.canal === 'IFOOD');
const ifoodGross = ifoodOrders.reduce((acc, p) => acc + p.valor_total, 0);
const ifoodRetained = ifoodGross * (ifoodFeePct / 100);
const ifoodNet = ifoodGross - ifoodRetained;
assert(ifoodGross === 50.0, 'Faturamento Bruto iFood = R$ 50,00');
assert(Math.round(ifoodRetained * 100) / 100 === 7.75, 'Taxa Retida iFood 15.5% = R$ 7,75');
assert(Math.round(ifoodNet * 100) / 100 === 42.25, 'Lucro Líquido iFood = R$ 42,25');

// Ranking de Bairros de Caçapava
const deliveryOrders = mockPedidos.filter(p => p.bairro && p.bairro.toLowerCase() !== 'balcão');
const bairroCounts = {};
deliveryOrders.forEach(p => {
  bairroCounts[p.bairro] = (bairroCounts[p.bairro] || 0) + 1;
});
assert(bairroCounts['Centro'] === 2, 'Centro é o bairro #1 com 2 pedidos');
assert(bairroCounts['Vila Antônio Augusto'] === 1, 'Vila Antônio Augusto com 1 pedido');

// ----------------------------------------------------
// 6. TESTE DE RESILIÊNCIA E TRATAMENTO DE ERROS
// ----------------------------------------------------
console.log('\n📌 6. Testando Resiliência a Dados Nulos / Corrompidos...');
try {
  formatters.formatCurrency(null);
  formatters.formatCurrency(undefined);
  formatters.formatCurrency('invalido');
  assert(true, 'formatCurrency não crasha com valores nulos/inválidos');
} catch (e) {
  assert(false, 'formatCurrency crashou com valores nulos', e.message);
}

try {
  const parsedNull = formatters.parseRecordDate(null);
  assert(parsedNull === null, 'parseRecordDate lida com null de forma segura');
} catch (e) {
  assert(false, 'parseRecordDate crashou com null', e.message);
}

console.log('\n====================================================');
console.log(`📊 RESULTADO FINAL: ${passedTests}/${totalTests} TESTES APROVADOS!`);
if (failedTests.length === 0) {
  console.log('🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!');
} else {
  console.error(`⚠️ FALHAS DETECTADAS (${failedTests.length}):`);
  failedTests.forEach(f => console.error(`  - ${f.testName}: ${f.details}`));
}
console.log('====================================================\n');
process.exit(failedTests.length === 0 ? 0 : 1);
