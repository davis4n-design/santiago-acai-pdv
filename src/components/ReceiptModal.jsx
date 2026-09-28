import React from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  Receipt,
  Printer
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export default function ReceiptModal({ pedido, onClose }) {
  const [copied, setCopied] = React.useState(false);

  if (!pedido) return null;

  const isDelivery = pedido.tipo === 'Delivery';
  const taxaValor = parseFloat(pedido.taxa_entrega) || 0;

  // Texto formatado para WhatsApp com a descrição clara da taxa
  const generateTicketText = () => {
    let t = `🌴 *SANTIAGO AÇAÍ E CIA* 🍧\n`;
    t += `━━━━━━━━━━━━━━━━━━━━━\n`;
    t += `*PEDIDO #${pedido.id}*\n`;
    t += `📅 Data/Hora: ${formatDateTime(pedido.data || new Date().toISOString())}\n`;
    t += `📍 Modalidade: ${pedido.tipo} (${pedido.canal})\n`;
    if (isDelivery) {
      t += `🛵 Bairro de Destino: ${pedido.bairro}\n`;
    }
    t += `━━━━━━━━━━━━━━━━━━━━━\n`;
    t += `🍧 Subtotal dos Produtos: ${formatCurrency(pedido.valor_itens)}\n`;
    
    // Descrição explícita do tipo de taxa
    if (isDelivery) {
      t += `🛵 *Taxa de Entrega (${pedido.bairro}):* ${formatCurrency(taxaValor)}\n`;
    } else {
      t += `🏪 *Taxa de Entrega:* Isenta (Consumo / Retirada no Balcão)\n`;
    }

    t += `━━━━━━━━━━━━━━━━━━━━━\n`;
    t += `💰 *TOTAL A PAGAR: ${formatCurrency(pedido.valor_total)}*\n`;
    t += `💳 Forma de Pagamento: ${pedido.forma_pagto}\n`;
    if (pedido.obs_pagto) {
      t += `📝 Observações: ${pedido.obs_pagto}\n`;
    }
    t += `━━━━━━━━━━━━━━━━━━━━━\n`;
    t += `Agradecemos a sua preferência! O melhor açaí da região! 🌴💜`;
    return t;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateTicketText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(generateTicketText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-6 h-6 rounded-full border border-amber-400" />
            <h3 className="font-black text-[#3b0764] text-base">Comprovante de Venda</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cupom Térmico Estilizado com Descrição Explícita de Taxa */}
        <div className="bg-slate-50 text-slate-900 p-5 rounded-2xl font-mono text-xs shadow-inner space-y-3 border border-slate-200">
          <div className="text-center border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-center mb-1">
              <img src="/logo.png" alt="Logo" className="w-11 h-11 rounded-full border-2 border-amber-400 object-cover" />
            </div>
            <h4 className="font-black text-sm tracking-wider uppercase text-[#3b0764]">SANTIAGO AÇAÍ E CIA</h4>
            <p className="text-[10px] text-slate-500 font-sans">Comprovante Não Fiscal de Atendimento</p>
            <p className="text-[11px] text-slate-700 mt-1 font-bold">PEDIDO #{pedido.id}</p>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Data/Hora:</span>
              <span className="font-bold">{formatDateTime(pedido.data)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Modalidade:</span>
              <span className="font-bold uppercase">{pedido.tipo} - {pedido.canal}</span>
            </div>
            {isDelivery && (
              <div className="flex justify-between">
                <span className="text-slate-500">Bairro de Entrega:</span>
                <span className="font-bold">{pedido.bairro}</span>
              </div>
            )}
          </div>

          {/* Discriminação de Valores com o Tipo de Taxa Bem Descrito */}
          <div className="border-t border-dashed border-slate-300 pt-2.5 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Subtotal Produtos:</span>
              <span className="font-bold">{formatCurrency(pedido.valor_itens)}</span>
            </div>

            {/* Descrição Detalhada da Taxa */}
            {isDelivery ? (
              <div className="flex justify-between text-xs bg-amber-50/80 p-1.5 rounded-lg border border-amber-200/60">
                <span className="font-semibold text-amber-900">
                  Taxa de Entrega ({pedido.bairro}):
                </span>
                <span className="font-black text-amber-900 font-mono">
                  {formatCurrency(taxaValor)}
                </span>
              </div>
            ) : (
              <div className="flex justify-between text-xs text-slate-500 py-0.5">
                <span>Taxa de Entrega:</span>
                <span className="font-bold text-emerald-700">R$ 0,00 (Balcão)</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-black pt-2 border-t border-slate-200">
              <span className="text-slate-800">VALOR TOTAL:</span>
              <span className="text-emerald-700 font-extrabold text-base">{formatCurrency(pedido.valor_total)}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-300 pt-2 text-[10px] space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Forma de Pagamento:</span>
              <strong>{pedido.forma_pagto}</strong>
            </div>
            {pedido.obs_pagto && (
              <div className="text-slate-600 pt-0.5 italic">
                <strong>Obs:</strong> {pedido.obs_pagto}
              </div>
            )}
          </div>

          <div className="text-center pt-2 text-[10px] text-purple-900 font-bold border-t border-slate-200">
            Agradecemos a sua preferência! Volte sempre! 🌴💜
          </div>
        </div>

        {/* Ações */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleCopy}
            className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsApp}
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Enviar no WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
