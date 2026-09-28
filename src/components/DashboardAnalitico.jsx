import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  MapPin, 
  Calendar, 
  Store, 
  Bike, 
  DollarSign, 
  Award, 
  Sparkles, 
  ArrowUpRight, 
  Filter, 
  Copy, 
  Check, 
  Smartphone, 
  ShoppingBag, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Clock, 
  ChevronRight, 
  Flame, 
  ArrowLeft,
  ChevronDown,
  Lock
} from 'lucide-react';
import { WhatsAppIcon, IFoodIcon, NoventaIcon } from './BrandIcons';
import { lockDashboard } from '../utils/auth';
import { 
  formatCurrency, 
  formatDate, 
  parseRecordDate, 
  normalizeBairroName, 
  getRecordDateString, 
  getTodayDateString 
} from '../utils/formatters';

const DIAS_SEMANA = [
  { id: 0, nome: 'Domingo', curto: 'Dom' },
  { id: 1, nome: 'Segunda-feira', curto: 'Seg' },
  { id: 2, nome: 'Terça-feira', curto: 'Ter' },
  { id: 3, nome: 'Quarta-feira', curto: 'Qua' },
  { id: 4, nome: 'Quinta-feira', curto: 'Qui' },
  { id: 5, nome: 'Sexta-feira', curto: 'Sex' },
  { id: 6, nome: 'Sábado', curto: 'Sáb' },
];

export default function DashboardAnalitico({ pedidos = [], despesas = [], onBackToPdv }) {
  const todayStr = getTodayDateString();
  
  // Filtros de Período
  const [periodo, setPeriodo] = useState('30dias'); // 'hoje' | '7dias' | '30dias' | 'mes' | 'todo' | 'custom'
  const [dataInicio, setDataInicio] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
  const [dataFim, setDataFim] = useState(todayStr);

  // Ordenação do ranking de bairros
  const [ordenacaoBairro, setOrdenacaoBairro] = useState('pedidos'); // 'pedidos' | 'faturamento'

  // Notificação de cópia
  const [copiado, setCopiado] = useState(false);

  // 1. Filtragem dos Pedidos pelo Período Selecionado
  const pedidosFiltrados = useMemo(() => {
    const now = new Date();
    const hojeZero = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return pedidos.filter(p => {
      const d = parseRecordDate(p);
      if (!d) return periodo === 'todo'; // se não tem data identificável, só entra em 'todo'

      const recordZero = new Date(d.getFullYear(), d.getMonth(), d.getDate());

      if (periodo === 'hoje') {
        return recordZero.getTime() === hojeZero.getTime();
      }

      if (periodo === '7dias') {
        const seteDiasAtras = new Date(hojeZero);
        seteDiasAtras.setDate(seteDiasAtras.getDate() - 6);
        return recordZero >= seteDiasAtras && recordZero <= hojeZero;
      }

      if (periodo === '30dias') {
        const trintaDiasAtras = new Date(hojeZero);
        trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 29);
        return recordZero >= trintaDiasAtras && recordZero <= hojeZero;
      }

      if (periodo === 'mes') {
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      }

      if (periodo === 'custom') {
        const dStr = getRecordDateString(p);
        if (!dStr) return false;
        if (dataInicio && dStr < dataInicio) return false;
        if (dataFim && dStr > dataFim) return false;
        return true;
      }

      return true; // 'todo'
    });
  }, [pedidos, periodo, dataInicio, dataFim]);

  // 2. Métricas Gerais (KPIs)
  const totalFaturado = useMemo(() => {
    return pedidosFiltrados.reduce((acc, p) => acc + (parseFloat(p.valor_total) || 0), 0);
  }, [pedidosFiltrados]);

  const qtdPedidos = pedidosFiltrados.length;
  const ticketMedioGeral = qtdPedidos > 0 ? totalFaturado / qtdPedidos : 0;

  const totalTaxasEntrega = useMemo(() => {
    return pedidosFiltrados.reduce((acc, p) => acc + (parseFloat(p.taxa_entrega) || 0), 0);
  }, [pedidosFiltrados]);

  // 3. ANÁLISE POR CANAIS DE VENDA ("Por onde mais vende")
  const canaisData = useMemo(() => {
    const mapa = {
      ZAP: { key: 'ZAP', label: 'WhatsApp', color: '#10b981', bgBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300', count: 0, total: 0 },
      IFOOD: { key: 'IFOOD', label: 'iFood', color: '#ef4444', bgBadge: 'bg-rose-100 text-rose-800 border-rose-300', count: 0, total: 0 },
      '99F': { key: '99F', label: '99Food', color: '#f97316', bgBadge: 'bg-orange-100 text-orange-800 border-orange-300', count: 0, total: 0 },
      'BALCAO': { key: 'BALCAO', label: 'Balcão / Presencial', color: '#8b5cf6', bgBadge: 'bg-purple-100 text-purple-800 border-purple-300', count: 0, total: 0 },
      'OUTRO': { key: 'OUTRO', label: 'Outro', color: '#64748b', bgBadge: 'bg-slate-100 text-slate-800 border-slate-300', count: 0, total: 0 },
    };

    pedidosFiltrados.forEach(p => {
      let canalRaw = String(p.canal || '').trim().toUpperCase();
      const tipoRaw = String(p.tipo || '').trim().toUpperCase();

      let canalKey = 'OUTRO';
      if (canalRaw.includes('ZAP') || canalRaw.includes('WHATS')) canalKey = 'ZAP';
      else if (canalRaw.includes('IFOOD')) canalKey = 'IFOOD';
      else if (canalRaw.includes('99')) canalKey = '99F';
      else if (canalRaw.includes('BALC') || tipoRaw === 'BALCÃO' || tipoRaw === 'BALCAO') canalKey = 'BALCAO';
      else if (p.tipo === 'Delivery') canalKey = 'ZAP'; // fallback mais comum

      mapa[canalKey].count += 1;
      mapa[canalKey].total += parseFloat(p.valor_total) || 0;
    });

    const lista = Object.values(mapa)
      .filter(c => c.count > 0)
      .map(c => ({
        ...c,
        percentual: totalFaturado > 0 ? (c.total / totalFaturado) * 100 : 0,
        ticketMedio: c.count > 0 ? c.total / c.count : 0
      }))
      .sort((a, b) => b.total - a.total);

    const campeao = lista[0] || null;

    return { lista, campeao };
  }, [pedidosFiltrados, totalFaturado]);

  // 4. ANÁLISE POR BAIRRO DE ENTREGA ("Para qual bairro mais vende")
  const bairrosData = useMemo(() => {
    const mapa = {};
    let totalEntregasDelivery = 0;

    pedidosFiltrados.forEach(p => {
      const tipoRaw = String(p.tipo || '').trim().toUpperCase();
      let rawBairro = String(p.bairro || '').trim();

      // Ignora pedidos puramente de balcão para o ranking de entregas se não houver bairro
      if (tipoRaw === 'BALCÃO' || tipoRaw === 'BALCAO' || rawBairro.toUpperCase() === 'BALCÃO' || rawBairro.toUpperCase() === 'BALCAO') {
        return;
      }

      if (!rawBairro) rawBairro = 'Não especificado';
      const nomeOficial = normalizeBairroName(rawBairro);

      if (!mapa[nomeOficial]) {
        mapa[nomeOficial] = {
          nome: nomeOficial,
          entregas: 0,
          total: 0,
          taxasTotal: 0
        };
      }

      const valTotal = parseFloat(p.valor_total) || 0;
      const valTaxa = parseFloat(p.taxa_entrega) || 0;

      mapa[nomeOficial].entregas += 1;
      mapa[nomeOficial].total += valTotal;
      mapa[nomeOficial].taxasTotal += valTaxa;
      totalEntregasDelivery += 1;
    });

    const lista = Object.values(mapa).map(b => ({
      ...b,
      percentual: totalEntregasDelivery > 0 ? (b.entregas / totalEntregasDelivery) * 100 : 0,
      ticketMedio: b.entregas > 0 ? b.total / b.entregas : 0
    }));

    // Ordenar pelo filtro selecionado
    if (ordenacaoBairro === 'pedidos') {
      lista.sort((a, b) => b.entregas - a.entregas || b.total - a.total);
    } else {
      lista.sort((a, b) => b.total - a.total || b.entregas - a.entregas);
    }

    const campeao = lista[0] || null;

    return {
      lista,
      top10: lista.slice(0, 10),
      campeao,
      totalEntregasDelivery
    };
  }, [pedidosFiltrados, ordenacaoBairro]);

  // 5. ANÁLISE POR DIA DA SEMANA ("Melhor dia")
  const diasSemanaData = useMemo(() => {
    // Inicializar os 7 dias
    const statsPorDia = DIAS_SEMANA.map(d => ({
      ...d,
      count: 0,
      total: 0,
      datasDistintas: new Set(),
    }));

    pedidosFiltrados.forEach(p => {
      const d = parseRecordDate(p);
      if (!d) return;

      const diaIndex = d.getDay(); // 0..6
      const dateStr = getRecordDateString(p);
      const val = parseFloat(p.valor_total) || 0;

      if (statsPorDia[diaIndex]) {
        statsPorDia[diaIndex].count += 1;
        statsPorDia[diaIndex].total += val;
        if (dateStr) statsPorDia[diaIndex].datasDistintas.add(dateStr);
      }
    });

    // Calcular ticket médio e média por ocorrência daquele dia
    const resultado = statsPorDia.map(d => {
      const numOcorrencias = d.datasDistintas.size || 1;
      return {
        ...d,
        numOcorrencias,
        mediaPorOcorrencia: d.count > 0 ? d.total / numOcorrencias : 0,
        ticketMedio: d.count > 0 ? d.total / d.count : 0,
        percentualTotal: totalFaturado > 0 ? (d.total / totalFaturado) * 100 : 0
      };
    });

    // Encontrar o maior faturamento para escala visual do gráfico
    const maxTotal = Math.max(...resultado.map(r => r.total), 1);

    // Ordenar para encontrar campeão e vice
    const ordenados = [...resultado].sort((a, b) => b.total - a.total);
    const campeao = ordenados[0]?.total > 0 ? ordenados[0] : null;
    const vice = ordenados[1]?.total > 0 ? ordenados[1] : null;

    return {
      dias: resultado,
      maxTotal,
      campeao,
      vice
    };
  }, [pedidosFiltrados, totalFaturado]);

  // 6. ANÁLISE POR FORMA DE PAGAMENTO
  const pagamentosData = useMemo(() => {
    const mapa = {
      PIX: { label: 'PIX', count: 0, total: 0, color: 'bg-emerald-500' },
      'CARTÃO CRÉD': { label: 'Cartão Crédito', count: 0, total: 0, color: 'bg-purple-500' },
      'CARTÃO DÉB': { label: 'Cartão Débito', count: 0, total: 0, color: 'bg-blue-500' },
      DINHEIRO: { label: 'Dinheiro', count: 0, total: 0, color: 'bg-amber-500' },
      'A REC': { label: 'Fiado (A Receber)', count: 0, total: 0, color: 'bg-rose-500' },
      OUTROS: { label: 'Outros', count: 0, total: 0, color: 'bg-slate-400' },
    };

    pedidosFiltrados.forEach(p => {
      const pag = String(p.forma_pagto || '').trim().toUpperCase();
      let key = 'OUTROS';
      if (pag.includes('PIX')) key = 'PIX';
      else if (pag.includes('CRÉD') || pag.includes('CRED')) key = 'CARTÃO CRÉD';
      else if (pag.includes('DÉB') || pag.includes('DEB')) key = 'CARTÃO DÉB';
      else if (pag.includes('DINHEIRO') || pag.includes('CASH')) key = 'DINHEIRO';
      else if (pag.includes('REC') || pag.includes('FIADO')) key = 'A REC';

      const val = parseFloat(p.valor_total) || 0;
      mapa[key].count += 1;
      mapa[key].total += val;
    });

    return Object.values(mapa)
      .filter(p => p.count > 0)
      .map(p => ({
        ...p,
        percentual: totalFaturado > 0 ? (p.total / totalFaturado) * 100 : 0
      }))
      .sort((a, b) => b.total - a.total);
  }, [pedidosFiltrados, totalFaturado]);

  // 7. Resumo Textual para WhatsApp / Compartilhar
  const handleCopiarResumo = () => {
    const periodoLabel = 
      periodo === 'hoje' ? 'Hoje' :
      periodo === '7dias' ? 'Últimos 7 dias' :
      periodo === '30dias' ? 'Últimos 30 dias' :
      periodo === 'mes' ? 'Este Mês' :
      periodo === 'custom' ? `Período: ${dataInicio} até ${dataFim}` : 'Todo o Histórico';

    let texto = `📊 *SANTIAGO BURGER - DASHBOARD DE INTELIGÊNCIA*\n`;
    texto += `📅 *Período:* ${periodoLabel}\n`;
    texto += `💰 *Faturamento Total:* ${formatCurrency(totalFaturado)} (${qtdPedidos} pedidos)\n`;
    texto += `🎯 *Ticket Médio:* ${formatCurrency(ticketMedioGeral)}\n\n`;

    texto += `🚀 *ONDE MAIS VENDE (CANAIS):*\n`;
    canaisData.lista.forEach(c => {
      texto += `• ${c.label}: ${formatCurrency(c.total)} (${c.percentual.toFixed(1)}%) - ${c.count} pedidos\n`;
    });

    if (bairrosData.top10.length > 0) {
      texto += `\n📍 *TOP BAIRROS DE ENTREGA:*\n`;
      bairrosData.top10.slice(0, 5).forEach((b, idx) => {
        texto += `${idx + 1}. ${b.nome}: ${b.entregas} entregas (${formatCurrency(b.total)})\n`;
      });
    }

    if (diasSemanaData.campeao) {
      texto += `\n⭐ *MELHOR DIA DA SEMANA:* ${diasSemanaData.campeao.nome} (${formatCurrency(diasSemanaData.campeao.total)} no período)\n`;
    }

    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  };

  return (
    <div className="h-full w-full bg-slate-100 flex flex-col overflow-y-auto p-2 sm:p-4 space-y-4">
      
      {/* ======================================================== */}
      {/* CABEÇALHO & FILTRO DE PERÍODO                            */}
      {/* ======================================================== */}
      <div className="bg-white border border-slate-300 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-900">
              <BarChart3 className="w-5 h-5 text-[#3b0764]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Dashboard de Vendas
            </h1>
            <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              Inteligência Comercial
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Descubra por onde mais vende, para qual bairro e qual é o seu melhor dia de faturamento.
          </p>
        </div>

        {/* Controles de Período e Ações */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Botões Rápidos de Período */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setPeriodo('hoje')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                periodo === 'hoje'
                  ? 'bg-[#3b0764] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => setPeriodo('7dias')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                periodo === '7dias'
                  ? 'bg-[#3b0764] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Dias
            </button>
            <button
              type="button"
              onClick={() => setPeriodo('30dias')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                periodo === '30dias'
                  ? 'bg-[#3b0764] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Dias
            </button>
            <button
              type="button"
              onClick={() => setPeriodo('mes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                periodo === 'mes'
                  ? 'bg-[#3b0764] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Este Mês
            </button>
            <button
              type="button"
              onClick={() => setPeriodo('todo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                periodo === 'todo'
                  ? 'bg-[#3b0764] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todo Período
            </button>
          </div>

          {/* Botão Copiar Resumo */}
          <button
            type="button"
            onClick={handleCopiarResumo}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
              copiado
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}
            title="Copiar relatório formatado para o WhatsApp"
          >
            {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{copiado ? 'Copiado p/ Zap!' : 'Copiar Resumo'}</span>
          </button>

          {/* Botão Bloquear Dashboard */}
          <button
            type="button"
            onClick={() => {
              lockDashboard();
              if (onBackToPdv) onBackToPdv();
            }}
            title="Bloquear Dashboard (Exigir PIN Gerencial para entrar novamente)"
            className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-[#3b0764] border border-purple-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <Lock className="w-3.5 h-3.5 text-purple-700" />
            <span>Bloquear</span>
          </button>

          {onBackToPdv && (
            <button
              type="button"
              onClick={onBackToPdv}
              className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
            >
              ← Voltar ao PDV
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* CARDS COM GRANDES NÚMEROS / DESTAQUES (KPIs)              */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* KPI 1: Faturamento Total */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider">Faturamento Total</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-mono font-black text-emerald-700">
            {formatCurrency(totalFaturado)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-semibold">
            <span>{qtdPedidos} pedidos registrados</span>
          </div>
          <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-5 pointer-events-none">
            <DollarSign className="w-20 h-20 text-emerald-900" />
          </div>
        </div>

        {/* KPI 2: Ticket Médio */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider">Ticket Médio</span>
            <ShoppingBag className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-mono font-black text-slate-900">
            {formatCurrency(ticketMedioGeral)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-semibold">
            Média gasta por pedido
          </div>
          <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-5 pointer-events-none">
            <ShoppingBag className="w-20 h-20 text-purple-900" />
          </div>
        </div>

        {/* KPI 3: Por Onde Mais Vende (Canal Campeão) */}
        <div className="bg-white border border-amber-200 bg-amber-50/30 rounded-2xl p-4 shadow-xs relative overflow-hidden ring-1 ring-amber-300/60">
          <div className="flex items-center justify-between text-amber-900 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Canal Campeão</span>
            </span>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
              {canaisData.campeao?.percentual.toFixed(0)}% vendas
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 truncate">
            {canaisData.campeao ? canaisData.campeao.label : 'Nenhum'}
          </div>
          <div className="text-[11px] text-slate-600 mt-1 font-mono font-bold">
            {canaisData.campeao ? formatCurrency(canaisData.campeao.total) : 'R$ 0,00'} • {canaisData.campeao?.count || 0} ped.
          </div>
        </div>

        {/* KPI 4: Para Qual Bairro Mais Vende (Bairro Campeão) */}
        <div className="bg-white border border-blue-200 bg-blue-50/30 rounded-2xl p-4 shadow-xs relative overflow-hidden ring-1 ring-blue-300/60">
          <div className="flex items-center justify-between text-blue-900 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Bairro Campeão</span>
            </span>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-200 text-blue-900">
              {bairrosData.campeao?.percentual.toFixed(0)}% entregas
            </span>
          </div>
          <div className="text-lg font-black text-slate-900 truncate" title={bairrosData.campeao?.nome}>
            {bairrosData.campeao ? bairrosData.campeao.nome : 'Nenhum'}
          </div>
          <div className="text-[11px] text-slate-600 mt-1 font-mono font-bold">
            {bairrosData.campeao?.entregas || 0} entregas • {formatCurrency(bairrosData.campeao?.total || 0)}
          </div>
        </div>

        {/* KPI 5: Melhor Dia da Semana */}
        <div className="bg-white border border-purple-200 bg-purple-50/40 rounded-2xl p-4 shadow-xs relative overflow-hidden ring-1 ring-purple-300/60">
          <div className="flex items-center justify-between text-purple-900 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-700" />
              <span>Melhor Dia</span>
            </span>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-purple-200 text-purple-950">
              Recordista
            </span>
          </div>
          <div className="text-xl font-black text-purple-950 truncate">
            {diasSemanaData.campeao ? diasSemanaData.campeao.nome : 'Nenhum'}
          </div>
          <div className="text-[11px] text-slate-600 mt-1 font-mono font-bold">
            Média {formatCurrency(diasSemanaData.campeao?.mediaPorOcorrencia || 0)} / {diasSemanaData.campeao?.curto || 'dia'}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* GRID DE DUAS COLUNAS PRINCIPAIS: CANAIS & DIAS           */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* ------------------------------------------------------ */}
        {/* BLOCO 1: POR ONDE MAIS VENDE (CANAIS)                  */}
        {/* ------------------------------------------------------ */}
        <div className="lg:col-span-6 bg-white border border-slate-300/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Por Onde Mais Vende</h2>
                  <p className="text-[11px] text-slate-500">Participação de cada canal no faturamento</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600">
                {canaisData.lista.length} canais ativos
              </span>
            </div>

            {/* Lista com Barras Visuais de Canais */}
            <div className="space-y-4">
              {canaisData.lista.map((canal, index) => {
                return (
                  <div key={canal.key} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {canal.key === 'ZAP' && <WhatsAppIcon className="w-4 h-4 text-emerald-600" />}
                        {canal.key === 'IFOOD' && <IFoodIcon className="h-3.5 w-auto text-rose-600" />}
                        {canal.key === '99F' && <NoventaIcon className="h-4 w-4" withBorder />}
                        {canal.key === 'BALCAO' && <Store className="w-4 h-4 text-purple-700" />}
                        {canal.key === 'OUTRO' && <ShoppingBag className="w-4 h-4 text-slate-500" />}
                        <span className="text-sm font-black text-slate-900">{canal.label}</span>
                        {index === 0 && (
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-amber-300">
                            1º Campeão
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-mono font-black text-slate-900">
                          {formatCurrency(canal.total)}
                        </span>
                        <span className="text-[11px] text-slate-500 font-bold ml-1.5">
                          ({canal.percentual.toFixed(1)}%)
                        </span>
                      </div>
                    </div>

                    {/* Barra de Progresso Visual */}
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${canal.percentual}%`,
                          backgroundColor: canal.color
                        }}
                      />
                    </div>

                    {/* Sub-informações: Pedidos e Ticket Médio */}
                    <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono">
                      <span>{canal.count} pedidos realizados</span>
                      <span>Ticket Médio: <strong>{formatCurrency(canal.ticketMedio)}</strong></span>
                    </div>
                  </div>
                );
              })}

              {canaisData.lista.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Nenhum pedido encontrado para o período selecionado.
                </div>
              )}
            </div>
          </div>

          {/* Dica Gerencial Automática */}
          {canaisData.campeao && (
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
              <div>
                <strong>Insight do Canal:</strong> O <strong>{canaisData.campeao.label}</strong> é sua principal fonte de faturamento ({canaisData.campeao.percentual.toFixed(0)}%).
                {canaisData.campeao.key === 'IFOOD' && ' Lembre-se de conferir as taxas de comissão da plataforma.'}
                {canaisData.campeao.key === 'ZAP' && ' Vendas diretas por WhatsApp são altamente lucrativas pois não pagam taxa de aplicativo!'}
              </div>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------ */}
        {/* BLOCO 2: MELHOR DIA DA SEMANA                          */}
        {/* ------------------------------------------------------ */}
        <div className="lg:col-span-6 bg-white border border-slate-300/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-900">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Melhor Dia de Vendas</h2>
                  <p className="text-[11px] text-slate-500">Comparativo dos 7 dias da semana</p>
                </div>
              </div>
              {diasSemanaData.campeao && (
                <span className="bg-purple-100 text-purple-950 font-black text-xs px-2.5 py-1 rounded-xl border border-purple-300">
                  ⭐ {diasSemanaData.campeao.nome}
                </span>
              )}
            </div>

            {/* Gráfico de Barras Verticais dos 7 Dias da Semana */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-2 pb-2">
              {diasSemanaData.dias.map(d => {
                const isCampeao = diasSemanaData.campeao?.id === d.id;
                const isVice = diasSemanaData.vice?.id === d.id;
                const alturaPorcento = diasSemanaData.maxTotal > 0 ? (d.total / diasSemanaData.maxTotal) * 100 : 0;

                return (
                  <div key={d.id} className="flex flex-col items-center">
                    {/* Badge de Campeão ou Valor */}
                    <div className="h-5 flex items-center justify-center mb-1">
                      {isCampeao && (
                        <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1 rounded shadow-xs" title="1º Melhor Dia">
                          1º
                        </span>
                      )}
                      {isVice && (
                        <span className="text-[9px] bg-slate-200 text-slate-700 font-black px-1 rounded" title="2º Melhor Dia">
                          2º
                        </span>
                      )}
                    </div>

                    {/* Coluna / Barra do Gráfico */}
                    <div className="w-full bg-slate-100 rounded-xl h-36 flex flex-col justify-end p-1 border border-slate-200 relative group cursor-pointer hover:border-purple-400 transition-all">
                      <div
                        className={`w-full rounded-lg transition-all duration-500 flex flex-col justify-end items-center pb-1 ${
                          isCampeao
                            ? 'bg-gradient-to-t from-purple-800 to-amber-500 shadow-md ring-2 ring-amber-300'
                            : isVice
                            ? 'bg-gradient-to-t from-purple-700 to-purple-500'
                            : d.total > 0
                            ? 'bg-purple-300/80 group-hover:bg-purple-400'
                            : 'bg-transparent'
                        }`}
                        style={{ height: `${Math.max(alturaPorcento, 4)}%` }}
                      >
                        {d.total > 0 && (
                          <span className="text-[9px] font-mono font-black text-white px-0.5 truncate hidden sm:inline">
                            {formatCurrency(d.total).split(',')[0]}
                          </span>
                        )}
                      </div>

                      {/* Tooltip ao passar o mouse */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 bg-slate-900 text-white text-[11px] p-2 rounded-xl shadow-xl whitespace-nowrap pointer-events-none">
                        <strong className="block text-amber-300">{d.nome}</strong>
                        <div>Total: {formatCurrency(d.total)}</div>
                        <div>Pedidos: {d.count}</div>
                        <div>Média/Dia: {formatCurrency(d.mediaPorOcorrencia)}</div>
                        <div>Ticket Médio: {formatCurrency(d.ticketMedio)}</div>
                      </div>
                    </div>

                    {/* Nome do Dia */}
                    <span className={`text-xs mt-1.5 font-bold ${
                      isCampeao ? 'text-amber-600 font-black' : 'text-slate-700'
                    }`}>
                      {d.curto}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {d.count} ped.
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Destaque do Melhor Dia */}
          {diasSemanaData.campeao && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-2">
              <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Seu melhor dia é {diasSemanaData.campeao.nome}:</strong> Com faturamento total de{' '}
                <strong>{formatCurrency(diasSemanaData.campeao.total)}</strong> ({diasSemanaData.campeao.count} pedidos) e média de{' '}
                <strong>{formatCurrency(diasSemanaData.campeao.mediaPorOcorrencia)}</strong> por ocorrência. Prepare reforço na chapa e nos motoboys!
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* SEÇÃO 3: PARA QUAL BAIRRO MAIS VENDE (RANKING GEOGRÁFICO)*/}
      {/* ======================================================== */}
      <div className="bg-white border border-slate-300/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-800">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                Para Qual Bairro Mais Vende (Caçapava)
              </h2>
              <p className="text-[11px] text-slate-500">
                Ranking das regiões que mais fazem pedidos de delivery ({bairrosData.totalEntregasDelivery} entregas no período)
              </p>
            </div>
          </div>

          {/* Alternador de Ordenação */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold hidden sm:inline">Ordenar por:</span>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setOrdenacaoBairro('pedidos')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  ordenacaoBairro === 'pedidos'
                    ? 'bg-[#3b0764] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mais Pedidos (Volume)
              </button>
              <button
                type="button"
                onClick={() => setOrdenacaoBairro('faturamento')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  ordenacaoBairro === 'faturamento'
                    ? 'bg-[#3b0764] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Maior Faturamento (R$)
              </button>
            </div>
          </div>
        </div>

        {/* Tabela / Cards dos Top Bairros */}
        <div className="space-y-2">
          {bairrosData.top10.map((b, index) => {
            const isTop1 = index === 0;
            const isTop2 = index === 1;
            const isTop3 = index === 2;
            const maxEntregas = bairrosData.top10[0]?.entregas || 1;
            const porcentoBarra = (b.entregas / maxEntregas) * 100;

            return (
              <div 
                key={b.nome}
                className={`p-3 rounded-xl border transition-all ${
                  isTop1
                    ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-300/60'
                    : isTop2
                    ? 'bg-slate-50 border-slate-300'
                    : isTop3
                    ? 'bg-orange-50/40 border-orange-200'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {/* Medalha / Posição */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                      isTop1
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
                        : isTop2
                        ? 'bg-slate-300 text-slate-800'
                        : isTop3
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {index + 1}º
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">{b.nome}</span>
                        {isTop1 && (
                          <span className="bg-amber-200 text-amber-900 text-[10px] font-black px-1.5 py-0.2 rounded uppercase">
                            Bairro Campeão
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {b.percentual.toFixed(1)}% do total de entregas • Taxas arrecadadas: {formatCurrency(b.taxasTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Estatísticas Numéricas */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 text-right">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Entregas</span>
                      <span className="text-sm font-mono font-black text-blue-700">
                        {b.entregas} pedidos
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Faturamento</span>
                      <span className="text-sm font-mono font-black text-emerald-700">
                        {formatCurrency(b.total)}
                      </span>
                    </div>
                    <div className="hidden md:block">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Ticket Médio</span>
                      <span className="text-xs font-mono font-bold text-slate-700">
                        {formatCurrency(b.ticketMedio)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mini barra de proporção visual */}
                <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden mt-2.5">
                  <div 
                    className={`h-full rounded-full ${
                      isTop1 ? 'bg-amber-500' : isTop2 ? 'bg-slate-500' : isTop3 ? 'bg-orange-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${porcentoBarra}%` }}
                  />
                </div>
              </div>
            );
          })}

          {bairrosData.lista.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs">
              Nenhuma entrega registrada no período para cálculo de bairros.
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* SEÇÃO 4: FORMAS DE PAGAMENTO & RECAP                     */}
      {/* ======================================================== */}
      <div className="bg-white border border-slate-300/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Formas de Pagamento Mais Utilizadas</h2>
            <p className="text-[11px] text-slate-500">Distribuição financeira por método de recebimento</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {pagamentosData.map(p => (
            <div key={p.label} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block">{p.label}</span>
                <span className="text-lg font-mono font-black text-slate-900">{formatCurrency(p.total)}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono mt-2 pt-2 border-t border-slate-200">
                <span>{p.count} vendas</span>
                <span className="font-bold text-emerald-700">{p.percentual.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
