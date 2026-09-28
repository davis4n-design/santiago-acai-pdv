import React, { useState, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Bike, 
  Store, 
  Check, 
  Plus, 
  Minus, 
  Search, 
  MapPin, 
  CreditCard, 
  QrCode, 
  Banknote, 
  ClockAlert, 
  Smartphone, 
  Receipt, 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  Trash2, 
  ArrowUpRight, 
  Clock, 
  User, 
  X,
  Flame,
  ArrowRight
} from 'lucide-react';
import { DEFAULT_BAIRROS, PAYMENT_METHODS, EXPENSE_CATEGORIES } from '../data/defaultData';
import { formatCurrency, formatTime, getTodayDateString, isRecordFromToday } from '../utils/formatters';

export default function MainDashboard({ 
  pedidos = [], 
  despesas = [], 
  fiados = [], 
  onRegistrarPedido, 
  onRegistrarDespesa, 
  onExcluirPedido,
  onVisualizarComprovante,
  soundEnabled = true 
}) {
  const todayStr = getTodayDateString();

  // ==========================================
  // ESTADO DO PDV RÁPIDO (NOVO PEDIDO)
  // ==========================================
  const [tipo, setTipo] = useState('Delivery');
  const [canal, setCanal] = useState('ZAP');
  const [bairro, setBairro] = useState('VAA');
  const [taxaEntrega, setTaxaEntrega] = useState(4.0);
  const [bairroSearch, setBairroSearch] = useState('');
  const [showBairroDropdown, setShowBairroDropdown] = useState(false);

  const [valorItensInput, setValorItensInput] = useState('');
  const [formaPagto, setFormaPagto] = useState('PIX');
  const [obs, setObs] = useState('');
  const [clienteFiado, setClienteFiado] = useState('');
  const [trocoPara, setTrocoPara] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(false);
  const [lastOrderInfo, setLastOrderInfo] = useState(null);

  const valorInputRef = useRef(null);

  // ==========================================
  // ESTADO DA DESPESA RÁPIDA
  // ==========================================
  const [categoriaDespesa, setCategoriaDespesa] = useState('Pães');
  const [valorDespesa, setValorDespesa] = useState('');
  const [obsDespesa, setObsDespesa] = useState('');
  const [salvandoDespesa, setSalvandoDespesa] = useState(false);

  // Pedidos e Despesas de Hoje
  const pedidosHoje = useMemo(() => {
    return pedidos.filter(p => isRecordFromToday(p));
  }, [pedidos]);

  const despesasHoje = useMemo(() => {
    return despesas.filter(d => isRecordFromToday(d));
  }, [despesas]);

  // KPIs
  const totalFaturadoHoje = useMemo(() => {
    return pedidosHoje.reduce((sum, p) => sum + (parseFloat(p.valor_total) || 0), 0);
  }, [pedidosHoje]);

  const qtdPedidosHoje = pedidosHoje.length;

  const totalDespesasHoje = useMemo(() => {
    return despesasHoje.reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);
  }, [despesasHoje]);

  const lucroLiquidoHoje = totalFaturadoHoje - totalDespesasHoje;
  const ticketMedio = qtdPedidosHoje > 0 ? totalFaturadoHoje / qtdPedidosHoje : 0;

  // Cálculos do Pedido Atual
  const valorItens = parseFloat(valorItensInput.replace(',', '.')) || 0;
  const taxaFinal = tipo === 'Delivery' ? (parseFloat(taxaEntrega) || 0) : 0;
  const valorTotal = Math.round((valorItens + taxaFinal) * 100) / 100;

  // Canais
  const deliveryChannels = [
    { id: 'ZAP', name: 'WhatsApp', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' },
    { id: 'IFOOD', name: 'iFood', color: 'text-red-700 bg-red-50 border-red-300' },
    { id: '99F', name: '99Food', color: 'text-orange-700 bg-orange-50 border-orange-300' }
  ];

  // Alternar Tipo
  const handleSelectTipo = (novoTipo) => {
    setTipo(novoTipo);
    if (novoTipo === 'Balcão') {
      setCanal('Balcão');
      setTaxaEntrega(0);
    } else {
      setCanal('ZAP');
      const bObj = DEFAULT_BAIRROS.find(b => b.nome === bairro);
      setTaxaEntrega(bObj ? bObj.taxa : 4.0);
    }
  };

  const handleSelectBairro = (nomeBairro, taxaPadrao) => {
    setBairro(nomeBairro);
    setTaxaEntrega(taxaPadrao);
    setBairroSearch('');
    setShowBairroDropdown(false);
  };

  const filteredBairros = useMemo(() => {
    if (!bairroSearch.trim()) return DEFAULT_BAIRROS;
    return DEFAULT_BAIRROS.filter(b => b.nome.toLowerCase().includes(bairroSearch.toLowerCase()));
  }, [bairroSearch]);

  const handleAddValor = (quantia) => {
    const atual = parseFloat(valorItensInput.replace(',', '.')) || 0;
    setValorItensInput((atual + quantia).toFixed(2));
  };

  const playSuccessSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      //
    }
  };

  const handleSubmitPedido = async (e) => {
    if (e) e.preventDefault();
    if (valorItens <= 0) {
      if (valorInputRef.current) valorInputRef.current.focus();
      return;
    }

    setSubmitting(true);

    let finalObs = obs.trim();
    if (formaPagto === 'DINHEIRO' && trocoPara) {
      finalObs = finalObs ? `${finalObs} | Troco p/ R$ ${trocoPara}` : `Troco p/ R$ ${trocoPara}`;
    }
    if (formaPagto === 'A REC') {
      const clienteNome = clienteFiado.trim() || 'Cliente Balcão';
      finalObs = finalObs ? `${finalObs} | Cliente: ${clienteNome}` : `Cliente: ${clienteNome}`;
    }

    const payload = {
      tipo,
      canal,
      bairro: tipo === 'Delivery' ? (bairro || 'Balcão') : 'Balcão',
      taxa_entrega: taxaFinal,
      valor_itens: valorItens,
      valor_total: valorTotal,
      forma_pagto: formaPagto,
      obs_pagto: finalObs,
      cliente_fiado: formaPagto === 'A REC' ? clienteFiado.trim() : null
    };

    try {
      const result = await onRegistrarPedido(payload);
      playSuccessSound();
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.85 },
        colors: ['#10b981', '#ea580c', '#3b82f6']
      });

      setSuccessAnimation(true);
      setLastOrderInfo({
        id: result?.pedido?.id || `PED-${Date.now().toString().slice(-4)}`,
        valorTotal,
        tipo,
        bairro: payload.bairro
      });

      // Limpeza imediata
      setValorItensInput('');
      setObs('');
      setTrocoPara('');
      setClienteFiado('');

      setTimeout(() => {
        setSuccessAnimation(false);
        if (valorInputRef.current) valorInputRef.current.focus();
      }, 1400);

    } finally {
      setSubmitting(false);
    }
  };

  // Salvar Despesa
  const handleSalvarDespesa = async (e) => {
    e.preventDefault();
    const val = parseFloat(valorDespesa.replace(',', '.')) || 0;
    if (val <= 0) return;

    setSalvandoDespesa(true);
    try {
      await onRegistrarDespesa({
        categoria: categoriaDespesa,
        valor: val,
        obs: obsDespesa.trim(),
        data: new Date().toISOString()
      });
      setValorDespesa('');
      setObsDespesa('');
    } finally {
      setSalvandoDespesa(false);
    }
  };

  // Distribuição por Canal (Gráfico Visual)
  const canalStats = useMemo(() => {
    const stats = {
      ZAP: { label: 'WhatsApp', total: 0, count: 0, color: 'bg-emerald-500' },
      IFOOD: { label: 'iFood', total: 0, count: 0, color: 'bg-red-500' },
      '99F': { label: '99Food', total: 0, count: 0, color: 'bg-orange-500' },
      'Balcão': { label: 'Balcão', total: 0, count: 0, color: 'bg-sky-500' }
    };
    pedidosHoje.forEach(p => {
      const c = p.canal || (p.tipo === 'Balcão' ? 'Balcão' : 'ZAP');
      if (stats[c]) {
        stats[c].total += parseFloat(p.valor_total) || 0;
        stats[c].count += 1;
      }
    });
    return stats;
  }, [pedidosHoje]);

  const topBairros = ['VAA', 'VP', 'ME', 'Centro', 'JD CPV', 'VMJ', 'PINUS'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-5 pb-28 md:pb-12 space-y-5">
      
      {/* Toast Notificação de Sucesso */}
      {successAnimation && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white font-extrabold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fadeIn">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-sm">
            Pedido #{lastOrderInfo?.id} Registado! ({formatCurrency(lastOrderInfo?.valorTotal)})
          </span>
        </div>
      )}

      {/* ======================================================== */}
      {/* LINHA 1: KPIS DO DASHBOARD EM DESIGN CLARO & MODERNO */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Faturado */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-1">
            <span>Faturado Hoje</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-600">
            {formatCurrency(totalFaturadoHoje)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            {qtdPedidosHoje} pedidos • Ticket médio: {formatCurrency(ticketMedio)}
          </div>
        </div>

        {/* Quantidade de Pedidos */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:border-sky-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-1">
            <span>Pedidos de Hoje</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-slate-900">
            {qtdPedidosHoje} <span className="text-xs font-semibold text-slate-500">pedidos</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Delivery: {pedidosHoje.filter(p => p.tipo === 'Delivery').length} | Balcão: {pedidosHoje.filter(p => p.tipo === 'Balcão').length}
          </div>
        </div>

        {/* Despesas do Dia */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:border-rose-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-1">
            <span>Despesas do Dia</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-rose-600">
            {formatCurrency(totalDespesasHoje)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            {despesasHoje.length} saídas registradas
          </div>
        </div>

        {/* Lucro Líquido */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:border-emerald-300 transition-colors bg-gradient-to-br from-white to-slate-50">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-1">
            <span>Lucro Líquido</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              lucroLiquidoHoje >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-mono font-black ${
            lucroLiquidoHoje >= 0 ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            {formatCurrency(lucroLiquidoHoje)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Faturamento - Despesas
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* LINHA 2: LAYOUT DE DASHBOARD (2 COLUNAS AO VIVO) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* ======================================================== */}
        {/* COLUNA ESQUERDA (7 colunas): PDV RÁPIDO DO BALCÃO */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
            
            {/* Cabeçalho do Card */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Novo Pedido no Balcão</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                    PDV Rápido
                  </span>
                </h2>
                <p className="text-xs text-slate-500">Lançamento em 3 toques</p>
              </div>

              {/* Botão Limpar Rápido */}
              {(valorItensInput || obs) && (
                <button
                  type="button"
                  onClick={() => {
                    setValorItensInput('');
                    setObs('');
                    setTrocoPara('');
                    setClienteFiado('');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 font-semibold"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
              )}
            </div>

            {/* PASSO 1: ALTERNADOR TIPO & CANAL */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleSelectTipo('Delivery')}
                  className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
                    tipo === 'Delivery'
                      ? 'bg-white text-orange-600 shadow-sm border border-slate-200/80 font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Bike className={`w-4 h-4 ${tipo === 'Delivery' ? 'text-orange-600' : 'text-slate-400'}`} />
                  <span>DELIVERY (Moto)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTipo('Balcão')}
                  className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
                    tipo === 'Balcão'
                      ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/80 font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Store className={`w-4 h-4 ${tipo === 'Balcão' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>BALCÃO (Local)</span>
                </button>
              </div>

              {/* Canais (Se Delivery) */}
              {tipo === 'Delivery' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Canal:
                  </span>
                  <div className="flex-1 grid grid-cols-3 gap-1.5">
                    {deliveryChannels.map((c) => {
                      const isSelected = canal === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setCanal(c.id)}
                          className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* SE FOR DELIVERY: BAIRRO E TAXA */}
            {tipo === 'Delivery' && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-orange-600" />
                    Bairro de Entrega:
                  </span>
                  <span className="text-emerald-700 font-mono font-bold">
                    Taxa Sugerida: {formatCurrency(taxaEntrega)}
                  </span>
                </div>

                {/* Chips de Bairros Rápidos */}
                <div className="flex flex-wrap gap-1.5">
                  {topBairros.map((bName) => {
                    const bObj = DEFAULT_BAIRROS.find(b => b.nome === bName);
                    const isSelected = bairro === bName;
                    return (
                      <button
                        key={bName}
                        type="button"
                        onClick={() => handleSelectBairro(bName, bObj?.taxa || 4.0)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
                          isSelected
                            ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span>{bName}</span>
                        <span className={`text-[10px] font-mono ${isSelected ? 'text-orange-100' : 'text-slate-400'}`}>
                          R${bObj?.taxa || 4}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Busca e Ajuste Manual da Taxa */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div className="sm:col-span-2 relative">
                    <input
                      type="text"
                      value={bairroSearch || (showBairroDropdown ? '' : bairro)}
                      onChange={(e) => {
                        setBairroSearch(e.target.value);
                        setShowBairroDropdown(true);
                      }}
                      onFocus={() => setShowBairroDropdown(true)}
                      placeholder="Outro bairro..."
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 font-medium"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />

                    {showBairroDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-40 overflow-y-auto p-1 divide-y divide-slate-100">
                        {filteredBairros.map((b) => (
                          <div
                            key={b.nome}
                            onClick={() => handleSelectBairro(b.nome, b.taxa)}
                            className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer flex justify-between"
                          >
                            <span className="font-semibold">{b.nome}</span>
                            <span className="font-mono text-emerald-600 font-bold">{formatCurrency(b.taxa)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-2 py-1">
                    <button
                      type="button"
                      onClick={() => setTaxaEntrega(prev => Math.max(0, parseFloat((prev - 1).toFixed(2))))}
                      className="w-7 h-7 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-mono font-bold text-emerald-600">
                      {formatCurrency(taxaEntrega)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTaxaEntrega(prev => parseFloat((prev + 1).toFixed(2)))}
                      className="w-7 h-7 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PASSO 2: VALOR DOS PRODUTOS & TOTAL DINÂMICO */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Valor dos Produtos (R$)
                </label>
                {valorItens > 0 && (
                  <span className="text-xs text-slate-500 font-medium">
                    Total c/ taxa: <strong className="text-emerald-600 font-mono font-extrabold text-sm">{formatCurrency(valorTotal)}</strong>
                  </span>
                )}
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-2xl pointer-events-none">
                  R$
                </span>
                <input
                  ref={valorInputRef}
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={valorItensInput}
                  onChange={(e) => setValorItensInput(e.target.value.replace(/[^0-9.,]/g, ''))}
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-orange-500 focus:bg-white rounded-2xl py-3.5 pl-14 pr-4 text-3xl sm:text-4xl font-mono font-black text-slate-900 placeholder-slate-300 focus:outline-none transition-colors"
                />
              </div>

              {/* Botões de Atalho Rápido */}
              <div className="grid grid-cols-5 gap-1.5">
                {[10, 20, 30, 50, 80].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAddValor(val)}
                    className="py-2 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 border border-slate-200/80 text-slate-700 text-xs font-mono font-bold transition-all active:scale-95"
                  >
                    +{val}
                  </button>
                ))}
              </div>
            </div>

            {/* PASSO 3: FORMA DE PAGAMENTO */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                Forma de Pagamento
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((pm) => {
                  const isSelected = formaPagto === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setFormaPagto(pm.id)}
                      className={`py-3 px-3 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-between transition-all duration-150 active:scale-[0.98] ${
                        isSelected
                          ? pm.id === 'PIX'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : pm.id === 'A REC'
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                            : 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {pm.id === 'PIX' && <QrCode className="w-4 h-4" />}
                        {pm.id === 'CREDITO' && <CreditCard className="w-4 h-4" />}
                        {pm.id === 'DEBITO' && <CreditCard className="w-4 h-4" />}
                        {pm.id === 'DINHEIRO' && <Banknote className="w-4 h-4" />}
                        {pm.id === 'A REC' && <ClockAlert className="w-4 h-4" />}
                        {pm.id === 'ON' && <Smartphone className="w-4 h-4" />}
                        <span>{pm.label}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>

              {/* Se Dinheiro: Troco */}
              {formaPagto === 'DINHEIRO' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 animate-fadeIn text-xs">
                  <span className="font-bold text-amber-900">Precisa de troco para quanto?</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {['Sem Troco', '50', '100'].map((trocoOption) => (
                      <button
                        key={trocoOption}
                        type="button"
                        onClick={() => setTrocoPara(trocoOption === 'Sem Troco' ? '' : trocoOption)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          (trocoOption === 'Sem Troco' && !trocoPara) || trocoPara === trocoOption
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white border-amber-300 text-amber-900'
                        }`}
                      >
                        {trocoOption === 'Sem Troco' ? 'Valor Exato' : `R$ ${trocoOption}`}
                      </button>
                    ))}
                    <input
                      type="text"
                      placeholder="Outro valor..."
                      value={trocoPara}
                      onChange={(e) => setTrocoPara(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-24 bg-white border border-amber-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Se Fiado: Cliente */}
              {formaPagto === 'A REC' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 animate-fadeIn text-xs">
                  <span className="font-bold text-amber-900">Cliente devedor (Mensalista):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['ADRIANO', 'FELIPE', 'HUDSON', 'TIO NALDO', 'ANA RITA'].map((nome) => (
                      <button
                        key={nome}
                        type="button"
                        onClick={() => setClienteFiado(nome)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          clienteFiado.toUpperCase() === nome
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white border-amber-200 text-amber-900'
                        }`}
                      >
                        {nome}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Digitar nome do cliente..."
                    value={clienteFiado}
                    onChange={(e) => setClienteFiado(e.target.value.toUpperCase())}
                    className="w-full bg-white border border-amber-300 rounded-xl py-2 px-3 text-xs font-bold uppercase text-slate-900"
                  />
                </div>
              )}
            </div>

            {/* Observações */}
            <div>
              <input
                type="text"
                placeholder="Observação (opcional: sem maionese, ponto da carne, etc.)..."
                value={obs}
                onChange={(e) => setObs(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
              />
            </div>

            {/* BOTÃO FINALIZAR PEDIDO (DESTAQUE NOVO EM ESMERALDA CLARO) */}
            <div className="pt-2">
              <button
                type="button"
                disabled={valorItens <= 0 || submitting}
                onClick={handleSubmitPedido}
                className={`w-full py-4 px-6 rounded-2xl font-black text-base sm:text-lg tracking-wide flex items-center justify-center gap-3 transition-all duration-200 shadow-md active:scale-[0.98] ${
                  valorItens > 0
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 cursor-pointer'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>A REGISTRAR PEDIDO...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-6 h-6 stroke-[3]" />
                    <span>REGISTRAR PEDIDO</span>
                    {valorTotal > 0 && (
                      <span className="bg-black/20 px-3 py-1 rounded-xl text-white font-mono font-black text-sm sm:text-base">
                        {formatCurrency(valorTotal)}
                      </span>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* COLUNA DIREITA (5 colunas): PAINEL VIVO DO CAIXA */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* CARD: LANÇAMENTO RÁPIDO DE DESPESA */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-600" />
                <span>Lançar Despesa do Caixa</span>
              </h3>
              <span className="text-xs text-rose-600 font-mono font-bold">
                Total Hoje: {formatCurrency(totalDespesasHoje)}
              </span>
            </div>

            {/* Categorias em Chips Claros */}
            <div className="flex flex-wrap gap-1.5">
              {EXPENSE_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoriaDespesa(cat.label)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                    categoriaDespesa === cat.label
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Form Despesa */}
            <form onSubmit={handleSalvarDespesa} className="flex gap-2 pt-1">
              <div className="relative w-28">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                  R$
                </span>
                <input
                  type="text"
                  placeholder="0,00"
                  value={valorDespesa}
                  onChange={(e) => setValorDespesa(e.target.value.replace(/[^0-9.,]/g, ''))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-8 pr-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <input
                type="text"
                placeholder="Obs: Nota 272, Padaria..."
                value={obsDespesa}
                onChange={(e) => setObsDespesa(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500"
              />

              <button
                type="submit"
                disabled={!valorDespesa || salvandoDespesa}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  valorDespesa
                    ? 'bg-rose-600 hover:bg-rose-500 text-white font-extrabold shadow-xs'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
              >
                Salvar
              </button>
            </form>
          </div>

          {/* CARD: VENDAS POR CANAL (GRÁFICO VISUAL) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-100 pb-2">
              <span>Distribuição de Vendas Hoje</span>
              <span className="font-mono text-emerald-600 font-extrabold">{formatCurrency(totalFaturadoHoje)}</span>
            </div>

            <div className="space-y-2">
              {Object.entries(canalStats).map(([key, item]) => {
                const pct = totalFaturadoHoje > 0 ? Math.round((item.total / totalFaturadoHoje) * 100) : 0;
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600 font-medium">
                      <span>{item.label} ({item.count} ped.)</span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatCurrency(item.total)} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CARD: ÚLTIMOS PEDIDOS DO DIA AO VIVO */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Últimos Pedidos de Hoje ({pedidosHoje.length})
              </h3>
              <span className="text-[11px] text-slate-400">Em tempo real</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {pedidosHoje.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Nenhum pedido registado hoje ainda.
                </div>
              ) : (
                pedidosHoje.slice(0, 8).map((p) => {
                  const isDelivery = p.tipo === 'Delivery';
                  return (
                    <div
                      key={p.id}
                      className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                          isDelivery ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {isDelivery ? <Bike className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            <span>#{p.id}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {p.data || p.dia ? formatTime(p.data || p.dia) : ''}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {isDelivery ? `${p.canal} • ${p.bairro}` : 'Balcão'} • {p.forma_pagto}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-emerald-600 text-sm">
                          {formatCurrency(p.valor_total)}
                        </span>
                        {onVisualizarComprovante && (
                          <button
                            type="button"
                            onClick={() => onVisualizarComprovante(p)}
                            title="Ver Cupom"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
