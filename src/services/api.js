import { INITIAL_FIADOS, INITIAL_PEDIDOS, INITIAL_DESPESAS, DEFAULT_BAIRROS } from '../data/defaultData';
import { normalizeBairroName } from '../utils/formatters';

export const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbzKtXmOAnGqrfCQadLVCDY94vY1B_xYxB-htrGo1J17IDc95Vb62j70W4jyTCR0lP7W/exec';

const STORAGE_KEYS = {
  API_URL: 'santiago_api_url',
  PEDIDOS: 'santiago_pedidos',
  DESPESAS: 'santiago_despesas',
  FIADOS: 'santiago_fiados',
  SYNC_QUEUE: 'santiago_sync_queue',
  LAST_SYNC: 'santiago_last_sync',
  PLATFORM_FEES: 'santiago_platform_fees',
  SHEETS_VIEW_URL: 'santiago_sheets_view_url',
  BAIRROS: 'santiago_bairros',
  DELETED_ORDER_IDS: 'santiago_deleted_order_ids'
};

export function getDeletedOrderIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_ORDER_IDS);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function markOrderAsDeleted(id) {
  try {
    const set = getDeletedOrderIds();
    set.add(String(id));
    localStorage.setItem(STORAGE_KEYS.DELETED_ORDER_IDS, JSON.stringify(Array.from(set)));
  } catch {
    //
  }
}

export const DEFAULT_SHEETS_VIEW_URL = 'https://docs.google.com/spreadsheets/d/1I7UmxcCv3qcTYVJYO--_IAK0CEfMl-9Ar_h6Zgwm2Z8/edit?usp=sharing';

export function convertToPreviewUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.includes('docs.google.com/spreadsheets/d/')) {
    // Converte /edit para /preview para carregar no modo visualização limpo
    return trimmed.replace(/\/edit([?#].*)?$/, '/preview');
  }
  return trimmed;
}

export function getSheetsViewUrl() {
  return localStorage.getItem(STORAGE_KEYS.SHEETS_VIEW_URL) || DEFAULT_SHEETS_VIEW_URL;
}

export function setSheetsViewUrl(url) {
  if (url && url.trim()) {
    localStorage.setItem(STORAGE_KEYS.SHEETS_VIEW_URL, url.trim());
  } else {
    localStorage.removeItem(STORAGE_KEYS.SHEETS_VIEW_URL);
  }
}

export const DEFAULT_PLATFORM_FEES = {
  IFOOD: 15.5,
  '99F': 15.5,
  ZAP: 0.0,
  Balcão: 0.0
};

export function getPlatformFees() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PLATFORM_FEES);
    if (saved) return JSON.parse(saved);
  } catch {
    // fallback
  }
  return DEFAULT_PLATFORM_FEES;
}

export function savePlatformFees(fees) {
  localStorage.setItem(STORAGE_KEYS.PLATFORM_FEES, JSON.stringify(fees));
}

// Bairros de Caçapava e Taxas de Entrega
export function getBairrosCadastrados() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.BAIRROS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const map = new Map();
        parsed.forEach(b => {
          const nomeNorm = normalizeBairroName(b.nome);
          map.set(nomeNorm, { nome: nomeNorm, taxa: parseFloat(b.taxa) || 0 });
        });
        DEFAULT_BAIRROS.forEach(b => {
          if (!map.has(b.nome)) {
            map.set(b.nome, b);
          }
        });
        return Array.from(map.values()).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_BAIRROS;
}

export function saveBairrosCadastrados(bairros) {
  localStorage.setItem(STORAGE_KEYS.BAIRROS, JSON.stringify(bairros));
}

export function resetBairrosPadrao() {
  localStorage.setItem(STORAGE_KEYS.BAIRROS, JSON.stringify(DEFAULT_BAIRROS));
  return DEFAULT_BAIRROS;
}

export function getApiUrl() {
  const saved = localStorage.getItem(STORAGE_KEYS.API_URL);
  if (saved && saved.trim()) {
    return saved.trim();
  }
  return DEFAULT_API_URL;
}

export function setApiUrl(url) {
  if (url && url.trim()) {
    localStorage.setItem(STORAGE_KEYS.API_URL, url.trim());
  } else {
    localStorage.removeItem(STORAGE_KEYS.API_URL);
  }
}

// Inicializa dados no localStorage se vazios
export function initializeLocalStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.PEDIDOS)) {
    localStorage.setItem(STORAGE_KEYS.PEDIDOS, JSON.stringify(INITIAL_PEDIDOS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DESPESAS)) {
    localStorage.setItem(STORAGE_KEYS.DESPESAS, JSON.stringify(INITIAL_DESPESAS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FIADOS)) {
    localStorage.setItem(STORAGE_KEYS.FIADOS, JSON.stringify(INITIAL_FIADOS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE)) {
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
  }
}

// Carregar dados locais
export function getLocalData() {
  initializeLocalStorage();
  const pedidos = JSON.parse(localStorage.getItem(STORAGE_KEYS.PEDIDOS) || '[]');
  const despesas = JSON.parse(localStorage.getItem(STORAGE_KEYS.DESPESAS) || '[]');
  const fiados = JSON.parse(localStorage.getItem(STORAGE_KEYS.FIADOS) || '[]');
  const syncQueue = JSON.parse(localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE) || '[]');
  const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);

  return { pedidos, despesas, fiados, syncQueue, lastSync };
}

// Salvar dados locais
export function saveLocalData({ pedidos, despesas, fiados }) {
  if (pedidos) localStorage.setItem(STORAGE_KEYS.PEDIDOS, JSON.stringify(pedidos));
  if (despesas) localStorage.setItem(STORAGE_KEYS.DESPESAS, JSON.stringify(despesas));
  if (fiados) localStorage.setItem(STORAGE_KEYS.FIADOS, JSON.stringify(fiados));
}

// Helper para timeout no fetch (35 segundos para cobrir cold-start do Google Apps Script)
async function fetchWithTimeout(resource, options = {}, timeoutMs = 35000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// GET: Carregar dados remotos do Google Sheets
export async function fetchRemoteData() {
  const url = getApiUrl();
  try {
    // Requisição padrão sem headers customizados para garantir suporte total a CORS e redirects
    const response = await fetchWithTimeout(`${url}?action=get_all`, {
      method: 'GET',
      redirect: 'follow'
    }, 35000);

    const contentType = response.headers.get('content-type') || '';
    const rawText = await response.text();

    // Se o GAS retornou HTML (ex.: erro de script não encontrado)
    if (rawText.includes('<!DOCTYPE') || rawText.includes('<html') || !rawText.trim().startsWith('{')) {
      let errorMsg = 'Google Apps Script não retornou JSON.';
      if (rawText.includes('doGet')) {
        errorMsg = 'Função doGet não configurada na Planilha Google.';
      }
      return {
        success: false,
        isHtmlError: true,
        error: errorMsg,
        data: getLocalData()
      };
    }

    const data = JSON.parse(rawText);
    if (data.status === 'success' || data.pedidos || data.despesas) {
      const deletedOrderIds = getDeletedOrderIds();

      // Normalizar pedidos vindos do Google Sheets (excluindo os já apagados pelo usuário)
      const normalizedRemotePedidos = (data.pedidos || [])
        .filter(p => !deletedOrderIds.has(String(p.id)))
        .map(p => {
        let formaPagto = p.forma_pagto;
        let obs = p.obs_pagto || p[''] || p.obs || '';
        // Se forma_pagto veio como número de taxa (ex.: 15.5) devido a variação de colunas no sheet antigo
        if (typeof formaPagto === 'number' || (formaPagto && !isNaN(formaPagto) && !['PIX', 'DINHEIRO', 'CARTAO', 'CARTÃO', 'A REC', 'ONLINE', 'DÉBITO', 'CRÉDITO'].includes(String(formaPagto).toUpperCase()))) {
          if (p['']) obs = p[''];
          formaPagto = 'ONLINE';
        }

        return {
          ...p,
          data: p.data || p.dia || p.data_hora || p.created_at || new Date().toISOString(),
          bairro: normalizeBairroName(p.bairro),
          forma_pagto: formaPagto || 'PIX',
          obs_pagto: obs || '',
          valor_total: parseFloat(p.valor_total) || 0,
          taxa_entrega: parseFloat(p.taxa_entrega) || 0,
          valor_itens: parseFloat(p.valor_itens) || 0,
          synced: true
        };
      });

      // Normalizar despesas
      const normalizedRemoteDespesas = (data.despesas || []).map(d => ({
        ...d,
        data: d.data || d.dia || d.data_hora || d.created_at || new Date().toISOString(),
        valor: parseFloat(d.valor) || 0,
        synced: true
      }));

      // Mesclar com cache local preservando lançamentos locais não sincronizados
      const local = getLocalData();
      const remoteIds = new Set(normalizedRemotePedidos.map(p => String(p.id)));
      const localUnsyncedPedidos = (local.pedidos || [])
        .filter(p => !remoteIds.has(String(p.id)) && !deletedOrderIds.has(String(p.id)));
      const mergedPedidos = [...localUnsyncedPedidos, ...normalizedRemotePedidos];

      const remoteDespIds = new Set(normalizedRemoteDespesas.map(d => String(d.id)));
      const localUnsyncedDespesas = (local.despesas || []).filter(d => !remoteDespIds.has(String(d.id)));
      const mergedDespesas = [...localUnsyncedDespesas, ...normalizedRemoteDespesas];

      const mergedFiados = data.fiados && data.fiados.length > 0 ? data.fiados : local.fiados;

      saveLocalData({ pedidos: mergedPedidos, despesas: mergedDespesas, fiados: mergedFiados });
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());

      return {
        success: true,
        data: {
          pedidos: mergedPedidos,
          despesas: mergedDespesas,
          fiados: mergedFiados,
          syncQueue: local.syncQueue,
          lastSync: new Date().toISOString()
        }
      };
    }

    return {
      success: false,
      error: data.message || 'Formato de resposta inesperado do Google Sheets',
      data: getLocalData()
    };
  } catch (err) {
    return {
      success: false,
      error: err.name === 'AbortError' ? 'Tempo de conexão esgotado (timeout)' : err.message,
      data: getLocalData()
    };
  }
}

// POST genérico com fallback seguro
export async function sendRemotePost(payload) {
  const url = getApiUrl();
  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload),
      redirect: 'follow'
    }, 35000);

    const rawText = await response.text();
    if (rawText.includes('<!DOCTYPE') || rawText.includes('<html')) {
      let reason = 'Apps Script retornou HTML';
      if (rawText.includes('doPost')) reason = 'Função doPost não configurada no Script';
      return { success: false, offline: true, error: reason };
    }

    try {
      const json = JSON.parse(rawText);
      return { success: true, response: json };
    } catch {
      return { success: true, raw: rawText };
    }
  } catch (err) {
    return { success: false, offline: true, error: err.message };
  }
}

// Registar Novo Pedido
export async function registrarPedido(pedidoData) {
  const local = getLocalData();
  // Taxa de plataforma (ex.: 15.5% para iFood e 99Food)
  const platformFees = getPlatformFees();
  const feePercent = parseFloat(platformFees[pedidoData.canal] || 0);
  const totalVal = parseFloat(pedidoData.valor_total) || 0;
  const valorTaxaPlataforma = Math.round((totalVal * (feePercent / 100)) * 100) / 100;
  const valorLiquidoEmpresa = Math.round((totalVal - valorTaxaPlataforma) * 100) / 100;

  const bairroNormalizado = normalizeBairroName(pedidoData.bairro || 'Balcão');

  const novoPedido = {
    id: pedidoData.id || `PED-${Date.now().toString().slice(-4)}`,
    ...pedidoData,
    bairro: bairroNormalizado,
    taxa_plataforma_percent: feePercent,
    valor_taxa_plataforma: valorTaxaPlataforma,
    valor_liquido_empresa: valorLiquidoEmpresa,
    data: pedidoData.data || new Date().toISOString(),
    synced: false
  };

  // 1. Atualizar pedidos locais
  const pedidosAtualizados = [novoPedido, ...local.pedidos];

  // 2. Se for fiado, atualizar ou criar saldo do cliente
  let fiadosAtualizados = [...local.fiados];
  if (pedidoData.forma_pagto === 'A REC') {
    const nomeCliente = (pedidoData.cliente_fiado || pedidoData.obs_pagto || 'Cliente Não Identificado')
      .replace(/cliente:\s*/i, '')
      .split('(')[0]
      .trim()
      .toUpperCase();

    const telCliente = (pedidoData.telefone_fiado || '').trim();

    const idx = fiadosAtualizados.findIndex(f => f.cliente.toUpperCase() === nomeCliente);
    if (idx >= 0) {
      fiadosAtualizados[idx] = {
        ...fiadosAtualizados[idx],
        saldo: (parseFloat(fiadosAtualizados[idx].saldo) || 0) + parseFloat(pedidoData.valor_total || 0),
        telefone: telCliente || fiadosAtualizados[idx].telefone || '',
        dataAtualizacao: new Date().toISOString()
      };
    } else {
      fiadosAtualizados.push({
        id: `f-${Date.now()}`,
        cliente: nomeCliente,
        saldo: parseFloat(pedidoData.valor_total || 0),
        telefone: telCliente,
        dataAtualizacao: new Date().toISOString()
      });
    }
  }

  // 3. Salvar localmente
  saveLocalData({ pedidos: pedidosAtualizados, fiados: fiadosAtualizados });

  // 4. Preparar payload conforme especificação
  const payload = {
    tipo_registro: 'pedido',
    id: novoPedido.id,
    tipo: pedidoData.tipo,
    canal: pedidoData.canal,
    bairro: bairroNormalizado,
    taxa_entrega: parseFloat(pedidoData.taxa_entrega) || 0,
    valor_itens: parseFloat(pedidoData.valor_itens) || 0,
    valor_total: parseFloat(pedidoData.valor_total) || 0,
    taxa_plataforma_percent: feePercent,
    valor_taxa_plataforma: valorTaxaPlataforma,
    valor_liquido_empresa: valorLiquidoEmpresa,
    forma_pagto: pedidoData.forma_pagto,
    obs_pagto: pedidoData.obs_pagto || ''
  };

  // 5. Tentar sincronizar com Google Sheets
  const res = await sendRemotePost(payload);
  if (res.success) {
    novoPedido.synced = true;
    saveLocalData({ pedidos: pedidosAtualizados });
    return { success: true, synced: true, pedido: novoPedido };
  } else {
    // Adicionar à fila de sincronização offline
    const queue = [...local.syncQueue, payload];
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    return { success: true, synced: false, offline: true, error: res.error, pedido: novoPedido };
  }
}

// Atualizar/Editar Pedido Existente
export async function atualizarPedido(pedidoAtualizado) {
  const local = getLocalData();
  const index = local.pedidos.findIndex(p => p.id === pedidoAtualizado.id);
  if (index === -1) return { success: false, error: 'Pedido não encontrado' };

  const pedidoAntigo = local.pedidos[index];

  // Recalcular taxa de plataforma conforme canal e novo valor
  const platformFees = getPlatformFees();
  const feePercent = parseFloat(platformFees[pedidoAtualizado.canal] || 0);
  const totalVal = parseFloat(pedidoAtualizado.valor_total) || 0;
  const valorTaxaPlataforma = Math.round((totalVal * (feePercent / 100)) * 100) / 100;
  const valorLiquidoEmpresa = Math.round((totalVal - valorTaxaPlataforma) * 100) / 100;

  const pedidoModificado = {
    ...pedidoAntigo,
    ...pedidoAtualizado,
    taxa_plataforma_percent: feePercent,
    valor_taxa_plataforma: valorTaxaPlataforma,
    valor_liquido_empresa: valorLiquidoEmpresa,
    dataAtualizacao: new Date().toISOString()
  };

  const pedidosAtualizados = [...local.pedidos];
  pedidosAtualizados[index] = pedidoModificado;

  // Ajuste de Fiados se a forma de pagamento for ou era 'A REC'
  let fiadosAtualizados = [...local.fiados];
  if (pedidoAntigo.forma_pagto === 'A REC') {
    const nomeAntigo = (pedidoAntigo.cliente_fiado || pedidoAntigo.obs_pagto || '')
      .replace(/cliente:\s*/i, '').split('(')[0].trim().toUpperCase();
    if (nomeAntigo) {
      const idxF = fiadosAtualizados.findIndex(f => f.cliente.toUpperCase() === nomeAntigo);
      if (idxF >= 0) {
        fiadosAtualizados[idxF] = {
          ...fiadosAtualizados[idxF],
          saldo: Math.max(0, (parseFloat(fiadosAtualizados[idxF].saldo) || 0) - (parseFloat(pedidoAntigo.valor_total) || 0)),
          dataAtualizacao: new Date().toISOString()
        };
      }
    }
  }
  if (pedidoModificado.forma_pagto === 'A REC') {
    const novoNome = (pedidoModificado.cliente_fiado || pedidoModificado.obs_pagto || 'Cliente Não Identificado')
      .replace(/cliente:\s*/i, '').split('(')[0].trim().toUpperCase();
    const idxF = fiadosAtualizados.findIndex(f => f.cliente.toUpperCase() === novoNome);
    if (idxF >= 0) {
      fiadosAtualizados[idxF] = {
        ...fiadosAtualizados[idxF],
        saldo: (parseFloat(fiadosAtualizados[idxF].saldo) || 0) + (parseFloat(pedidoModificado.valor_total) || 0),
        dataAtualizacao: new Date().toISOString()
      };
    } else {
      fiadosAtualizados.push({
        id: `f-${Date.now()}`,
        cliente: novoNome,
        saldo: parseFloat(pedidoModificado.valor_total) || 0,
        telefone: '',
        dataAtualizacao: new Date().toISOString()
      });
    }
  }

  saveLocalData({ pedidos: pedidosAtualizados, fiados: fiadosAtualizados });

  // Tentar sincronizar alteração com a planilha
  const payload = {
    tipo_registro: 'editar_pedido',
    id: pedidoModificado.id,
    tipo: pedidoModificado.tipo,
    canal: pedidoModificado.canal,
    bairro: pedidoModificado.bairro,
    taxa_entrega: parseFloat(pedidoModificado.taxa_entrega) || 0,
    valor_itens: parseFloat(pedidoModificado.valor_itens) || 0,
    valor_total: parseFloat(pedidoModificado.valor_total) || 0,
    taxa_plataforma_percent: feePercent,
    valor_taxa_plataforma: valorTaxaPlataforma,
    valor_liquido_empresa: valorLiquidoEmpresa,
    forma_pagto: pedidoModificado.forma_pagto,
    obs_pagto: pedidoModificado.obs_pagto || ''
  };

  try {
    const res = await sendRemotePost(payload);
    if (!res.success) {
      const queue = [...local.syncQueue, payload];
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    }
    return { success: true, synced: res.success, pedido: pedidoModificado };
  } catch {
    const queue = [...local.syncQueue, payload];
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    return { success: true, synced: false, offline: true, pedido: pedidoModificado };
  }
}

// Excluir Pedido (Local e Planilha Google)
export async function excluirPedido(id) {
  const local = getLocalData();
  const idStr = String(id);
  const pedidoParaExcluir = local.pedidos.find(p => String(p.id) === idStr);

  const pedidosAtualizados = local.pedidos.filter(p => String(p.id) !== idStr);

  // Se o pedido era fiado, descontar do saldo do cliente
  let fiadosAtualizados = [...local.fiados];
  if (pedidoParaExcluir && pedidoParaExcluir.forma_pagto === 'A REC') {
    const nomeCliente = (pedidoParaExcluir.cliente_fiado || pedidoParaExcluir.obs_pagto || '')
      .replace(/cliente:\s*/i, '').split('(')[0].trim().toUpperCase();
    if (nomeCliente) {
      const idxF = fiadosAtualizados.findIndex(f => f.cliente.toUpperCase() === nomeCliente);
      if (idxF >= 0) {
        fiadosAtualizados[idxF] = {
          ...fiadosAtualizados[idxF],
          saldo: Math.max(0, (parseFloat(fiadosAtualizados[idxF].saldo) || 0) - (parseFloat(pedidoParaExcluir.valor_total) || 0)),
          dataAtualizacao: new Date().toISOString()
        };
      }
    }
  }

  markOrderAsDeleted(idStr);
  saveLocalData({ pedidos: pedidosAtualizados, fiados: fiadosAtualizados });

  const payload = {
    tipo_registro: 'excluir_pedido',
    id: idStr
  };

  try {
    const res = await sendRemotePost(payload);
    if (!res.success) {
      const queue = [...local.syncQueue, payload];
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    }
    return { success: true, synced: res.success };
  } catch {
    const queue = [...local.syncQueue, payload];
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    return { success: true, synced: false, offline: true };
  }
}

// Registar Nova Despesa
export async function registrarDespesa(despesaData) {
  const local = getLocalData();
  const novaDespesa = {
    id: despesaData.id || `DESP-${Date.now().toString().slice(-4)}`,
    ...despesaData,
    valor: parseFloat(despesaData.valor) || 0,
    data: despesaData.data || new Date().toISOString(),
    synced: false
  };

  const despesasAtualizadas = [novaDespesa, ...local.despesas];
  saveLocalData({ despesas: despesasAtualizadas });

  const payload = {
    tipo_registro: 'despesa',
    id: novaDespesa.id,
    categoria: despesaData.categoria,
    valor: parseFloat(despesaData.valor) || 0,
    obs: despesaData.obs || ''
  };

  const res = await sendRemotePost(payload);
  if (res.success) {
    novaDespesa.synced = true;
    saveLocalData({ despesas: despesasAtualizadas });
    return { success: true, synced: true, despesa: novaDespesa };
  } else {
    const queue = [...local.syncQueue, payload];
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    return { success: true, synced: false, offline: true, error: res.error, despesa: novaDespesa };
  }
}

// Dar Baixa / Quitar Fiado
export async function darBaixaFiado({ cliente, valor, formaPagto = 'PIX', obs = '' }) {
  const local = getLocalData();
  const fiadosAtualizados = local.fiados.map(f => {
    if (f.cliente.toUpperCase() === cliente.toUpperCase()) {
      const novoSaldo = Math.max(0, (parseFloat(f.saldo) || 0) - parseFloat(valor || 0));
      return {
        ...f,
        saldo: Math.round(novoSaldo * 100) / 100,
        dataAtualizacao: new Date().toISOString()
      };
    }
    return f;
  });

  saveLocalData({ fiados: fiadosAtualizados });

  const payload = {
    tipo_registro: 'baixa_fiado',
    cliente,
    valor: parseFloat(valor) || 0,
    forma_pagto: formaPagto,
    obs: obs || `Baixa de fiado recebida em ${formaPagto}`
  };

  const res = await sendRemotePost(payload);
  return { success: true, synced: res.success, offline: !res.success };
}

// Editar Dados do Fiado (Nome, Telefone ou Saldo)
export async function editarFiado({ id, clienteAntigo, clienteNovo, telefone, saldo }) {
  const local = getLocalData();
  const nomeAntigo = (clienteAntigo || '').toUpperCase().trim();
  const nomeNovo = (clienteNovo || clienteAntigo || '').toUpperCase().trim();
  const saldoNum = Math.max(0, parseFloat(saldo) || 0);

  const fiadosAtualizados = local.fiados.map(f => {
    if ((id && f.id === id) || f.cliente.toUpperCase().trim() === nomeAntigo) {
      return {
        ...f,
        cliente: nomeNovo,
        telefone: telefone !== undefined ? telefone : f.telefone,
        saldo: saldoNum,
        dataAtualizacao: new Date().toISOString()
      };
    }
    return f;
  });

  saveLocalData({ fiados: fiadosAtualizados });

  const payload = {
    tipo_registro: 'editar_fiado',
    cliente_antigo: nomeAntigo,
    cliente_novo: nomeNovo,
    telefone: telefone || '',
    saldo: saldoNum
  };

  try {
    await sendRemotePost(payload);
  } catch {
    // offline-first
  }

  return { success: true, fiados: fiadosAtualizados };
}

// Cadastrar Novo Cliente no Fiado
export async function adicionarNovoFiado({ cliente, telefone = '', saldo = 0 }) {
  const local = getLocalData();
  const nomeLimpo = (cliente || '').toUpperCase().trim();
  const saldoNum = Math.max(0, parseFloat(saldo) || 0);

  if (!nomeLimpo) return { success: false, error: 'Nome do cliente é obrigatório' };

  const existe = local.fiados.some(f => f.cliente.toUpperCase().trim() === nomeLimpo);
  if (existe) {
    return { success: false, error: 'Cliente já cadastrado em Fiados' };
  }

  const novo = {
    id: `f-${Date.now()}`,
    cliente: nomeLimpo,
    telefone: telefone.trim(),
    saldo: saldoNum,
    dataAtualizacao: new Date().toISOString()
  };

  const fiadosAtualizados = [...local.fiados, novo];
  saveLocalData({ fiados: fiadosAtualizados });

  const payload = {
    tipo_registro: 'editar_fiado',
    cliente_antigo: nomeLimpo,
    cliente_novo: nomeLimpo,
    telefone: telefone.trim(),
    saldo: saldoNum
  };

  try {
    sendRemotePost(payload);
  } catch {
    // offline-first
  }

  return { success: true, novo, fiados: fiadosAtualizados };
}

// Excluir Fiado
export async function excluirFiado(cliente) {
  const local = getLocalData();
  const nomeLimpo = (cliente || '').toUpperCase().trim();
  const fiadosAtualizados = local.fiados.filter(f => f.cliente.toUpperCase().trim() !== nomeLimpo);
  saveLocalData({ fiados: fiadosAtualizados });
  return { success: true, fiados: fiadosAtualizados };
}

// Sincronizar Fila de Pedidos/Despesas Offline para a Planilha
export async function flushSyncQueue() {
  const local = getLocalData();
  const queue = local.syncQueue || [];
  if (queue.length === 0) return { flushed: 0, remaining: 0 };

  const remaining = [];
  let flushed = 0;

  for (const item of queue) {
    try {
      const res = await sendRemotePost(item);
      if (res.success) {
        flushed++;
      } else {
        remaining.push(item);
      }
    } catch {
      remaining.push(item);
    }
  }

  localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(remaining));
  return { flushed, remaining: remaining.length };
}

// Código Google Apps Script pronto para o usuário copiar
export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * CÓDIGO DO GOOGLE APPS SCRIPT PARA O PDV LANCHONETE EXPRESS
 * 
 * INSTRUÇÕES RÁPIDAS:
 * 1. Abra a sua Planilha Google
 * 2. Clique em Extensões > Apps Script
 * 3. Apague qualquer código existente e cole este código completo abaixo
 * 4. Clique no ícone de Salvar (Disquete)
 * 5. Clique em Implantar (Deploy) > Nova Implantação
 * 6. Tipo: "App da Web" (Web app)
 * 7. Executar como: "Eu" (seu e-mail)
 * 8. Quem pode acessar: "Qualquer pessoa" (Anyone)
 * 9. Clique em Implantar e copie o URL gerado!
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'get_all';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === 'get_all') {
    var pedidos = getSheetDataAsJson(ss, 'PEDIDOS');
    var despesas = getSheetDataAsJson(ss, 'DESPESAS');
    var fiados = getSheetDataAsJson(ss, 'FIADOS');
    
    var response = {
      status: 'success',
      pedidos: pedidos,
      despesas: despesas,
      fiados: fiados,
      timestamp: new Date().toISOString()
    };
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var contents = e.postData ? e.postData.contents : '';
    if (!contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Sem conteúdo' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var data = JSON.parse(contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var now = new Date();
    
    if (data.tipo_registro === 'pedido') {
      var sheetPedidos = getOrCreateSheet(ss, 'PEDIDOS', [
        'ID', 'DATA_HORA', 'TIPO', 'CANAL', 'BAIRRO', 'TAXA_ENTREGA', 'VALOR_ITENS', 'VALOR_TOTAL', 'TAXA_PLAT_%', 'VALOR_TAXA_PLAT', 'VALOR_LIQUIDO', 'FORMA_PAGTO', 'OBS'
      ]);
      
      var dataHoraFmt = Utilities.formatDate(now, "America/Sao_Paulo", "dd/MM/yyyy HH:mm:ss");
      
      sheetPedidos.appendRow([
        data.id || ('PED-' + now.getTime()),
        dataHoraFmt,
        data.tipo || '',
        data.canal || '',
        data.bairro || '',
        Number(data.taxa_entrega) || 0,
        Number(data.valor_itens) || 0,
        Number(data.valor_total) || 0,
        Number(data.taxa_plataforma_percent) || 0,
        Number(data.valor_taxa_plataforma) || 0,
        Number(data.valor_liquido_empresa) || Number(data.valor_total) || 0,
        data.forma_pagto || '',
        data.obs_pagto || ''
      ]);
      
      // Se for fiado, atualiza também a aba FIADOS
      if (data.forma_pagto === 'A REC') {
        atualizarOuCriarFiado(ss, data.obs_pagto || 'Cliente Balcão', data.valor_total || 0);
      }
      
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Pedido gravado' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.tipo_registro === 'despesa') {
      var sheetDesp = getOrCreateSheet(ss, 'DESPESAS', [
        'ID', 'DATA', 'CATEGORIA', 'VALOR', 'OBS'
      ]);
      
      sheetDesp.appendRow([
        data.id || ('DESP-' + now.getTime()),
        dataHoraFmt,
        data.categoria || '',
        Number(data.valor) || 0,
        data.obs || ''
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Despesa gravada' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.tipo_registro === 'baixa_fiado') {
      darBaixaFiadoSheet(ss, data.cliente, data.valor);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Baixa efetuada' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (data.tipo_registro === 'editar_pedido') {
      var editOk = editarPedidoSheet(ss, data);
      return ContentService.createTextOutput(JSON.stringify({ 
        status: editOk ? 'success' : 'not_found', 
        message: editOk ? 'Pedido atualizado na planilha' : 'Pedido não encontrado na planilha' 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.tipo_registro === 'excluir_pedido') {
      var delOk = excluirPedidoSheet(ss, data);
      return ContentService.createTextOutput(JSON.stringify({ 
        status: delOk ? 'success' : 'not_found', 
        message: delOk ? 'Pedido excluído da planilha' : 'Pedido não encontrado na planilha' 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', received: data }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#1e293b').setFontColor('#ffffff');
    }
  }
  return sheet;
}

function getSheetDataAsJson(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) return [];
  var rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return [];
  var headers = rows[0];
  var result = [];
  for (var i = 1; i < rows.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var key = String(headers[j]).toLowerCase().replace(/\\s+/g, '_');
      obj[key] = rows[i][j];
    }
    result.push(obj);
  }
  return result;
}

function atualizarOuCriarFiado(ss, cliente, valor) {
  var sheet = getOrCreateSheet(ss, 'FIADOS', ['CLIENTE', 'SALDO_DEVEDOR', 'ULTIMA_ATUALIZACAO']);
  var data = sheet.getDataRange().getValues();
  var found = false;
  var nomeBuscado = cliente.toString().toUpperCase().trim();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).toUpperCase().trim() === nomeBuscado) {
      var saldoAtual = Number(data[i][1]) || 0;
      sheet.getRange(i + 1, 2).setValue(saldoAtual + Number(valor));
      sheet.getRange(i + 1, 3).setValue(new Date().toISOString());
      found = true;
      break;
    }
  }
  if (!found) {
    sheet.appendRow([nomeBuscado, Number(valor), new Date().toISOString()]);
  }
}

function darBaixaFiadoSheet(ss, cliente, valor) {
  var sheet = getOrCreateSheet(ss, 'FIADOS', ['CLIENTE', 'SALDO_DEVEDOR', 'ULTIMA_ATUALIZACAO']);
  var data = sheet.getDataRange().getValues();
  var nomeBuscado = cliente.toString().toUpperCase().trim();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).toUpperCase().trim() === nomeBuscado) {
      var saldoAtual = Number(data[i][1]) || 0;
      var novoSaldo = Math.max(0, saldoAtual - Number(valor));
      sheet.getRange(i + 1, 2).setValue(novoSaldo);
      sheet.getRange(i + 1, 3).setValue(new Date().toISOString());
      break;
    }
  }
}

function editarPedidoSheet(ss, data) {
  var sheet = ss.getSheetByName('PEDIDOS');
  if (!sheet) return false;
  var rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return false;
  
  var targetId = String(data.id || '').trim().toUpperCase();
  if (!targetId) return false;
  
  for (var i = 1; i < rows.length; i++) {
    var rowId = String(rows[i][0] || '').trim().toUpperCase();
    if (rowId === targetId) {
      var rowNum = i + 1; // Linha real no Sheet (1-indexado)
      if (data.tipo !== undefined) sheet.getRange(rowNum, 3).setValue(data.tipo);
      if (data.canal !== undefined) sheet.getRange(rowNum, 4).setValue(data.canal);
      if (data.bairro !== undefined) sheet.getRange(rowNum, 5).setValue(data.bairro);
      if (data.taxa_entrega !== undefined) sheet.getRange(rowNum, 6).setValue(Number(data.taxa_entrega) || 0);
      if (data.valor_itens !== undefined) sheet.getRange(rowNum, 7).setValue(Number(data.valor_itens) || 0);
      if (data.valor_total !== undefined) sheet.getRange(rowNum, 8).setValue(Number(data.valor_total) || 0);
      if (data.taxa_plataforma_percent !== undefined) sheet.getRange(rowNum, 9).setValue(Number(data.taxa_plataforma_percent) || 0);
      if (data.valor_taxa_plataforma !== undefined) sheet.getRange(rowNum, 10).setValue(Number(data.valor_taxa_plataforma) || 0);
      if (data.valor_liquido_empresa !== undefined) sheet.getRange(rowNum, 11).setValue(Number(data.valor_liquido_empresa) || 0);
      if (data.forma_pagto !== undefined) sheet.getRange(rowNum, 12).setValue(data.forma_pagto);
      if (data.obs_pagto !== undefined) sheet.getRange(rowNum, 13).setValue(data.obs_pagto);
      return true;
    }
  }
  return false;
}

function excluirPedidoSheet(ss, data) {
  var sheet = ss.getSheetByName('PEDIDOS');
  if (!sheet) return false;
  var rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return false;
  
  var targetId = String(data.id || '').trim().toUpperCase();
  if (!targetId) return false;
  
  for (var i = 1; i < rows.length; i++) {
    var rowId = String(rows[i][0] || '').trim().toUpperCase();
    if (rowId === targetId) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}
`;
