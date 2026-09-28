import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Search, 
  Check, 
  Bike, 
  DollarSign, 
  AlertCircle,
  Save,
  ArrowRight,
  TrendingUp,
  Building2
} from 'lucide-react';
import { getBairrosCadastrados, saveBairrosCadastrados, resetBairrosPadrao } from '../services/api';
import { formatCurrency } from '../utils/formatters';

export default function ConfigBairrosCacapava({ onClose, onBairrosUpdated }) {
  const [bairros, setBairros] = useState([]);
  const [busca, setBusca] = useState('');
  
  // Novo Bairro
  const [novoNome, setNovoNome] = useState('');
  const [novaTaxa, setNovaTaxa] = useState('5.00');
  
  // Feedback
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [bairroExcluindo, setBairroExcluindo] = useState(null);

  useEffect(() => {
    carregarBairros();
  }, []);

  const carregarBairros = () => {
    const list = getBairrosCadastrados();
    setBairros(list);
  };

  const notifyChange = (updatedList) => {
    setBairros(updatedList);
    saveBairrosCadastrados(updatedList);
    if (onBairrosUpdated) {
      onBairrosUpdated(updatedList);
    }
  };

  const showSuccess = (msg) => {
    setMensagemSucesso(msg);
    setTimeout(() => setMensagemSucesso(''), 2500);
  };

  // Adicionar Novo Bairro
  const handleAdicionar = (e) => {
    e.preventDefault();
    const nomeLimpo = novoNome.trim().toUpperCase();
    const taxaNum = parseFloat(novaTaxa.replace(',', '.')) || 0;

    if (!nomeLimpo) return;

    if (bairros.some(b => b.nome.toUpperCase() === nomeLimpo)) {
      alert(`O bairro "${nomeLimpo}" já está cadastrado.`);
      return;
    }

    const novaLista = [...bairros, { nome: nomeLimpo, taxa: taxaNum }].sort((a, b) => a.nome.localeCompare(b.nome));
    notifyChange(novaLista);
    setNovoNome('');
    setNovaTaxa('5.00');
    showSuccess(`Bairro "${nomeLimpo}" adicionado com taxa de ${formatCurrency(taxaNum)}!`);
  };

  // Alterar taxa de um bairro
  const handleAlterarTaxa = (nome, novoValor) => {
    const taxaNum = parseFloat(novoValor.replace(',', '.')) || 0;
    const novaLista = bairros.map(b => {
      if (b.nome === nome) {
        return { ...b, taxa: Math.max(0, taxaNum) };
      }
      return b;
    });
    notifyChange(novaLista);
  };

  // Ajuste rápido com botões (+1 ou -1)
  const handleIncrementarTaxa = (nome, delta) => {
    const novaLista = bairros.map(b => {
      if (b.nome === nome) {
        const novaTaxa = Math.max(0, Math.round(((parseFloat(b.taxa) || 0) + delta) * 100) / 100);
        return { ...b, taxa: novaTaxa };
      }
      return b;
    });
    notifyChange(novaLista);
  };

  // Excluir Bairro
  const handleExcluir = (nome) => {
    const novaLista = bairros.filter(b => b.nome !== nome);
    notifyChange(novaLista);
    setBairroExcluindo(null);
    showSuccess(`Bairro "${nome}" removido com sucesso.`);
  };

  // Restaurar Padrão
  const handleRestaurarPadrao = () => {
    if (window.confirm('Deseja restaurar a lista oficial dos bairros de Caçapava e suas taxas padrão?')) {
      const padrao = resetBairrosPadrao();
      notifyChange(padrao);
      showSuccess('Lista de bairros de Caçapava restaurada para o padrão!');
    }
  };

  // Filtragem pela busca
  const bairrosFiltrados = useMemo(() => {
    if (!busca.trim()) return bairros;
    const term = busca.trim().toLowerCase();
    return bairros.filter(b => b.nome.toLowerCase().includes(term));
  }, [bairros, busca]);

  // Estatísticas Rápidas
  const stats = useMemo(() => {
    if (bairros.length === 0) return { total: 0, media: 0, menor: 0, maior: 0 };
    const taxas = bairros.map(b => parseFloat(b.taxa) || 0);
    const total = bairros.length;
    const soma = taxas.reduce((a, b) => a + b, 0);
    const media = soma / total;
    const menor = Math.min(...taxas);
    const maior = Math.max(...taxas);
    return { total, media, menor, maior };
  }, [bairros]);

  return (
    <div className="h-full w-full bg-white border border-slate-300 rounded-3xl p-4 sm:p-6 overflow-y-auto space-y-5">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800">
            <MapPin className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-[#3b0764]">Bairros de Caçapava & Taxas de Entrega</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 font-extrabold text-[11px] border border-purple-200">
                Caçapava / SP
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Cadastre os bairros atendidos e configure o valor cobrado pela tele-entrega (Delivery)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleRestaurarPadrao}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Restaurar lista original de bairros de Caçapava"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#3b0764] hover:bg-purple-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              ← Voltar ao Terminal PDV
            </button>
          )}
        </div>
      </div>

      {/* Banner de Feedback de Sucesso */}
      {mensagemSucesso && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs font-extrabold flex items-center gap-2 animate-in fade-in duration-200 shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* Cards de Resumo e Estatísticas de Caçapava */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80">
          <div className="flex items-center justify-between text-purple-900 text-xs font-bold mb-1">
            <span>Bairros Atendidos</span>
            <Building2 className="w-4 h-4 text-purple-700" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#3b0764]">
            {stats.total}
          </div>
          <span className="text-[10px] text-purple-700/80">Cadastrados em Caçapava</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
          <div className="flex items-center justify-between text-amber-900 text-xs font-bold mb-1">
            <span>Taxa Média</span>
            <DollarSign className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-amber-900">
            {formatCurrency(stats.media)}
          </div>
          <span className="text-[10px] text-amber-700/80">Média geral das entregas</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
          <div className="flex items-center justify-between text-emerald-900 text-xs font-bold mb-1">
            <span>Menor Taxa</span>
            <Bike className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-800">
            {formatCurrency(stats.menor)}
          </div>
          <span className="text-[10px] text-emerald-700/80">Entregas mais próximas</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200/80">
          <div className="flex items-center justify-between text-sky-900 text-xs font-bold mb-1">
            <span>Maior Taxa</span>
            <TrendingUp className="w-4 h-4 text-sky-700" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-sky-900">
            {formatCurrency(stats.maior)}
          </div>
          <span className="text-[10px] text-sky-700/80">Bairros mais distantes / rurais</span>
        </div>
      </div>

      {/* Formulário: Adicionar Novo Bairro */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
        <span className="text-xs font-extrabold uppercase tracking-wider text-[#3b0764] flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-amber-500" />
          <span>Cadastrar Novo Bairro ou Localidade</span>
        </span>

        <form onSubmit={handleAdicionar} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-6 space-y-1">
            <label className="text-[11px] font-bold text-slate-600 block">
              Nome ou Sigla do Bairro:
            </label>
            <input
              type="text"
              required
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Ex: JD RAFAEL, JD SÃO JOSÉ, VERA CRUZ..."
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-600 uppercase"
            />
          </div>

          <div className="sm:col-span-3 space-y-1">
            <label className="text-[11px] font-bold text-slate-600 block">
              Taxa de Entrega (R$):
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">R$</span>
              <input
                type="number"
                step="0.50"
                min="0"
                required
                value={novaTaxa}
                onChange={(e) => setNovaTaxa(e.target.value)}
                placeholder="5.00"
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer ring-1 ring-amber-400"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Bairro</span>
            </button>
          </div>
        </form>
      </div>

      {/* Barra de Busca e Título da Listagem */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-black text-slate-900">
            Bairros Cadastrados ({bairrosFiltrados.length})
          </h3>
          <span className="text-xs text-slate-500 hidden sm:inline">• Altere as taxas diretamente nos campos abaixo</span>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar bairro em Caçapava..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-purple-600"
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

      {/* Grade de Bairros de Caçapava */}
      {bairrosFiltrados.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-700">Nenhum bairro encontrado</p>
          <p className="text-xs text-slate-400">Tente buscar por outro termo ou cadastre um novo bairro acima.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {bairrosFiltrados.map((b) => {
            const taxaAtual = parseFloat(b.taxa) || 0;
            const isExcluindo = bairroExcluindo === b.nome;

            return (
              <div 
                key={b.nome}
                className="p-3 bg-slate-50 hover:bg-white border border-slate-200 hover:border-purple-300 hover:shadow-xs rounded-2xl transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-purple-100 text-purple-900 shrink-0">
                    <MapPin className="w-4 h-4 text-purple-800" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-black text-xs text-slate-900 block truncate" title={b.nome}>
                      {b.nome}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {taxaAtual <= 5 ? 'Taxa Básica' : taxaAtual <= 8 ? 'Intermediária' : 'Distante / Especial'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Controles de Valor Rápido */}
                  <div className="flex items-center bg-white border border-slate-300 rounded-xl p-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => handleIncrementarTaxa(b.nome, -1)}
                      className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                      title="Diminuir R$ 1,00"
                    >
                      -
                    </button>
                    <div className="relative px-1 flex items-center">
                      <span className="text-[10px] font-bold text-slate-400 mr-0.5">R$</span>
                      <input
                        type="number"
                        step="0.50"
                        min="0"
                        value={b.taxa}
                        onChange={(e) => handleAlterarTaxa(b.nome, e.target.value)}
                        className="w-14 text-center font-mono font-black text-xs text-amber-700 bg-transparent focus:outline-none focus:bg-amber-50 rounded"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleIncrementarTaxa(b.nome, 1)}
                      className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                      title="Aumentar R$ 1,00"
                    >
                      +
                    </button>
                  </div>

                  {/* Botão de Exclusão */}
                  {isExcluindo ? (
                    <div className="flex items-center gap-1 animate-in fade-in duration-150">
                      <button
                        type="button"
                        onClick={() => handleExcluir(b.nome)}
                        className="px-2 py-1 bg-rose-600 text-white text-[10px] font-black rounded-lg hover:bg-rose-700 shadow-xs cursor-pointer"
                        title="Confirmar exclusão"
                      >
                        Sim
                      </button>
                      <button
                        type="button"
                        onClick={() => setBairroExcluindo(null)}
                        className="px-1.5 py-1 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg hover:bg-slate-300 cursor-pointer"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setBairroExcluindo(b.nome)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title={`Remover ${b.nome}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
