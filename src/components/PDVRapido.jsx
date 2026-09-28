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
  User, 
  X,
  FileText
} from 'lucide-react';
import { DEFAULT_BAIRROS, PAYMENT_METHODS } from '../data/defaultData';
import { formatCurrency } from '../utils/formatters';

export default function PDVRapido({ onRegistrarPedido, fiados = [], soundEnabled = true }) {
  // Estado do formulário
  const [tipo, setTipo] = useState('Delivery'); // 'Delivery' | 'Balcão'
  const [canal, setCanal] = useState('ZAP'); // 'ZAP' | 'IFOOD' | '99F' | 'Balcão'
  
  // Delivery
  const [bairro, setBairro] = useState('VAA');
  const [taxaEntrega, setTaxaEntrega] = useState(4.0);
  const [bairroSearch, setBairroSearch] = useState('');
  const [showBairroDropdown, setShowBairroDropdown] = useState(false);

  // Valores
  const [valorItensInput, setValorItensInput] = useState('');
  const [formaPagto, setFormaPagto] = useState('PIX');
  const [obs, setObs] = useState('');

  // Fiado específico
  const [clienteFiado, setClienteFiado] = useState('');

  // Troco específico para dinheiro
  const [trocoPara, setTrocoPara] = useState('');

  // Feedback de envio
  const [submitting, setSubmitting] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(false);
  const [lastOrderInfo, setLastOrderInfo] = useState(null);

  const valorInputRef = useRef(null);

  // Canais de Delivery
  const deliveryChannels = [
    { id: 'ZAP', name: 'WhatsApp', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { id: 'IFOOD', name: 'iFood', badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
    { id: '99F', name: '99Food', badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20' }
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

  // Selecionar Bairro
  const handleSelectBairro = (nomeBairro, taxaPadrao) => {
    setBairro(nomeBairro);
    setTaxaEntrega(taxaPadrao);
    setBairroSearch('');
    setShowBairroDropdown(false);
  };

  // Filtro de Bairros
  const filteredBairros = useMemo(() => {
    if (!bairroSearch.trim()) return DEFAULT_BAIRROS;
    return DEFAULT_BAIRROS.filter(b => 
      b.nome.toLowerCase().includes(bairroSearch.toLowerCase())
    );
  }, [bairroSearch]);

  // Cálculos dinâmicos
  const valorItens = parseFloat(valorItensInput.replace(',', '.')) || 0;
  const taxaFinal = tipo === 'Delivery' ? (parseFloat(taxaEntrega) || 0) : 0;
  const valorTotal = Math.round((valorItens + taxaFinal) * 100) / 100;

  // Som suave
  const playSuccessSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Ignorar caso sem suporte
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.85 },
        colors: ['#10b981', '#f59e0b', '#38bdf8', '#ffffff']
      });
    } catch {
      // Confetti opcional
    }
  };

  const handleAddValor = (quantia) => {
    const atual = parseFloat(valorItensInput.replace(',', '.')) || 0;
    setValorItensInput((atual + quantia).toFixed(2));
  };

  const handleSubmit = async (e) => {
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
      triggerConfetti();
      setSuccessAnimation(true);
      setLastOrderInfo({
        id: result?.pedido?.id || `PED-${Date.now().toString().slice(-4)}`,
        valorTotal,
        tipo,
        bairro: payload.bairro
      });

      // Limpeza imediata dos campos para o próximo pedido
      setValorItensInput('');
      setObs('');
      setTrocoPara('');
      setClienteFiado('');

      setTimeout(() => {
        setSuccessAnimation(false);
        if (valorInputRef.current) valorInputRef.current.focus();
      }, 1400);

    } catch (err) {
      console.error('Erro ao registar pedido:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Bairros frequentes em formato de chip clean
  const topBairros = ['VAA', 'VP', 'ME', 'Centro', 'JD CPV', 'VMJ', 'PINUS'];

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 pb-32 md:pb-16 space-y-4">
      
      {/* Toast de Sucesso Clean & Minimalista */}
      {successAnimation && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-fadeIn">
          <div className="w-6 h-6 rounded-full bg-slate-950/15 flex items-center justify-center">
            <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
          </div>
          <span className="text-xs sm:text-sm font-extrabold tracking-tight">
            Pedido registado! {formatCurrency(lastOrderInfo?.valorTotal)}
          </span>
        </div>
      )}

      {/* ======================================================== */}
      {/* CARD 1: TIPO, CANAL E DESTINO (CLEAN & INTEGRADO) */}
      {/* ======================================================== */}
      <section className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        
        {/* Alternador Segmentado Moderno: Delivery vs Balcão */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 grid grid-cols-2 p-1 bg-slate-950/70 rounded-xl border border-slate-800/90">
            <button
              type="button"
              onClick={() => handleSelectTipo('Delivery')}
              className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                tipo === 'Delivery'
                  ? 'bg-slate-800 text-white shadow-sm font-extrabold border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bike className={`w-4 h-4 ${tipo === 'Delivery' ? 'text-orange-400' : 'text-slate-500'}`} />
              <span>Delivery</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTipo('Balcão')}
              className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                tipo === 'Balcão'
                  ? 'bg-slate-800 text-white shadow-sm font-extrabold border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Store className={`w-4 h-4 ${tipo === 'Balcão' ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>Balcão</span>
            </button>
          </div>

          {/* Seleção do Canal (Se Delivery) */}
          {tipo === 'Delivery' && (
            <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800/90">
              {deliveryChannels.map((c) => {
                const isSelected = canal === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCanal(c.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-slate-800 text-white border border-slate-700/70 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Seção de Bairro & Taxa (Apenas se for Delivery) */}
        {tipo === 'Delivery' && (
          <div className="pt-2 border-t border-slate-800/60 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                Bairro de Entrega:
              </span>
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Taxa:</span>
                <span className="font-mono font-bold text-emerald-400">{formatCurrency(taxaEntrega)}</span>
              </div>
            </div>

            {/* Chips Rápidos de Bairros mais comuns */}
            <div className="flex flex-wrap gap-1.5">
              {topBairros.map((bName) => {
                const bObj = DEFAULT_BAIRROS.find(b => b.nome === bName);
                const isSelected = bairro === bName;
                return (
                  <button
                    key={bName}
                    type="button"
                    onClick={() => handleSelectBairro(bName, bObj?.taxa || 4.0)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 border ${
                      isSelected
                        ? 'bg-orange-500/15 border-orange-500/40 text-orange-300 font-bold'
                        : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <span>{bName}</span>
                    <span className="text-[10px] opacity-75 font-mono">R${bObj?.taxa || 4}</span>
                  </button>
                );
              })}
            </div>

            {/* Linha de Busca de Outro Bairro + Ajuste Fino da Taxa */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="sm:col-span-2 relative">
                <div className="relative">
                  <input
                    type="text"
                    value={bairroSearch || (showBairroDropdown ? '' : bairro)}
                    onChange={(e) => {
                      setBairroSearch(e.target.value);
                      setShowBairroDropdown(true);
                    }}
                    onFocus={() => setShowBairroDropdown(true)}
                    placeholder="Outro bairro..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-700"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5 pointer-events-none" />
                </div>

                {showBairroDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-20 max-h-40 overflow-y-auto p-1 divide-y divide-slate-800">
                    {filteredBairros.map((b) => (
                      <div
                        key={b.nome}
                        onClick={() => handleSelectBairro(b.nome, b.taxa)}
                        className="px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-lg cursor-pointer flex justify-between"
                      >
                        <span>{b.nome}</span>
                        <span className="font-mono text-emerald-400 font-bold">{formatCurrency(b.taxa)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ajuste manual da taxa (+ / -) */}
              <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-2 py-1">
                <button
                  type="button"
                  onClick={() => setTaxaEntrega(prev => Math.max(0, parseFloat((prev - 1).toFixed(2))))}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-white flex items-center justify-center font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {formatCurrency(taxaEntrega)}
                </span>
                <button
                  type="button"
                  onClick={() => setTaxaEntrega(prev => parseFloat((prev + 1).toFixed(2)))}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-white flex items-center justify-center font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* CARD 2: VALOR DOS PRODUTOS & TOTAL (LIMPO & EM DESTAQUE) */}
      {/* ======================================================== */}
      <section className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-400">
              Valor dos Produtos
            </label>
            {valorItens > 0 && (
              <span className="text-xs text-slate-400">
                Total: <strong className="text-emerald-400 font-mono font-bold text-sm">{formatCurrency(valorTotal)}</strong>
              </span>
            )}
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xl pointer-events-none">
              R$
            </span>
            <input
              ref={valorInputRef}
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={valorItensInput}
              onChange={(e) => setValorItensInput(e.target.value.replace(/[^0-9.,]/g, ''))}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-3.5 pl-12 pr-4 text-3xl sm:text-4xl font-mono font-black text-white placeholder-slate-700 focus:outline-none"
            />
          </div>

          {/* Atalhos Rápidos de Adição de Valor */}
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1">
            {[10, 20, 30, 50, 80].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleAddValor(val)}
                className="py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-mono font-semibold transition-all active:scale-95"
              >
                +{val}
              </button>
            ))}
            {valorItensInput && (
              <button
                type="button"
                onClick={() => setValorItensInput('')}
                className="py-1.5 px-2.5 rounded-lg text-slate-500 hover:text-slate-300 text-xs ml-auto"
                title="Limpar valor"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Linha Resumo Discreta */}
        {tipo === 'Delivery' && taxaFinal > 0 && valorItens > 0 && (
          <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800/60 text-slate-400">
            <span>Itens {formatCurrency(valorItens)} + Taxa {formatCurrency(taxaFinal)}</span>
            <span className="font-bold text-emerald-400 font-mono">Total {formatCurrency(valorTotal)}</span>
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* CARD 3: FORMA DE PAGAMENTO (1 TOQUE, CLEAN & ELEGANTE) */}
      {/* ======================================================== */}
      <section className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <label className="text-xs font-semibold text-slate-400 block">
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
                className={`py-3 px-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-between transition-all duration-150 active:scale-[0.98] ${
                  isSelected
                    ? pm.id === 'PIX'
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-bold'
                      : pm.id === 'A REC'
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 font-bold'
                      : 'bg-slate-800 border-slate-600 text-white font-bold'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  {pm.id === 'PIX' && <QrCode className="w-4 h-4 text-emerald-400" />}
                  {pm.id === 'CREDITO' && <CreditCard className="w-4 h-4 text-blue-400" />}
                  {pm.id === 'DEBITO' && <CreditCard className="w-4 h-4 text-indigo-400" />}
                  {pm.id === 'DINHEIRO' && <Banknote className="w-4 h-4 text-amber-400" />}
                  {pm.id === 'A REC' && <ClockAlert className="w-4 h-4 text-amber-400" />}
                  {pm.id === 'ON' && <Smartphone className="w-4 h-4 text-purple-400" />}
                  <span>{pm.label}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 stroke-[2.5]" />}
              </button>
            );
          })}
        </div>

        {/* Gaveta Dinheiro (Troco) */}
        {formaPagto === 'DINHEIRO' && (
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 animate-fadeIn">
            <span className="text-xs text-slate-400 font-medium">Troco para quanto?</span>
            <div className="flex flex-wrap items-center gap-2">
              {['Sem Troco', '50', '100'].map((trocoOption) => (
                <button
                  key={trocoOption}
                  type="button"
                  onClick={() => setTrocoPara(trocoOption === 'Sem Troco' ? '' : trocoOption)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    (trocoOption === 'Sem Troco' && !trocoPara) || trocoPara === trocoOption
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {trocoOption === 'Sem Troco' ? 'Não precisa de troco' : `R$ ${trocoOption}`}
                </button>
              ))}
              <input
                type="text"
                placeholder="Outro valor..."
                value={trocoPara}
                onChange={(e) => setTrocoPara(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-24 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 font-mono"
              />
            </div>
          </div>
        )}

        {/* Gaveta Fiado (Cliente) */}
        {formaPagto === 'A REC' && (
          <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Cliente devedor:
              </span>
              <span className="text-[11px] text-slate-400">Lançará no extrato do cliente</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {['ADRIANO', 'FELIPE', 'HUDSON', 'TIO NALDO', 'ANA RITA'].map((nome) => (
                <button
                  key={nome}
                  type="button"
                  onClick={() => setClienteFiado(nome)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    clienteFiado.toUpperCase() === nome
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {nome}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Digite o nome do cliente..."
              value={clienteFiado}
              onChange={(e) => setClienteFiado(e.target.value.toUpperCase())}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs sm:text-sm text-white placeholder-slate-500 font-semibold uppercase focus:outline-none focus:border-amber-500/60"
            />
          </div>
        )}

        {/* Observação Clean */}
        <div className="pt-1">
          <input
            type="text"
            placeholder="Observação (opcional: sem maionese, ponto, etc.)..."
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl py-2 px-3 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-700"
          />
        </div>
      </section>

      {/* ======================================================== */}
      {/* BARRA DE AÇÃO FIXA / FLUTUANTE (DOCK ERGONÔMICO) */}
      {/* ======================================================== */}
      <div className="fixed bottom-14 md:bottom-5 left-0 right-0 px-4 z-20 pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 p-2 sm:p-2.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3">
            {/* Resumo do Total à Esquerda */}
            <div className="pl-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Total do Pedido
              </span>
              <span className="text-xl sm:text-2xl font-mono font-black text-emerald-400">
                {formatCurrency(valorTotal)}
              </span>
            </div>

            {/* Botão de Confirmação à Direita */}
            <button
              type="button"
              disabled={valorItens <= 0 || submitting}
              onClick={handleSubmit}
              className={`py-3.5 px-6 sm:px-8 rounded-xl font-extrabold text-sm sm:text-base tracking-wide flex items-center gap-2 transition-all active:scale-[0.98] ${
                valorItens > 0
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 cursor-pointer font-black'
                  : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed'
              }`}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>A Registar...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>REGISTAR PEDIDO</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
