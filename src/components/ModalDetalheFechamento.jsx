import React from 'react';
import { 
  X, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  Info, 
  Calendar, 
  ShoppingBag,
  Store,
  CreditCard,
  Banknote,
  QrCode,
  ClockAlert,
  Smartphone,
  CheckCircle2,
  FileSpreadsheet,
  ArrowRight
} from 'lucide-react';
import { formatCurrency, getTodayDateString } from '../utils/formatters';

export default function ModalDetalheFechamento({
  tipo = 'despesas', // 'despesas' | 'lucro' | 'faturado'
  isOpen,
  onClose,
  pedidosHoje = [],
  despesasHoje = [],
  totalFaturadoHoje = 0,
  totalDespesasHoje = 0,
  lucroLiquidoHoje = 0,
  platformFees = {}
}) {
  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Cálculo das taxas de plataformas retidas hoje (iFood / 99Food)
  const totalTaxasPlataformas = pedidosHoje.reduce((sum, p) => {
    const feePct = p.taxa_plataforma_percent || platformFees[p.canal] || 0;
    const vTotal = parseFloat(p.valor_total) || 0;
    return sum + (p.valor_taxa_plataforma || (vTotal * (feePct / 100)));
  }, 0);

  const faturamentoLiquidoVendas = Math.max(0, totalFaturadoHoje - totalTaxasPlataformas);
  const lucroRealComTaxas = faturamentoLiquidoVendas - totalDespesasHoje;

  // Resumo por forma de pagamento
  const pagtosResumo = pedidosHoje.reduce((acc, p) => {
    const f = p.forma_pagto || 'PIX';
    if (!acc[f]) acc[f] = { total: 0, count: 0 };
    acc[f].total += parseFloat(p.valor_total) || 0;
    acc[f].count += 1;
    return acc;
  }, {});

  // Resumo por canal
  const canaisResumo = pedidosHoje.reduce((acc, p) => {
    const c = p.canal || 'Balcão';
    if (!acc[c]) acc[c] = { total: 0, count: 0 };
    acc[c].total += parseFloat(p.valor_total) || 0;
    acc[c].count += 1;
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn select-none">
      <div className="bg-white border border-slate-300 w-full max-w-2xl rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto animate-scaleUp">
        
        {/* Header do Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${
              tipo === 'despesas' 
                ? 'bg-rose-100 text-rose-700' 
                : tipo === 'lucro'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-purple-100 text-purple-900'
            }`}>
              {tipo === 'despesas' && <TrendingDown className="w-5 h-5" />}
              {tipo === 'lucro' && <TrendingUp className="w-5 h-5" />}
              {tipo === 'faturado' && <DollarSign className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {tipo === 'despesas' && 'Detalhamento de Despesas do Dia'}
                {tipo === 'lucro' && 'Demonstrativo de Lucro do Dia (Como é Calculado)'}
                {tipo === 'faturado' && 'Detalhamento do Faturamento do Dia'}
              </h2>
              <p className="text-xs text-slate-500 capitalize">{todayStr}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* ABA: DETALHAMENTO DE DESPESAS                            */}
        {/* ======================================================== */}
        {tipo === 'despesas' && (
          <div className="space-y-4">
            {/* Card com Resumo do Valor Total */}
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-800 block">
                  Total de Despesas de Hoje
                </span>
                <span className="text-2xl sm:text-3xl font-mono font-black text-rose-700">
                  {formatCurrency(totalDespesasHoje)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-rose-800 bg-white/80 px-2.5 py-1 rounded-xl border border-rose-200">
                  {despesasHoje.length} {despesasHoje.length === 1 ? 'lançamento' : 'lançamentos'}
                </span>
              </div>
            </div>

            {/* Listagem de cada Despesa que compõe o número */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-purple-700" />
                <span>Origem dos Valores (Itens Lançados Hoje)</span>
              </span>

              {despesasHoje.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <p className="text-xs font-bold text-slate-600">Nenhuma despesa registrada para o dia de hoje.</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    As despesas são lidas diretamente da sua Planilha Google ou lançadas pelo caixa.
                  </p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {despesasHoje.map((d, index) => {
                    const diaInfo = d.dia ? `Dia ${d.dia}` : (d.data ? String(d.data).slice(0, 10) : 'Hoje');
                    return (
                      <div 
                        key={d.id || index}
                        className="p-3 bg-slate-50 hover:bg-slate-100/90 rounded-2xl border border-slate-200 flex items-center justify-between text-xs transition-all"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-sm">
                              {d.categoria || 'Despesa Geral'}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                              {diaInfo}
                            </span>
                          </div>
                          {d.obs && (
                            <p className="text-[11px] text-slate-500 font-medium italic">
                              Nota / Obs: {d.obs}
                            </p>
                          )}
                          <span className="text-[10px] text-slate-400 block font-mono">
                            Origem: Planilha Google (Aba DESPESAS)
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="font-mono font-black text-rose-600 text-base block">
                            -{formatCurrency(d.valor)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Explicação de como editar ou zerar */}
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1">
              <span className="font-black flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-amber-700" />
                Como alterar ou remover essa despesa:
              </span>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                Este valor de <strong>{formatCurrency(totalDespesasHoje)}</strong> está lançado na sua <strong>Planilha Google</strong> (aba de despesas ou fechamento no dia 28). Para alterar ou zerar, basta abrir a planilha e editar a linha correspondente que o caixa atualizará sozinho!
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ABA: DEMONSTRATIVO DO LUCRO DO DIA                       */}
        {/* ======================================================== */}
        {tipo === 'lucro' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              O Lucro do Dia é calculado de forma transparente através do demonstrativo abaixo:
            </p>

            {/* Passo a Passo do Cálculo Matemático */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 font-mono text-xs">
              
              {/* 1. (+) Faturamento Bruto */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-xs">
                    +
                  </span>
                  <div>
                    <span className="font-black text-slate-900 text-xs">Faturamento Bruto de Hoje</span>
                    <span className="text-[10px] text-slate-500 font-sans block">
                      Total de {pedidosHoje.length} {pedidosHoje.length === 1 ? 'pedido' : 'pedidos'} realizados hoje
                    </span>
                  </div>
                </div>
                <span className="text-base font-black text-emerald-600">
                  +{formatCurrency(totalFaturadoHoje)}
                </span>
              </div>

              {/* 2. (-) Taxas de Plataformas */}
              {totalTaxasPlataformas > 0 && (
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-800 font-black flex items-center justify-center text-xs">
                      -
                    </span>
                    <div>
                      <span className="font-black text-slate-900 text-xs">Comissões de Apps (iFood / 99Food)</span>
                      <span className="text-[10px] text-slate-500 font-sans block">
                        Taxas retidas pelas plataformas de entrega
                      </span>
                    </div>
                  </div>
                  <span className="text-base font-black text-orange-700">
                    -{formatCurrency(totalTaxasPlataformas)}
                  </span>
                </div>
              )}

              {/* 3. (-) Total de Despesas */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-800 font-black flex items-center justify-center text-xs">
                    -
                  </span>
                  <div>
                    <span className="font-black text-slate-900 text-xs">Despesas do Dia</span>
                    <span className="text-[10px] text-slate-500 font-sans block">
                      Gastos com fornecedores/insumos lançados para hoje (ex: Fatinha, pães)
                    </span>
                  </div>
                </div>
                <span className="text-base font-black text-rose-600">
                  -{formatCurrency(totalDespesasHoje)}
                </span>
              </div>

              {/* 4. (=) RESULTADO FINAL / LUCRO */}
              <div className="flex items-center justify-between pt-1 bg-white p-3 rounded-xl border border-slate-300 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#3b0764] text-white font-black flex items-center justify-center text-xs">
                    =
                  </span>
                  <div>
                    <span className="font-black text-sm text-[#3b0764]">LUCRO LÍQUIDO DO DIA</span>
                    <span className="text-[10px] text-slate-500 font-sans block">
                      O que realmente sobra no caixa da empresa
                    </span>
                  </div>
                </div>
                <span className={`text-xl font-black ${
                  lucroLiquidoHoje >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {formatCurrency(lucroLiquidoHoje)}
                </span>
              </div>

            </div>

            {/* Dica Informativa */}
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-[11px] text-purple-950 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0" />
              <span>
                Cálculo realizado em tempo real com base nos pedidos lançados no terminal e nas despesas registradas na planilha.
              </span>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ABA: DETALHAMENTO DO FATURAMENTO DO DIA                  */}
        {/* ======================================================== */}
        {tipo === 'faturado' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 block">
                  Faturamento Total de Hoje
                </span>
                <span className="text-2xl sm:text-3xl font-mono font-black text-emerald-700">
                  {formatCurrency(totalFaturadoHoje)}
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-white px-3 py-1 rounded-xl border border-emerald-200">
                {pedidosHoje.length} pedidos
              </span>
            </div>

            {/* Divisão por Formas de Pagamento */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Recebimento por Forma de Pagamento
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(pagtosResumo).map(([forma, item]) => (
                  <div key={forma} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">{forma}</span>
                      <span className="text-[10px] text-slate-400">{item.count} pedidos</span>
                    </div>
                    <span className="font-mono font-black text-slate-900">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Divisão por Canais */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Vendas por Canal
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(canaisResumo).map(([canal, item]) => (
                  <div key={canal} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">{canal}</span>
                      <span className="text-[10px] text-slate-400">{item.count} pedidos</span>
                    </div>
                    <span className="font-mono font-black text-slate-900">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Rodapé do Modal */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition-all cursor-pointer shadow-xs active:scale-95"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
