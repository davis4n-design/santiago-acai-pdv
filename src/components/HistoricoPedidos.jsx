import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Bike, 
  Store, 
  Receipt, 
  Trash2, 
  Clock, 
  MapPin, 
  Filter
} from 'lucide-react';
import { formatCurrency, formatTime, getTodayDateString, isRecordFromToday } from '../utils/formatters';

export default function HistoricoPedidos({ 
  pedidos = [], 
  onExcluirPedido, 
  onVisualizarComprovante 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [periodoFilter, setPeriodoFilter] = useState('hoje');
  const [canalFilter, setCanalFilter] = useState('todos');
  const [pagtoFilter, setPagtoFilter] = useState('todos');

  const todayStr = getTodayDateString();

  const filteredPedidos = useMemo(() => {
    return pedidos.filter(p => {
      if (periodoFilter === 'hoje' && !isRecordFromToday(p)) {
        return false;
      }
      if (canalFilter !== 'todos' && p.canal !== canalFilter) return false;
      if (pagtoFilter !== 'todos' && p.forma_pagto !== pagtoFilter) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        try {
          return (
            String(p.id ?? '').toLowerCase().includes(term) ||
            String(p.bairro ?? '').toLowerCase().includes(term) ||
            String(p.obs_pagto ?? p[''] ?? p.obs ?? '').toLowerCase().includes(term) ||
            String(p.forma_pagto ?? '').toLowerCase().includes(term) ||
            String(p.canal ?? '').toLowerCase().includes(term) ||
            String(p.valor_total ?? '').toLowerCase().includes(term)
          );
        } catch {
          return false;
        }
      }
      return true;
    });
  }, [pedidos, periodoFilter, canalFilter, pagtoFilter, searchTerm, todayStr]);

  const totalFiltrado = useMemo(() => {
    return filteredPedidos.reduce((acc, p) => acc + (parseFloat(p.valor_total) || 0), 0);
  }, [filteredPedidos]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 pb-28 md:pb-16 space-y-4">
      {/* Header Clean Light */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Histórico Geral de Pedidos</h1>
          <p className="text-xs text-slate-500">
            Total filtrado: <strong className="text-emerald-600 font-mono font-bold">{formatCurrency(totalFiltrado)}</strong> ({filteredPedidos.length} pedidos)
          </p>
        </div>
      </div>

      {/* Busca e Filtros */}
      <div className="space-y-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por ID, bairro ou observação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex bg-white border border-slate-200 rounded-xl p-0.5">
            {['hoje', 'todos'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriodoFilter(p)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  periodoFilter === p ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p === 'hoje' ? 'Hoje' : 'Todos'}
              </button>
            ))}
          </div>

          <div className="flex bg-white border border-slate-200 rounded-xl p-0.5">
            {['todos', 'ZAP', 'IFOOD', '99F', 'Balcão'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCanalFilter(c)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  canalFilter === c ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {c === 'todos' ? 'Todos os Canais' : c === 'ZAP' ? 'WhatsApp' : c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="space-y-2">
        {filteredPedidos.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl text-slate-400 text-xs">
            Nenhum pedido encontrado.
          </div>
        ) : (
          filteredPedidos.map((pedido) => {
            const isDelivery = pedido.tipo === 'Delivery';
            return (
              <div
                key={pedido.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                    isDelivery ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {isDelivery ? <Bike className="w-5 h-5" /> : <Store className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-slate-900 text-sm">
                        #{pedido.id}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 uppercase px-1.5 py-0.2 rounded bg-slate-100">
                        {pedido.canal}
                      </span>
                      {isDelivery ? (
                        <span className="text-xs text-slate-700 font-semibold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-orange-600" />
                          {pedido.bairro}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium">Balcão</span>
                      )}
                    </div>

                    {pedido.obs_pagto && (
                      <span className="text-xs text-slate-400 block truncate max-w-xs sm:max-w-md mt-0.5">
                        {pedido.obs_pagto}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-base sm:text-lg font-mono font-black text-emerald-600 block">
                      {formatCurrency(pedido.valor_total)}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {pedido.forma_pagto} • {pedido.data ? formatTime(pedido.data) : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {onVisualizarComprovante && (
                      <button
                        type="button"
                        onClick={() => onVisualizarComprovante(pedido)}
                        title="Ver Comprovante"
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                    )}

                    {onExcluirPedido && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Excluir pedido #${pedido.id}?`)) {
                            onExcluirPedido(pedido.id);
                          }
                        }}
                        title="Excluir"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
