import React, { useState, useMemo } from 'react';
import { 
  ClockAlert, 
  Search, 
  CheckCircle2, 
  Send, 
  UserPlus, 
  X,
  CreditCard,
  QrCode,
  Banknote,
  DollarSign
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function FiadosScreen({ 
  fiados = [], 
  onDarBaixaFiado, 
  onCadastrarFiado 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterApenasComSaldo, setFilterApenasComSaldo] = useState(true);

  // Modal Baixa
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [valorBaixa, setValorBaixa] = useState('');
  const [formaBaixa, setFormaBaixa] = useState('PIX');
  const [processandoBaixa, setProcessandoBaixa] = useState(false);

  // Modal Novo Cliente
  const [showNovoClienteModal, setShowNovoClienteModal] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoSaldo, setNovoSaldo] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');

  const totalGeralPendente = useMemo(() => {
    return fiados.reduce((sum, f) => sum + (parseFloat(f.saldo) || 0), 0);
  }, [fiados]);

  const filteredFiados = useMemo(() => {
    return fiados
      .filter(f => {
        const matches = f.cliente.toLowerCase().includes(searchTerm.toLowerCase());
        const hasSaldo = (parseFloat(f.saldo) || 0) > 0;
        return matches && (!filterApenasComSaldo || hasSaldo);
      })
      .sort((a, b) => (parseFloat(b.saldo) || 0) - (parseFloat(a.saldo) || 0));
  }, [fiados, searchTerm, filterApenasComSaldo]);

  const handleAbrirBaixa = (cliente) => {
    setClienteSelecionado(cliente);
    setValorBaixa(cliente.saldo.toString());
    setFormaBaixa('PIX');
  };

  const handleConfirmarBaixa = async (e) => {
    e.preventDefault();
    const val = parseFloat(valorBaixa.replace(',', '.')) || 0;
    if (val <= 0 || !clienteSelecionado) return;

    setProcessandoBaixa(true);
    try {
      await onDarBaixaFiado({
        cliente: clienteSelecionado.cliente,
        valor: val,
        formaPagto: formaBaixa
      });
      setClienteSelecionado(null);
    } finally {
      setProcessandoBaixa(false);
    }
  };

  const handleSalvarNovoCliente = (e) => {
    e.preventDefault();
    if (!novoNome.trim()) return;

    if (onCadastrarFiado) {
      onCadastrarFiado({
        cliente: novoNome.trim().toUpperCase(),
        saldo: parseFloat(novoSaldo.replace(',', '.')) || 0,
        telefone: novoTelefone.replace(/[^0-9]/g, '')
      });
    }

    setNovoNome('');
    setNovoSaldo('');
    setNovoTelefone('');
    setShowNovoClienteModal(false);
  };

  const handleCobrarWhatsApp = (f) => {
    const msg = encodeURIComponent(
      `Olá ${f.cliente}! Tudo bem? Passando para lembrar sobre a conta na Lanchonete no valor de ${formatCurrency(f.saldo)}. Qualquer dúvida estamos à disposição! 🙏🍔`
    );
    const tel = f.telefone ? f.telefone.replace(/[^0-9]/g, '') : '';
    window.open(tel ? `https://wa.me/55${tel}?text=${msg}` : `https://wa.me/?text=${msg}`, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 pb-28 md:pb-16 space-y-4">
      
      {/* Top Header Clean Light */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <ClockAlert className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">Fiados / Contas a Receber</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão de saldos devedores de clientes e mensalistas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2 text-right">
            <span className="text-[10px] uppercase font-bold text-amber-800 block">Total Pendente</span>
            <span className="text-xl font-mono font-black text-amber-700">
              {formatCurrency(totalGeralPendente)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowNovoClienteModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* Busca & Filtro */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por cliente (Adriano, Felipe, Hudson, Tio Naldo...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
        </div>

        <button
          type="button"
          onClick={() => setFilterApenasComSaldo(!filterApenasComSaldo)}
          className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all ${
            filterApenasComSaldo
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : 'bg-white border-slate-200 text-slate-600'
          }`}
        >
          {filterApenasComSaldo ? 'Pendentes' : 'Todos'}
        </button>
      </div>

      {/* Lista de Clientes */}
      <div className="space-y-2">
        {filteredFiados.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl text-slate-400 text-xs">
            Nenhum cliente encontrado.
          </div>
        ) : (
          filteredFiados.map((f) => {
            const saldoNum = parseFloat(f.saldo) || 0;
            const hasSaldo = saldoNum > 0;

            return (
              <div
                key={f.id || f.cliente}
                className={`bg-white border rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs transition-colors ${
                  hasSaldo ? 'border-slate-200 hover:border-amber-300' : 'border-slate-100 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                    hasSaldo ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {f.cliente.charAt(0)}
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 text-sm block">
                      {f.cliente}
                    </span>
                    {f.telefone && (
                      <span className="text-[11px] text-slate-400 font-mono">
                        Tel: {f.telefone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Saldo</span>
                    <span className={`text-base sm:text-lg font-mono font-black ${hasSaldo ? 'text-amber-700' : 'text-slate-400'}`}>
                      {formatCurrency(saldoNum)}
                    </span>
                  </div>

                  {hasSaldo && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCobrarWhatsApp(f)}
                        title="Cobrar via WhatsApp"
                        className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAbrirBaixa(f)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-xs transition-all"
                      >
                        Dar Baixa
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Quitação */}
      {clienteSelecionado && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Quitar Fiado</h3>
                <span className="text-xs text-amber-700 font-bold">{clienteSelecionado.cliente}</span>
              </div>
              <button
                type="button"
                onClick={() => setClienteSelecionado(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmarBaixa} className="space-y-3.5">
              <div className="p-3 bg-amber-50 rounded-2xl flex justify-between items-center text-xs">
                <span className="text-amber-900 font-semibold">Saldo Devedor:</span>
                <span className="font-mono font-black text-amber-800 text-sm">{formatCurrency(clienteSelecionado.saldo)}</span>
              </div>

              <div>
                <label className="text-xs text-slate-600 font-bold block mb-1">Valor a Quitar (R$)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={valorBaixa}
                  onChange={(e) => setValorBaixa(e.target.value.replace(/[^0-9.,]/g, ''))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-3 font-mono font-black text-slate-900 text-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 font-bold block mb-1.5">Forma de Recebimento</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['PIX', 'DINHEIRO', 'CARTÃO'].map((fp) => (
                    <button
                      key={fp}
                      type="button"
                      onClick={() => setFormaBaixa(fp)}
                      className={`py-2 rounded-xl text-xs font-bold border ${
                        formaBaixa === fp
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {fp}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setClienteSelecionado(null)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={processandoBaixa || !valorBaixa}
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-xs"
                >
                  {processandoBaixa ? 'Salvando...' : 'Confirmar Baixa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Novo Cliente */}
      {showNovoClienteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">Novo Mensalista / Fiado</h3>
              <button
                type="button"
                onClick={() => setShowNovoClienteModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovoCliente} className="space-y-3">
              <div>
                <label className="text-xs text-slate-600 font-bold block mb-1">Nome do Cliente *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex.: ADRIANO"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs sm:text-sm font-bold text-slate-900 uppercase focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 font-bold block mb-1">Saldo Devedor Inicial (R$)</label>
                <input
                  type="text"
                  placeholder="0,00"
                  value={novoSaldo}
                  onChange={(e) => setNovoSaldo(e.target.value.replace(/[^0-9.,]/g, ''))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 font-bold block mb-1">Telefone (Opcional)</label>
                <input
                  type="tel"
                  placeholder="1299..."
                  value={novoTelefone}
                  onChange={(e) => setNovoTelefone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none font-mono"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNovoClienteModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xs"
                >
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
