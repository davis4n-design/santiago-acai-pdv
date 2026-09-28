import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Receipt, 
  DollarSign, 
  Calendar, 
  Plus, 
  Check, 
  Trash2, 
  Copy, 
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../data/defaultData';
import { formatCurrency, formatDate, getTodayDateString, getRecordDateString } from '../utils/formatters';

export default function DashboardFechamento({ 
  pedidos = [], 
  despesas = [], 
  onRegistrarDespesa, 
  onExcluirDespesa 
}) {
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  
  // Despesa rápida
  const [categoria, setCategoria] = useState('Pães');
  const [valorDespesa, setValorDespesa] = useState('');
  const [obsDespesa, setObsDespesa] = useState('');
  const [salvandoDespesa, setSalvandoDespesa] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Pedidos do dia
  const pedidosDoDia = useMemo(() => {
    return pedidos.filter(p => {
      const dStr = getRecordDateString(p);
      return dStr === selectedDate;
    });
  }, [pedidos, selectedDate]);

  // Despesas do dia
  const despesasDoDia = useMemo(() => {
    return despesas.filter(d => {
      const dStr = getRecordDateString(d);
      return dStr === selectedDate;
    });
  }, [despesas, selectedDate]);

  // Totais
  const totalFaturado = useMemo(() => {
    return pedidosDoDia.reduce((sum, p) => sum + (parseFloat(p.valor_total) || 0), 0);
  }, [pedidosDoDia]);

  const qtdPedidos = pedidosDoDia.length;

  const totalDespesas = useMemo(() => {
    return despesasDoDia.reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);
  }, [despesasDoDia]);

  const lucroLiquido = totalFaturado - totalDespesas;
  const ticketMedio = qtdPedidos > 0 ? (totalFaturado / qtdPedidos) : 0;

  // Distribuição por Canal
  const canalStats = useMemo(() => {
    const stats = {
      ZAP: { label: 'WhatsApp', count: 0, total: 0, color: 'bg-emerald-500' },
      IFOOD: { label: 'iFood', count: 0, total: 0, color: 'bg-rose-500' },
      '99F': { label: '99Food', count: 0, total: 0, color: 'bg-orange-500' },
      'Balcão': { label: 'Balcão', count: 0, total: 0, color: 'bg-sky-500' }
    };

    pedidosDoDia.forEach(p => {
      const c = p.canal || (p.tipo === 'Balcão' ? 'Balcão' : 'ZAP');
      if (stats[c]) {
        stats[c].count += 1;
        stats[c].total += parseFloat(p.valor_total) || 0;
      }
    });

    return stats;
  }, [pedidosDoDia]);

  // Pagamentos
  const pagtoStats = useMemo(() => {
    const map = {};
    pedidosDoDia.forEach(p => {
      const f = p.forma_pagto || 'PIX';
      if (!map[f]) map[f] = { count: 0, total: 0 };
      map[f].count += 1;
      map[f].total += parseFloat(p.valor_total) || 0;
    });
    return map;
  }, [pedidosDoDia]);

  const handleSalvarDespesa = async (e) => {
    e.preventDefault();
    const val = parseFloat(valorDespesa.replace(',', '.')) || 0;
    if (val <= 0) return;

    setSalvandoDespesa(true);
    try {
      await onRegistrarDespesa({
        categoria,
        valor: val,
        obs: obsDespesa.trim(),
        data: `${selectedDate}T${new Date().toTimeString().split(' ')[0]}.000Z`
      });
      setValorDespesa('');
      setObsDespesa('');
    } finally {
      setSalvandoDespesa(false);
    }
  };

  const handleCopyFechamento = () => {
    const dateFormatted = formatDate(selectedDate);
    let text = `📊 *FECHAMENTO DIÁRIO - ${dateFormatted}*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `💰 Faturamento: ${formatCurrency(totalFaturado)}\n`;
    text += `📦 Pedidos: ${qtdPedidos} (Ticket Médio: ${formatCurrency(ticketMedio)})\n`;
    text += `💸 Despesas: ${formatCurrency(totalDespesas)}\n`;
    text += `✨ *LUCRO LÍQUIDO:* ${formatCurrency(lucroLiquido)}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🛵 *Canais:*\n`;
    Object.entries(canalStats).forEach(([k, v]) => {
      if (v.count > 0) text += `• ${v.label}: ${v.count} ped. (${formatCurrency(v.total)})\n`;
    });
    text += `\n💳 *Pagamentos:*\n`;
    Object.entries(pagtoStats).forEach(([k, v]) => {
      text += `• ${k}: ${formatCurrency(v.total)} (${v.count}x)\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 pb-28 md:pb-16 space-y-5">
      
      {/* Top Bar Clean: Seletor de Data & Copiar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Fechamento do Caixa Diário</h1>
          <p className="text-xs text-slate-500">Relatório consolidado para conferência de caixa</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-800 text-xs font-bold focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleCopyFechamento}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition-all shadow-xs"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSummary ? 'Copiado!' : 'Copiar Resumo WhatsApp'}</span>
          </button>
        </div>
      </div>

      {/* 4 Cards de KPIs Clean */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] text-slate-500 font-bold uppercase block mb-1">Faturado</span>
          <div className="text-2xl font-mono font-black text-emerald-600">
            {formatCurrency(totalFaturado)}
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
            Ticket médio: {formatCurrency(ticketMedio)}
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] text-slate-500 font-bold uppercase block mb-1">Pedidos</span>
          <div className="text-2xl font-mono font-black text-slate-900">
            {qtdPedidos}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            {pedidosDoDia.filter(p => p.tipo === 'Delivery').length} moto • {pedidosDoDia.filter(p => p.tipo === 'Balcão').length} balcão
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] text-slate-500 font-bold uppercase block mb-1">Despesas</span>
          <div className="text-2xl font-mono font-black text-rose-600">
            {formatCurrency(totalDespesas)}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            {despesasDoDia.length} lançamentos
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] text-slate-500 font-bold uppercase block mb-1">Lucro Líquido</span>
          <div className={`text-2xl font-mono font-black ${lucroLiquido >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(lucroLiquido)}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Faturado - Despesas
          </span>
        </div>
      </div>

      {/* Gráficos Visuais: Canais & Pagamentos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Canais */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-100 pb-2">
            <span>Vendas por Canal</span>
            <span className="font-mono text-emerald-600 font-extrabold">{formatCurrency(totalFaturado)}</span>
          </div>

          <div className="space-y-2.5">
            {Object.entries(canalStats).map(([k, item]) => {
              const pct = totalFaturado > 0 ? Math.round((item.total / totalFaturado) * 100) : 0;
              return (
                <div key={k} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600 font-medium">
                    <span>{item.label} ({item.count} ped.)</span>
                    <span className="font-mono font-bold text-slate-900">{formatCurrency(item.total)} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pagamentos */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-100 pb-2">
            <span>Formas de Pagamento</span>
            <span className="text-slate-400">{Object.keys(pagtoStats).length} formas usadas</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map(pm => {
              const stat = pagtoStats[pm.id] || { count: 0, total: 0 };
              return (
                <div key={pm.id} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
                  <span className="text-[11px] text-slate-500 block font-semibold">{pm.label}</span>
                  <span className="text-base font-mono font-black text-slate-900 mt-1 block">
                    {formatCurrency(stat.total)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{stat.count} pedidos</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Extrato de Despesas */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
          Despesas Registadas Nesta Data ({despesasDoDia.length})
        </h3>

        {despesasDoDia.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            Nenhuma despesa registrada nesta data.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {despesasDoDia.map(d => (
              <div key={d.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">{d.categoria}</span>
                  {d.obs && <span className="text-slate-500 ml-2">({d.obs})</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-rose-600 text-sm">{formatCurrency(d.valor)}</span>
                  {onExcluirDespesa && (
                    <button
                      type="button"
                      onClick={() => onExcluirDespesa(d.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
