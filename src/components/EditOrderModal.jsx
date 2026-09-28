import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Trash2, 
  Bike, 
  Store, 
  AlertTriangle,
  Pencil,
  Plus,
  Minus
} from 'lucide-react';
import { DEFAULT_BAIRROS, PAYMENT_METHODS, CHANNELS } from '../data/defaultData';
import { getBairrosCadastrados } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { WhatsAppIcon, IFoodIcon, NoventaIcon } from './BrandIcons';

export default function EditOrderModal({
  isOpen,
  onClose,
  pedido,
  onSalvar,
  onExcluir
}) {
  if (!isOpen || !pedido) return null;

  const [tipo, setTipo] = useState(pedido.tipo || 'Delivery');
  const [canal, setCanal] = useState(pedido.canal || 'ZAP');
  const [bairro, setBairro] = useState(pedido.bairro || 'VAA');
  const [taxaEntrega, setTaxaEntrega] = useState(parseFloat(pedido.taxa_entrega) || 0);
  const [valorItens, setValorItens] = useState(parseFloat(pedido.valor_itens) || 0);
  const [formaPagto, setFormaPagto] = useState(pedido.forma_pagto || 'PIX');
  const [obs, setObs] = useState(pedido.obs_pagto || '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Recalcular taxa ao mudar de Delivery para Balcão
  useEffect(() => {
    if (tipo === 'Balcão') {
      setTaxaEntrega(0);
      setBairro('Balcão');
    }
  }, [tipo]);

  const taxaFinal = tipo === 'Delivery' ? (parseFloat(taxaEntrega) || 0) : 0;
  const valorTotal = Math.round((parseFloat(valorItens || 0) + taxaFinal) * 100) / 100;

  const handleBairroClick = (b) => {
    setBairro(b.nome);
    setTaxaEntrega(b.taxa);
  };

  const handleSalvar = (e) => {
    e.preventDefault();
    onSalvar({
      ...pedido,
      tipo,
      canal,
      bairro: tipo === 'Balcão' ? 'Balcão' : bairro,
      taxa_entrega: taxaFinal,
      valor_itens: parseFloat(valorItens) || 0,
      valor_total: valorTotal,
      forma_pagto: formaPagto,
      obs_pagto: obs
    });
    onClose();
  };

  const touchBairros = getBairrosCadastrados();

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-300 w-full max-w-xl rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto animate-scaleUp">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800">
              <Pencil className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">Editar Pedido</h2>
                <span className="font-mono text-xs font-black bg-purple-100 text-purple-900 px-2 py-0.5 rounded-md border border-purple-200">
                  #{pedido.id}
                </span>
              </div>
              <p className="text-xs text-slate-500">Ajuste os dados lançados para corrigir na planilha e no caixa</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSalvar} className="space-y-4 text-xs">
          
          {/* 1. Modalidade & Canal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Modalidade</label>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setTipo('Delivery')}
                  className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    tipo === 'Delivery' ? 'bg-[#3b0764] text-white shadow-xs' : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>Delivery</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTipo('Balcão')}
                  className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    tipo === 'Balcão' ? 'bg-[#3b0764] text-white shadow-xs' : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Balcão</span>
                </button>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Canal de Venda</label>
              <div className="grid grid-cols-4 gap-1">
                {CHANNELS.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCanal(c.id)}
                    className={`py-1.5 px-1 rounded-lg font-bold text-[11px] text-center border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      canal === c.id
                        ? 'border-purple-600 bg-purple-100/70 text-purple-950 font-black shadow-xs ring-1 ring-purple-500'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                    }`}
                  >
                    {c.id === 'ZAP' && <WhatsAppIcon className="w-3 h-3 shrink-0" color={canal === 'ZAP' ? '#059669' : '#64748b'} />}
                    {c.id === 'IFOOD' && <IFoodIcon className="h-2.5 w-auto shrink-0" color={canal === 'IFOOD' ? '#ea1d2c' : '#64748b'} />}
                    {c.id === '99F' && <NoventaIcon className="h-3 w-3 shrink-0" />}
                    {c.id === 'Balcão' && <Store className="w-3 h-3 text-purple-700 shrink-0" />}
                    <span>{c.short}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Bairro e Taxa de Entrega (se Delivery) */}
          {tipo === 'Delivery' && (
            <div className="p-3 bg-purple-50/50 border border-purple-200/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-purple-950">Bairro de Entrega</label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-purple-900 font-bold">Taxa: R$</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setTaxaEntrega(prev => Math.max(0, prev - 1))}
                      className="w-6 h-6 rounded-md bg-white border border-purple-300 text-purple-900 flex items-center justify-center font-black hover:bg-purple-100"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      step="0.5"
                      value={taxaEntrega}
                      onChange={(e) => setTaxaEntrega(parseFloat(e.target.value) || 0)}
                      className="w-14 bg-white border border-purple-300 rounded-md px-1 py-0.5 text-center font-mono font-black text-xs text-purple-950"
                    />
                    <button
                      type="button"
                      onClick={() => setTaxaEntrega(prev => prev + 1)}
                      className="w-6 h-6 rounded-md bg-white border border-purple-300 text-purple-900 flex items-center justify-center font-black hover:bg-purple-100"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bairros rápidos */}
              <div className="flex flex-wrap gap-1">
                {touchBairros.map(b => (
                  <button
                    key={b.nome}
                    type="button"
                    onClick={() => handleBairroClick(b)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      bairro === b.nome
                        ? 'bg-[#3b0764] text-white border-purple-900 shadow-xs'
                        : 'bg-white text-slate-700 border-purple-200 hover:bg-purple-100'
                    }`}
                  >
                    {b.nome} (R${b.taxa})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Valores (Itens + Total) */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Valor dos Produtos / Itens (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={valorItens}
                onChange={(e) => setValorItens(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono font-black text-sm text-slate-900 focus:outline-none focus:border-purple-600"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Total do Pedido (c/ taxa)</label>
              <div className="h-9.5 px-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between font-mono font-black text-base text-emerald-700">
                <span>{formatCurrency(valorTotal)}</span>
                <span className="text-[10px] font-sans font-bold text-emerald-800">
                  {tipo === 'Delivery' ? `(+R$ ${taxaFinal} taxa)` : 'Balcão'}
                </span>
              </div>
            </div>
          </div>

          {/* 4. Forma de Pagamento */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Forma de Pagamento</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {PAYMENT_METHODS.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setFormaPagto(m.id)}
                  className={`py-2 px-1 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${
                    formaPagto === m.id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-black shadow-xs ring-1 ring-emerald-400'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                  }`}
                >
                  {m.short}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Observações / Cliente */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Observações / Nome do Cliente Fiado</label>
            <input
              type="text"
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Ex.: Sem cebola / Cliente: Felipe"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              {confirmDelete ? (
                <div className="flex items-center gap-1.5 bg-red-50 p-1.5 rounded-xl border border-red-200">
                  <span className="text-[10px] text-red-700 font-bold">Confirmar exclusão?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onExcluir(pedido.id);
                      onClose();
                    }}
                    className="px-2.5 py-1 bg-red-600 text-white rounded-lg font-black text-[10px] hover:bg-red-700"
                  >
                    Sim, excluir
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1 text-slate-600 font-bold text-[10px] hover:bg-slate-200 rounded-lg"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Pedido</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
