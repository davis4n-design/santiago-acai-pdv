import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Pencil, 
  Check, 
  X, 
  DollarSign, 
  Trash2, 
  Phone, 
  ClockAlert, 
  CheckCircle2, 
  QrCode, 
  CreditCard, 
  Banknote,
  Receipt,
  MessageCircle
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { WhatsAppIcon } from './BrandIcons';

export default function GerenciadorFiados({
  fiados = [],
  onDarBaixaFiado,
  onEditarFiado,
  onAdicionarFiado,
  onExcluirFiado,
  onClose
}) {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('pendentes'); // 'pendentes' | 'todos' | 'quitados'

  // Modais
  const [fiadoEmEdicao, setFiadoEmEdicao] = useState(null);
  const [fiadoEmBaixa, setFiadoEmBaixa] = useState(null);
  const [showNovoFiadoModal, setShowNovoFiadoModal] = useState(false);

  // Estados dos formulários de modal
  // Modal Edição
  const [editNome, setEditNome] = useState('');
  const [editTelefone, setEditTelefone] = useState('');
  const [editSaldo, setEditSaldo] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Modal Baixa / Pagamento ("PAGO")
  const [baixaValor, setBaixaValor] = useState('');
  const [baixaForma, setBaixaForma] = useState('PIX');
  const [baixaObs, setBaixaObs] = useState('');

  // Modal Novo Fiado
  const [novoNome, setNovoNome] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [novoSaldo, setNovoSaldo] = useState('');

  // Feedback
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Abrir Modal de Edição
  const handleOpenEdit = (f) => {
    setFiadoEmEdicao(f);
    setEditNome(f.cliente);
    setEditTelefone(f.telefone || '');
    setEditSaldo(f.saldo.toString());
    setConfirmDelete(false);
  };

  // Salvar Edição
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editNome.trim()) return;

    if (onEditarFiado) {
      await onEditarFiado({
        id: fiadoEmEdicao.id,
        clienteAntigo: fiadoEmEdicao.cliente,
        clienteNovo: editNome.trim().toUpperCase(),
        telefone: editTelefone.trim(),
        saldo: parseFloat(editSaldo.replace(',', '.')) || 0
      });
    }

    setFiadoEmEdicao(null);
    showToast(`Cliente ${editNome.trim().toUpperCase()} atualizado!`);
  };

  // Excluir Fiado
  const handleDeleteFiado = async () => {
    if (onExcluirFiado && fiadoEmEdicao) {
      await onExcluirFiado(fiadoEmEdicao.cliente);
      setFiadoEmEdicao(null);
      showToast(`Cliente removido do fiado.`);
    }
  };

  // Abrir Modal de Pagamento / Baixa ("PAGO")
  const handleOpenBaixa = (f) => {
    setFiadoEmBaixa(f);
    setBaixaValor(f.saldo > 0 ? f.saldo.toFixed(2) : '0.00');
    setBaixaForma('PIX');
    setBaixaObs('');
  };

  // Confirmar Pagamento / Baixa
  const handleConfirmBaixa = async (e) => {
    e.preventDefault();
    const valorNum = parseFloat(baixaValor.replace(',', '.')) || 0;
    if (valorNum <= 0) return;

    if (onDarBaixaFiado) {
      await onDarBaixaFiado({
        cliente: fiadoEmBaixa.cliente,
        valor: valorNum,
        formaPagto: baixaForma,
        obs: baixaObs || `Pagamento de fiado recebido em ${baixaForma}`
      });
    }

    const restou = Math.max(0, fiadoEmBaixa.saldo - valorNum);
    setFiadoEmBaixa(null);
    showToast(
      restou === 0 
        ? `Pagamento integral de ${formatCurrency(valorNum)} confirmado! Cliente quitado.` 
        : `Pagamento de ${formatCurrency(valorNum)} registrado! Restante: ${formatCurrency(restou)}`
    );
  };

  // Salvar Novo Fiado
  const handleSaveNovoFiado = async (e) => {
    e.preventDefault();
    if (!novoNome.trim()) return;

    if (onAdicionarFiado) {
      const res = await onAdicionarFiado({
        cliente: novoNome.trim().toUpperCase(),
        telefone: novoTelefone.trim(),
        saldo: parseFloat(novoSaldo.replace(',', '.')) || 0
      });

      if (res && res.error) {
        alert(res.error);
        return;
      }
    }

    setShowNovoFiadoModal(false);
    setNovoNome('');
    setNovoTelefone('');
    setNovoSaldo('');
    showToast(`Novo cliente adicionado ao fiado!`);
  };

  // Chamar Cliente no WhatsApp com Lembrete de Saldo
  const handleOpenWhatsApp = (f) => {
    const rawTel = (f.telefone || '').replace(/\D/g, '');
    if (!rawTel) {
      if (window.confirm(`O cliente "${f.cliente}" ainda não possui telefone WhatsApp cadastrado. Deseja cadastrar agora?`)) {
        handleOpenEdit(f);
      }
      return;
    }

    // Se o telefone tem 10 ou 11 dígitos, adiciona o DDI 55 (Brasil)
    const telComDdi = rawTel.length <= 11 ? `55${rawTel}` : rawTel;

    const saldo = parseFloat(f.saldo) || 0;
    let texto = '';
    if (saldo > 0) {
      texto = `Olá, *${f.cliente}*! Tudo bem?\nPassando para enviar o lembrete da sua conta em aberto no *Santiago Açaí e Cia* no valor de *${formatCurrency(saldo)}*.\n\nCaso queira realizar o pagamento via Pix ou tirar alguma dúvida, estamos à disposição por aqui. Muito obrigado! 🍧`;
    } else {
      texto = `Olá, *${f.cliente}*! Tudo bem? Passando para agradecer pelo pagamento da sua conta no *Santiago Açaí e Cia*. Sua conta está 100% quitada! Tenha um ótimo dia! 🍧`;
    }

    const url = `https://wa.me/${telComDdi}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  // Filtragem
  const fiadosFiltrados = useMemo(() => {
    return fiados.filter(f => {
      // Filtro de busca
      if (busca.trim()) {
        const term = busca.trim().toLowerCase();
        const matchNome = f.cliente.toLowerCase().includes(term);
        const matchTel = f.telefone && f.telefone.toLowerCase().includes(term);
        if (!matchNome && !matchTel) return false;
      }

      // Filtro de status
      const saldo = parseFloat(f.saldo) || 0;
      if (filtroStatus === 'pendentes') return saldo > 0;
      if (filtroStatus === 'quitados') return saldo <= 0;
      return true;
    });
  }, [fiados, busca, filtroStatus]);

  // Estatísticas
  const stats = useMemo(() => {
    const totalDevedores = fiados.filter(f => (parseFloat(f.saldo) || 0) > 0);
    const totalAReceber = totalDevedores.reduce((sum, f) => sum + (parseFloat(f.saldo) || 0), 0);
    const totalQuitados = fiados.filter(f => (parseFloat(f.saldo) || 0) <= 0).length;
    return {
      totalAReceber,
      qtdPendentes: totalDevedores.length,
      qtdQuitados: totalQuitados
    };
  }, [fiados]);

  return (
    <div className="h-full w-full bg-white border border-slate-300 rounded-3xl p-4 sm:p-6 overflow-y-auto space-y-4">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800">
            <ClockAlert className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-[#3b0764]">Contas a Receber (Fiados)</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[11px] border border-amber-300">
                {stats.qtdPendentes} com saldo pendente
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Acompanhe a caderneta de clientes, registre pagamentos parciais/totais ou edite cadastros
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowNovoFiadoModal(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer ring-1 ring-amber-400"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Fiado</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#3b0764] hover:bg-purple-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              ← Voltar ao Terminal PDV
            </button>
          )}
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs font-extrabold flex items-center gap-2 animate-in fade-in duration-200 shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 block mb-1">
            Total a Receber (Fiados)
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-amber-700">
            {formatCurrency(stats.totalAReceber)}
          </div>
          <span className="text-[11px] text-amber-800 font-bold">
            Soma acumulada na caderneta
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-900 block mb-1">
            Clientes com Débito
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#3b0764]">
            {stats.qtdPendentes}
          </div>
          <span className="text-[11px] text-purple-800 font-bold">
            Pessoas com saldo aberto
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-900 block mb-1">
            Clientes Quitados
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-700">
            {stats.qtdQuitados}
          </div>
          <span className="text-[11px] text-emerald-800 font-bold">
            Contas totalmente pagas
          </span>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setFiltroStatus('pendentes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              filtroStatus === 'pendentes'
                ? 'bg-[#3b0764] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Pendentes ({stats.qtdPendentes})
          </button>
          <button
            type="button"
            onClick={() => setFiltroStatus('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              filtroStatus === 'todos'
                ? 'bg-[#3b0764] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Todos ({fiados.length})
          </button>
          <button
            type="button"
            onClick={() => setFiltroStatus('quitados')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              filtroStatus === 'quitados'
                ? 'bg-[#3b0764] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Quitados ({stats.qtdQuitados})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou telefone..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-600"
          />
          {busca && (
            <button
              type="button"
              onClick={() => setBusca('')}
              className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Grade de Clientes Fiados */}
      {fiadosFiltrados.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
          <Users className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-700">Nenhum cliente encontrado</p>
          <p className="text-xs text-slate-400">Verifique a busca ou cadastre um novo cliente no botão acima.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {fiadosFiltrados.map((f) => {
            const saldo = parseFloat(f.saldo) || 0;
            const isQuitado = saldo <= 0;

            return (
              <div 
                key={f.id || f.cliente}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 shadow-xs ${
                  isQuitado 
                    ? 'bg-slate-50/70 border-slate-200 opacity-80' 
                    : 'bg-white border-amber-200/90 hover:border-amber-400 hover:shadow-md'
                }`}
              >
                {/* Dados do Cliente e Saldo */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-black text-sm text-slate-900 block truncate" title={f.cliente}>
                      {f.cliente}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{f.telefone || 'Sem telefone'}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Saldo</span>
                    {isQuitado ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px] border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Quitado</span>
                      </span>
                    ) : (
                      <span className="font-mono font-black text-lg text-amber-700 block">
                        {formatCurrency(saldo)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Botões de Ação: [ WHATSAPP ], [ EDITAR ] e [ PAGO / DAR BAIXA ] */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  {/* Botão de Chamar no WhatsApp */}
                  <button
                    type="button"
                    onClick={() => handleOpenWhatsApp(f)}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-xs ring-1 ring-emerald-400"
                    title={f.telefone ? `Chamar ${f.cliente} no WhatsApp (${f.telefone})` : 'Cadastrar telefone e chamar no WhatsApp'}
                  >
                    <WhatsAppIcon className="w-4 h-4" inverted={true} />
                    <span>Chamar no WhatsApp</span>
                  </button>

                  <div className="grid grid-cols-2 gap-1.5">
                    {/* Botão Editar (Lápis) */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(f)}
                      className="py-2 px-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <Pencil className="w-3.5 h-3.5 text-slate-600" />
                      <span>Editar</span>
                    </button>

                    {/* Botão PAGO / DAR BAIXA */}
                    <button
                      type="button"
                      onClick={() => handleOpenBaixa(f)}
                      className={`py-2 px-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs ${
                        isQuitado
                          ? 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                          : 'bg-[#3b0764] hover:bg-purple-900 text-white shadow-purple-950/20 ring-1 ring-purple-400'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3] text-amber-300" />
                      <span>{isQuitado ? 'Ajustar' : 'PAGO'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: REGISTRAR PAGAMENTO ("PAGO" / DAR BAIXA)           */}
      {/* ======================================================== */}
      {fiadoEmBaixa && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800">
                  <Check className="w-6 h-6 stroke-[3] text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Receber Pagamento</h3>
                  <p className="text-xs text-slate-500">Registrar baixa de fiado para {fiadoEmBaixa.cliente}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setFiadoEmBaixa(null)} 
                className="text-slate-400 hover:text-slate-700 p-1.5 cursor-pointer rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBaixa} className="space-y-4">
              {/* Informações do Saldo Atual */}
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-800 block">Saldo Devedor Atual</span>
                  <span className="font-black text-xs text-slate-800">{fiadoEmBaixa.cliente}</span>
                </div>
                <span className="text-xl font-mono font-black text-amber-700">
                  {formatCurrency(fiadoEmBaixa.saldo)}
                </span>
              </div>

              {/* Valor a Pagar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Valor Recebido (R$):
                  </label>
                  <button
                    type="button"
                    onClick={() => setBaixaValor(fiadoEmBaixa.saldo.toFixed(2))}
                    className="text-[11px] font-extrabold text-purple-700 hover:text-purple-900 underline cursor-pointer"
                  >
                    Quitar Total ({formatCurrency(fiadoEmBaixa.saldo)})
                  </button>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-base font-bold text-slate-400">R$</span>
                  <input
                    type="number"
                    step="0.50"
                    min="0.01"
                    required
                    autoFocus
                    value={baixaValor}
                    onChange={(e) => setBaixaValor(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-emerald-300 focus:border-emerald-600 rounded-2xl pl-10 pr-4 py-3 text-xl font-mono font-black text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>

                {/* Cálculo Dinâmico de Restante */}
                {(() => {
                  const pagando = parseFloat(baixaValor.replace(',', '.')) || 0;
                  const restara = Math.max(0, fiadoEmBaixa.saldo - pagando);
                  return (
                    <div className="text-[11px] font-bold text-slate-600 flex justify-between px-1">
                      <span>Restará após este pagamento:</span>
                      <span className={`font-mono font-black ${restara === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {formatCurrency(restara)} {restara === 0 && '(Conta Zerada!)'}
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Forma de Pagamento */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Forma de Recebimento:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'PIX', label: 'PIX', icon: QrCode },
                    { id: 'DINHEIRO', label: 'Dinheiro', icon: Banknote },
                    { id: 'DEBITO', label: 'Débito', icon: CreditCard },
                    { id: 'CREDITO', label: 'Crédito', icon: CreditCard }
                  ].map(f => {
                    const Icon = f.icon;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setBaixaForma(f.id)}
                        className={`py-2 px-1 rounded-xl text-xs font-black border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                          baixaForma === f.id
                            ? 'bg-[#3b0764] text-white border-purple-900 shadow-sm ring-2 ring-purple-300'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{f.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Observações (Opcional):
                </label>
                <input
                  type="text"
                  value={baixaObs}
                  onChange={(e) => setBaixaObs(e.target.value)}
                  placeholder="Ex: Pago pelo WhatsApp / Pix enviado"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-600 focus:bg-white"
                />
              </div>

              {/* Botões do Rodapé */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFiadoEmBaixa(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Confirmar Pagamento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDITAR CADASTRO DO FIADO (LÁPIS)                  */}
      {/* ======================================================== */}
      {fiadoEmEdicao && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800">
                  <Pencil className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Editar Cliente Fiado</h3>
                  <p className="text-xs text-slate-500">Altere o nome, telefone ou ajuste o saldo devedor</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setFiadoEmEdicao(null)} 
                className="text-slate-400 hover:text-slate-700 p-1.5 cursor-pointer rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Nome do Cliente:
                </label>
                <input
                  type="text"
                  required
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                  placeholder="Nome do cliente"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-black text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Telefone / WhatsApp:
                </label>
                <input
                  type="text"
                  value={editTelefone}
                  onChange={(e) => setEditTelefone(e.target.value)}
                  placeholder="(12) 99999-9999"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Saldo Devedor (R$):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editSaldo}
                    onChange={(e) => setEditSaldo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-sm font-mono font-black text-amber-700 focus:outline-none focus:border-purple-600 focus:bg-white"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Dica: Para zerar o saldo, digite 0. Para conceder desconto, ajuste o valor diretamente.
                </p>
              </div>

              {/* Botão de Exclusão de Cliente */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                {confirmDelete ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-rose-700">Remover cliente?</span>
                    <button
                      type="button"
                      onClick={handleDeleteFiado}
                      className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-black hover:bg-rose-700 cursor-pointer"
                    >
                      Sim
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300 cursor-pointer"
                    >
                      Não
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir Cliente</span>
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFiadoEmEdicao(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#3b0764] hover:bg-purple-900 text-white shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 text-amber-300" />
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CADASTRAR NOVO FIADO                              */}
      {/* ======================================================== */}
      {showNovoFiadoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-900">
                  <Plus className="w-5 h-5 text-purple-800" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Novo Cliente Fiado</h3>
                  <p className="text-xs text-slate-500">Cadastre uma nova pessoa na caderneta</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowNovoFiadoModal(false)} 
                className="text-slate-400 hover:text-slate-700 p-1.5 cursor-pointer rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNovoFiado} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Nome do Cliente:
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Ex: MARCELO SOUZA"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-black text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Telefone / WhatsApp (Opcional):
                </label>
                <input
                  type="text"
                  value={novoTelefone}
                  onChange={(e) => setNovoTelefone(e.target.value)}
                  placeholder="(12) 99999-9999"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Saldo Inicial (R$):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={novoSaldo}
                    onChange={(e) => setNovoSaldo(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-sm font-mono font-black text-amber-700 focus:outline-none focus:border-purple-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNovoFiadoModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 ring-1 ring-amber-400"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Cliente</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
