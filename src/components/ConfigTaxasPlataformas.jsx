import React, { useState, useEffect } from 'react';
import { 
  Percent, 
  Settings, 
  Save, 
  Check, 
  RotateCcw, 
  DollarSign, 
  Smartphone, 
  Info,
  TrendingDown,
  ArrowRight
} from 'lucide-react';
import { getPlatformFees, savePlatformFees, DEFAULT_PLATFORM_FEES } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { IFoodIcon, NoventaIcon } from './BrandIcons';

export default function ConfigTaxasPlataformas({ pedidosHoje = [], onClose }) {
  const [fees, setFees] = useState(DEFAULT_PLATFORM_FEES);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testValor, setTestValor] = useState('50.00');

  useEffect(() => {
    setFees(getPlatformFees());
  }, []);

  const handleChange = (canal, value) => {
    const num = parseFloat(value.replace(',', '.')) || 0;
    setFees(prev => ({
      ...prev,
      [canal]: num
    }));
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    savePlatformFees(fees);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    setFees(DEFAULT_PLATFORM_FEES);
    savePlatformFees(DEFAULT_PLATFORM_FEES);
  };

  // Cálculo do simulador de teste
  const simVal = parseFloat(testValor) || 0;
  const simIfoodTaxa = simVal * ((fees.IFOOD || 15.5) / 100);
  const simIfoodLiquido = simVal - simIfoodTaxa;

  // Total de taxas retidas pelas plataformas nos pedidos de hoje
  const statsHoje = pedidosHoje.reduce((acc, p) => {
    const canal = p.canal;
    const taxaPct = p.taxa_plataforma_percent || fees[canal] || 0;
    const valTotal = parseFloat(p.valor_total) || 0;
    const taxaRetida = p.valor_taxa_plataforma || (valTotal * (taxaPct / 100));

    if (canal === 'IFOOD') {
      acc.ifoodBruto += valTotal;
      acc.ifoodRetido += taxaRetida;
      acc.ifoodLiquido += (valTotal - taxaRetida);
    } else if (canal === '99F') {
      acc.noventaBruto += valTotal;
      acc.noventaRetido += taxaRetida;
      acc.noventaLiquido += (valTotal - taxaRetida);
    }
    return acc;
  }, { ifoodBruto: 0, ifoodRetido: 0, ifoodLiquido: 0, noventaBruto: 0, noventaRetido: 0, noventaLiquido: 0 });

  return (
    <div className="h-full w-full bg-white border border-slate-300 rounded-3xl p-5 sm:p-6 overflow-y-auto space-y-5">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-orange-100 text-orange-700">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#3b0764]">Configuração de Taxas das Plataformas</h2>
            <p className="text-xs text-slate-500">
              Ajuste as comissões cobradas por iFood, 99Food e outros canais para cálculo do lucro líquido
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#3b0764] text-white rounded-xl text-xs font-bold hover:bg-purple-900 transition-all self-start sm:self-auto"
          >
            ← Voltar ao Terminal PDV
          </button>
        )}
      </div>

      {/* Grid de Configurações das Plataformas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* CARD IFOOD */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white rounded-xl border border-red-200 shadow-2xs">
                <IFoodIcon className="h-4 w-auto" color="#ea1d2c" />
              </div>
              <h3 className="font-black text-slate-900 text-base">iFood</h3>
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full font-mono">
              Atual: {fees.IFOOD || 15.5}%
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Comissão padrão cobrada pelo iFood sobre o total das vendas.
          </p>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Percentual da Taxa (%):
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={fees.IFOOD ?? 15.5}
                onChange={(e) => handleChange('IFOOD', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 font-mono font-black text-lg text-slate-900 focus:outline-none focus:border-red-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                %
              </span>
            </div>
          </div>

          {/* Atalhos com planos padrão do iFood */}
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Planos comuns:</span>
            {[12.0, 15.5, 18.0, 23.0].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => handleChange('IFOOD', val.toString())}
                className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-white border border-slate-300 text-slate-700 hover:border-red-500 hover:text-red-700 active:scale-95 cursor-pointer"
              >
                {val}%
              </button>
            ))}
          </div>
        </div>

        {/* CARD 99FOOD */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <NoventaIcon className="h-6 w-6" withBorder={true} />
              <h3 className="font-black text-slate-900 text-base">99Food</h3>
            </div>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full font-mono">
              Atual: {fees['99F'] || 15.5}%
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Comissão padrão cobrada pelo 99Food sobre o total das vendas.
          </p>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Percentual da Taxa (%):
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={fees['99F'] ?? 15.5}
                onChange={(e) => handleChange('99F', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 font-mono font-black text-lg text-slate-900 focus:outline-none focus:border-orange-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                %
              </span>
            </div>
          </div>

          {/* Atalhos com planos padrão do 99Food */}
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Planos comuns:</span>
            {[12.0, 15.5, 18.0, 20.0].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => handleChange('99F', val.toString())}
                className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-white border border-slate-300 text-slate-700 hover:border-orange-500 hover:text-orange-700 active:scale-95"
              >
                {val}%
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* SIMULADOR AO VIVO */}
      <div className="bg-gradient-to-r from-purple-50 via-slate-50 to-amber-50 border border-purple-200 rounded-3xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#3b0764]" />
          <h3 className="font-extrabold text-slate-900 text-sm">Simulador em Tempo Real</h3>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-48">
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Exemplo de Pedido (R$):
            </label>
            <input
              type="number"
              value={testValor}
              onChange={(e) => setTestValor(e.target.value)}
              className="w-full bg-white border border-purple-300 rounded-xl py-2 px-3 font-mono font-bold text-slate-900 text-sm focus:outline-none"
            />
          </div>

          <div className="flex-1 grid grid-cols-3 gap-2 w-full text-center">
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Valor Bruto</span>
              <span className="text-base font-mono font-black text-slate-900">{formatCurrency(simVal)}</span>
            </div>

            <div className="bg-red-50 p-3 rounded-2xl border border-red-200 shadow-2xs">
              <span className="text-[10px] text-red-700 uppercase font-bold block">Taxa ({fees.IFOOD || 15.5}%)</span>
              <span className="text-base font-mono font-black text-red-600">-{formatCurrency(simIfoodTaxa)}</span>
            </div>

            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 shadow-2xs">
              <span className="text-[10px] text-emerald-800 uppercase font-bold block">Repasse Líquido</span>
              <span className="text-base font-mono font-black text-emerald-700">{formatCurrency(simIfoodLiquido)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RESUMO DAS COMISSÕES RETIDAS HOJE */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
          Impacto das Taxas de Plataformas nos Pedidos de Hoje
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl space-y-1">
            <div className="flex justify-between font-bold text-red-900">
              <span>iFood Hoje:</span>
              <span className="font-mono">{formatCurrency(statsHoje.ifoodBruto)}</span>
            </div>
            <div className="flex justify-between text-red-700">
              <span>Comissão Retida iFood:</span>
              <span className="font-mono font-bold">-{formatCurrency(statsHoje.ifoodRetido)}</span>
            </div>
            <div className="flex justify-between text-slate-800 pt-1 border-t border-red-200 font-extrabold">
              <span>Líquido a Receber:</span>
              <span className="font-mono text-emerald-700">{formatCurrency(statsHoje.ifoodLiquido)}</span>
            </div>
          </div>

          <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-xl space-y-1">
            <div className="flex justify-between font-bold text-orange-900">
              <span>99Food Hoje:</span>
              <span className="font-mono">{formatCurrency(statsHoje.noventaBruto)}</span>
            </div>
            <div className="flex justify-between text-orange-700">
              <span>Comissão Retida 99Food:</span>
              <span className="font-mono font-bold">-{formatCurrency(statsHoje.noventaRetido)}</span>
            </div>
            <div className="flex justify-between text-slate-800 pt-1 border-t border-orange-200 font-extrabold">
              <span>Líquido a Receber:</span>
              <span className="font-mono text-emerald-700">{formatCurrency(statsHoje.noventaLiquido)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restaurar Padrão (15,5%)</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer"
        >
          {savedSuccess ? <Check className="w-4 h-4 stroke-[3]" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'TAXAS SALVAS COM SUCESSO!' : 'SALVAR TAXAS'}</span>
        </button>
      </div>

    </div>
  );
}
