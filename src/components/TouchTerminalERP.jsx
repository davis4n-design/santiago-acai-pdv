import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Bike, 
  Store, 
  Check, 
  Plus, 
  Minus, 
  CreditCard, 
  QrCode, 
  Banknote, 
  ClockAlert, 
  Smartphone, 
  Receipt, 
  Delete,
  Sparkles,
  MapPin,
  Clock,
  Printer,
  Percent,
  ExternalLink,
  X,
  Calendar,
  Filter,
  Pencil,
  Settings,
  Phone,
  Lock,
  Search,
  RotateCcw,
  BarChart3,
  Database,
  Eye,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { DEFAULT_BAIRROS, PAYMENT_METHODS } from '../data/defaultData';
import { formatCurrency, formatTime, getTodayDateString, parseRecordDate, isRecordFromToday, getRecordDateString } from '../utils/formatters';
import { getPlatformFees, getSheetsViewUrl, setSheetsViewUrl, convertToPreviewUrl, getBairrosCadastrados } from '../services/api';
import ConfigTaxasPlataformas from './ConfigTaxasPlataformas';
import ConfigBairrosCacapava from './ConfigBairrosCacapava';
import ConfigPlanilhaGoogle from './ConfigPlanilhaGoogle';
import ModalDetalheFechamento from './ModalDetalheFechamento';
import GerenciadorFiados from './GerenciadorFiados';
import EditOrderModal from './EditOrderModal';
import DashboardAnalitico from './DashboardAnalitico';
import DashboardPinModal from './DashboardPinModal';
import { WhatsAppIcon, IFoodIcon, NoventaIcon } from './BrandIcons';
import SrBelinho from './SrBelinho';
import { lockTerminalDevice, isDashboardAuthenticated } from '../utils/auth';

export default function TouchTerminalERP({ 
  isLocked = false,
  pedidos = [], 
  despesas = [], 
  fiados = [], 
  onRegistrarPedido, 
  onEditarPedido,
  onExcluirPedido,
  onDarBaixaFiado,
  onEditarFiado,
  onAdicionarFiado,
  onExcluirFiado,
  onVisualizarComprovante,
  onOpenSheetsModal,
  onTestConnection,
  syncStatus,
  soundEnabled = true 
}) {
  const todayStr = getTodayDateString();

  // Relógio do Terminal
  const [currentClock, setCurrentClock] = useState('');
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentClock(now.toLocaleTimeString('pt-BR'));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Visualização no Terminal
  const [terminalView, setTerminalView] = useState('pdv'); // 'pdv' | 'fechamento' | 'fiados' | 'historico' | 'configuracoes'
  const [subAbaConfig, setSubAbaConfig] = useState('bairros'); // 'bairros' | 'taxas'
  const [platformFees, setPlatformFees] = useState(getPlatformFees());
  const [bairrosList, setBairrosList] = useState(() => getBairrosCadastrados());
  const [showSheetUrlPrompt, setShowSheetUrlPrompt] = useState(false);
  const [sheetInputUrl, setSheetInputUrl] = useState(getSheetsViewUrl() || '');
  const [pedidoEmEdicao, setPedidoEmEdicao] = useState(null);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [tempDataPicker, setTempDataPicker] = useState(todayStr);
  const [modalDetalheFechamento, setModalDetalheFechamento] = useState(null); // 'despesas' | 'lucro' | 'faturado' | null
  const [gerencialModalConfig, setGerencialModalConfig] = useState({
    isOpen: false,
    title: 'PIN Gerencial',
    subtitle: 'Digite o PIN gerencial de 3 dígitos',
    onSuccess: () => {}
  });

  const executarAcaoGerencial = (title, subtitle, onConfirm) => {
    if (isDashboardAuthenticated()) {
      onConfirm();
    } else {
      setGerencialModalConfig({
        isOpen: true,
        title,
        subtitle,
        onSuccess: () => {
          setGerencialModalConfig(prev => ({ ...prev, isOpen: false }));
          onConfirm();
        }
      });
    }
  };

  const handleAcessarDashboard = () => {
    executarAcaoGerencial(
      'Acesso ao Dashboard',
      'Digite o PIN gerencial para visualizar relatórios e métricas de vendas',
      () => setTerminalView('dashboard')
    );
  };

  const handleAbrirPlanilha = () => {
    executarAcaoGerencial(
      'Abrir Planilha Google',
      'Digite o PIN gerencial para acessar a planilha completa',
      () => {
        const url = getSheetsViewUrl();
        if (url && url.trim()) {
          window.open(convertToPreviewUrl(url), '_blank');
        } else {
          setSheetInputUrl('');
          setShowSheetUrlPrompt(true);
        }
      }
    );
  };

  const handleAcessarConfiguracoes = (subAba = 'bairros') => {
    executarAcaoGerencial(
      'Configurações do Sistema',
      'Digite o PIN gerencial para acessar as configurações',
      () => {
        setSubAbaConfig(subAba);
        setTerminalView('configuracoes');
      }
    );
  };

  const handleSelecionarFiltroHistorico = (novoFiltro) => {
    if (novoFiltro === 'mes') {
      executarAcaoGerencial(
        'Histórico do Mês',
        'Digite o PIN gerencial para visualizar o histórico mensal',
        () => setFiltroHistorico('mes')
      );
    } else if (novoFiltro === 'todo') {
      executarAcaoGerencial(
        'Todo o Período',
        'Digite o PIN gerencial para visualizar todo o histórico de vendas',
        () => setFiltroHistorico('todo')
      );
    } else {
      setFiltroHistorico(novoFiltro);
    }
  };

  useEffect(() => {
    const handleLockDash = () => {
      if (terminalView === 'dashboard') {
        setTerminalView('pdv');
      }
    };
    window.addEventListener('santiago-lock-dashboard', handleLockDash);
    return () => window.removeEventListener('santiago-lock-dashboard', handleLockDash);
  }, [terminalView]);

  // Estado do Pedido
  const [tipo, setTipo] = useState('Delivery'); // 'Delivery' | 'Balcão'
  const [canal, setCanal] = useState('ZAP');
  const [bairro, setBairro] = useState(() => getBairrosCadastrados()[0]?.nome || 'Vila Antônio Augusto');
  const [taxaEntrega, setTaxaEntrega] = useState(() => getBairrosCadastrados()[0]?.taxa || 4.0);

  // Busca e Cadastro Rápido de Bairro no PDV
  const [buscaBairroPDV, setBuscaBairroPDV] = useState('');
  const [modalNovoBairroOpen, setModalNovoBairroOpen] = useState(false);
  const [novoBairroNome, setNovoBairroNome] = useState('');
  const [novoBairroTaxa, setNovoBairroTaxa] = useState('6.00');

  const [displayValue, setDisplayValue] = useState('');
  const [formaPagto, setFormaPagto] = useState('PIX');
  const [obs, setObs] = useState('');
  const [clienteFiado, setClienteFiado] = useState('');
  const [telefoneFiado, setTelefoneFiado] = useState('');
  const [trocoPara, setTrocoPara] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [lastOrderSuccess, setLastOrderSuccess] = useState(null);

  // Cálculos
  const valorItens = parseFloat(displayValue.replace(',', '.')) || 0;
  const taxaFinal = tipo === 'Delivery' ? (parseFloat(taxaEntrega) || 0) : 0;
  const valorTotal = Math.round((valorItens + taxaFinal) * 100) / 100;

  // Taxa de Plataforma calculada em tempo real
  const feePercent = parseFloat(platformFees[canal] || 0);
  const valorTaxaPlataforma = Math.round((valorTotal * (feePercent / 100)) * 100) / 100;
  const valorLiquidoEmpresa = Math.round((valorTotal - valorTaxaPlataforma) * 100) / 100;

  // Caixa Hoje
  const pedidosHoje = useMemo(() => {
    return pedidos.filter(p => isRecordFromToday(p));
  }, [pedidos]);

  const despesasHoje = useMemo(() => {
    return despesas.filter(d => isRecordFromToday(d));
  }, [despesas]);

  const totalFaturadoHoje = useMemo(() => {
    return pedidosHoje.reduce((sum, p) => sum + (parseFloat(p.valor_total) || 0), 0);
  }, [pedidosHoje]);

  const totalDespesasHoje = useMemo(() => {
    return despesasHoje.reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);
  }, [despesasHoje]);

  const lucroLiquidoHoje = totalFaturadoHoje - totalDespesasHoje;

  // Filtro do Histórico de Vendas ('dia' é o padrão)
  const [filtroHistorico, setFiltroHistorico] = useState('dia'); // 'dia' | 'semana' | 'mes' | 'todo' | 'data_especifica'
  const [dataEspecificaFiltro, setDataEspecificaFiltro] = useState(todayStr); // YYYY-MM-DD
  const [filtroCanalHistorico, setFiltroCanalHistorico] = useState('todos'); // 'todos' | 'Balcão' | 'ZAP' | 'IFOOD' | '99F'
  const [filtroBairroHistorico, setFiltroBairroHistorico] = useState('todos'); // 'todos' | nome do bairro
  const [buscaHistorico, setBuscaHistorico] = useState(''); // busca textual por ID, bairro ou observação

  // Lista de bairros disponíveis nos pedidos e cadastrados para o dropdown
  const listaBairrosHistorico = useMemo(() => {
    const set = new Set();
    bairrosList.forEach(b => { if (b.nome) set.add(String(b.nome).trim()); });
    pedidos.forEach(p => { 
      const bStr = String(p.bairro ?? '').trim();
      if (bStr && bStr.toLowerCase() !== 'balcão' && bStr.toLowerCase() !== 'balcao') {
        set.add(bStr); 
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
  }, [bairrosList, pedidos]);

  const pedidosFiltradosHistorico = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    return pedidos.filter(p => {
      try {
        // 1. Filtro por Período
        if (filtroHistorico !== 'todo') {
          const pDate = parseRecordDate(p);
          if (!pDate) return true;

          if (filtroHistorico === 'dia') {
            if (pDate < startOfToday || pDate > endOfToday) return false;
          } else if (filtroHistorico === 'data_especifica') {
            if (dataEspecificaFiltro) {
              const [year, month, day] = dataEspecificaFiltro.split('-').map(Number);
              if (pDate.getFullYear() !== year || pDate.getMonth() !== (month - 1) || pDate.getDate() !== day) {
                return false;
              }
            }
          } else if (filtroHistorico === 'semana') {
            if (pDate < startOfWeek) return false;
          } else if (filtroHistorico === 'mes') {
            if (pDate < startOfMonth) return false;
          }
        }

        // 2. Filtro por Canal / Onde o pedido foi feito
        if (filtroCanalHistorico !== 'todos') {
          const canalNorm = String(p.canal ?? '').trim().toUpperCase();
          const tipoNorm = String(p.tipo ?? '').trim().toUpperCase();
          const targetNorm = String(filtroCanalHistorico ?? '').trim().toUpperCase();

          if (targetNorm === 'BALCÃO' || targetNorm === 'BALCAO') {
            const isBalcao = canalNorm === 'BALCÃO' || canalNorm === 'BALCAO' || tipoNorm === 'BALCÃO' || tipoNorm === 'BALCAO';
            if (!isBalcao) return false;
          } else if (targetNorm === 'IFOOD') {
            if (!canalNorm.includes('IFOOD')) return false;
          } else if (targetNorm === '99F') {
            if (!canalNorm.includes('99') && !canalNorm.includes('NOVENTA')) return false;
          } else if (targetNorm === 'ZAP') {
            if (!canalNorm.includes('ZAP') && !canalNorm.includes('WHATS')) return false;
          } else {
            if (canalNorm !== targetNorm) return false;
          }
        }

        // 3. Filtro por Bairro de Entrega
        if (filtroBairroHistorico !== 'todos') {
          const pBairro = String(p.bairro ?? '').trim().toUpperCase();
          const targetBairro = String(filtroBairroHistorico ?? '').trim().toUpperCase();
          if (pBairro !== targetBairro) return false;
        }

        // 4. Busca por texto (ID, bairro, canal, obs, forma de pagamento, valor)
        if (buscaHistorico && buscaHistorico.trim()) {
          const term = buscaHistorico.toLowerCase().trim();
          const idStr = String(p.id ?? '').toLowerCase();
          const bairroStr = String(p.bairro ?? '').toLowerCase();
          const canalStr = String(p.canal ?? '').toLowerCase();
          const obsStr = String(p.obs_pagto ?? p[''] ?? p.obs ?? '').toLowerCase();
          const pagtoStr = String(p.forma_pagto ?? '').toLowerCase();
          const valorStr = String(p.valor_total ?? '').toLowerCase();

          const matches = 
            idStr.includes(term) ||
            bairroStr.includes(term) ||
            canalStr.includes(term) ||
            obsStr.includes(term) ||
            pagtoStr.includes(term) ||
            valorStr.includes(term);

          if (!matches) {
            return false;
          }
        }

        return true;
      } catch (err) {
        console.warn('Erro ao filtrar pedido:', err, p);
        return false;
      }
    });
  }, [pedidos, filtroHistorico, dataEspecificaFiltro, filtroCanalHistorico, filtroBairroHistorico, buscaHistorico]);

  const totalHistoricoFiltrado = useMemo(() => {
    return pedidosFiltradosHistorico.reduce((sum, p) => sum + (parseFloat(p.valor_total) || 0), 0);
  }, [pedidosFiltradosHistorico]);

  // Som suave de clique
  const playTouchBeep = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      //
    }
  };

  // Som de comemoração
  const playFinalizeChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.12);
      osc2.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.08);
      osc2.frequency.exponentialRampToValueAtTime(1318.5, ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start(ctx.currentTime + 0.08);
      osc1.stop(ctx.currentTime + 0.35);
      osc2.stop(ctx.currentTime + 0.35);
    } catch {
      //
    }
  };

  const handleKeyTouch = (key) => {
    playTouchBeep();
    if (key === 'CLEAR') {
      setDisplayValue('');
      return;
    }
    if (key === 'BACKSPACE') {
      setDisplayValue(prev => prev.slice(0, -1));
      return;
    }
    if (key === '.') {
      if (!displayValue.includes('.')) {
        setDisplayValue(prev => (prev ? prev + '.' : '0.'));
      }
      return;
    }
    setDisplayValue(prev => {
      if (prev.includes('.') && prev.split('.')[1].length >= 2) return prev;
      return prev + key;
    });
  };

  const handleAddQuickCash = (amount) => {
    playTouchBeep();
    const curr = parseFloat(displayValue.replace(',', '.')) || 0;
    setDisplayValue((curr + amount).toFixed(2));
  };

  const handleSelectTipo = (novoTipo) => {
    playTouchBeep();
    setTipo(novoTipo);
    if (novoTipo === 'Balcão') {
      setCanal('Balcão');
      setTaxaEntrega(0);
    } else {
      setCanal('ZAP');
      const bObj = bairrosList.find(b => b.nome === bairro) || bairrosList[0];
      setTaxaEntrega(bObj ? bObj.taxa : 4.0);
    }
  };

  const handleSelectBairro = (bName, taxa) => {
    playTouchBeep();
    setBairro(bName);
    setTaxaEntrega(taxa);
  };

  const handleSalvarNovoBairro = (e) => {
    if (e) e.preventDefault();
    const nomeLimpo = novoBairroNome.trim();
    const taxaNum = parseFloat(novoBairroTaxa.replace(',', '.')) || 0;
    if (!nomeLimpo) return;

    const existente = bairrosList.find(b => b.nome.toLowerCase() === nomeLimpo.toLowerCase());
    let listaAtualizada;
    if (existente) {
      listaAtualizada = bairrosList.map(b => b.nome.toLowerCase() === nomeLimpo.toLowerCase() ? { ...b, taxa: taxaNum } : b);
    } else {
      listaAtualizada = [...bairrosList, { nome: nomeLimpo, taxa: taxaNum }].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
    }

    setBairrosList(listaAtualizada);
    saveBairrosCadastrados(listaAtualizada);
    handleSelectBairro(nomeLimpo, taxaNum);
    setNovoBairroNome('');
    setNovoBairroTaxa('6.00');
    setBuscaBairroPDV('');
    setModalNovoBairroOpen(false);
    playFinalizeChime();
  };

  const handleFinalizarPedido = async () => {
    if (valorItens <= 0 || submitting) return;

    setSubmitting(true);

    let finalObs = obs.trim();
    if (formaPagto === 'DINHEIRO' && trocoPara) {
      finalObs = finalObs ? `${finalObs} | Troco p/ R$ ${trocoPara}` : `Troco p/ R$ ${trocoPara}`;
    }
    if (formaPagto === 'A REC') {
      const clienteNome = clienteFiado.trim();
      const telCliente = telefoneFiado.trim();
      if (!clienteNome) {
        alert('Por favor, informe o nome do cliente para registrar o Fiado.');
        setSubmitting(false);
        return;
      }
      if (!telCliente) {
        alert('Por favor, informe o telefone WhatsApp do cliente para registrar o Fiado.');
        setSubmitting(false);
        return;
      }
      finalObs = finalObs ? `${finalObs} | Cliente: ${clienteNome} (Zap: ${telCliente})` : `Cliente: ${clienteNome} (Zap: ${telCliente})`;
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
      cliente_fiado: formaPagto === 'A REC' ? clienteFiado.trim() : null,
      telefone_fiado: formaPagto === 'A REC' ? telefoneFiado.trim() : null
    };

    try {
      const res = await onRegistrarPedido(payload);
      playFinalizeChime();
      confetti({
        particleCount: 45,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#3b0764', '#f59e0b', '#0284c7', '#10b981', '#ffffff']
      });

      setLastOrderSuccess({
        id: res?.pedido?.id || `PED-${Date.now().toString().slice(-4)}`,
        total: valorTotal,
        tipo,
        bairro: payload.bairro,
        forma: formaPagto
      });

      setDisplayValue('');
      setObs('');
      setTrocoPara('');
      setClienteFiado('');
      setTelefoneFiado('');

      setTimeout(() => {
        setLastOrderSuccess(null);
      }, 3000);

    } finally {
      setSubmitting(false);
    }
  };

  // Teclado Físico
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Se a tela estiver bloqueada pelo PIN, ignora qualquer tecla do terminal
      if (isLocked) return;

      if (e.key === 'F1') { e.preventDefault(); setTerminalView('pdv'); }
      if (e.key === 'F2') { e.preventDefault(); setTerminalView('fechamento'); }
      if (e.key === 'F3') { e.preventDefault(); setTerminalView('fiados'); }
      if (e.key === 'F4') { e.preventDefault(); setTerminalView('historico'); }
      if (e.key === 'F5') { e.preventDefault(); handleAcessarDashboard(); }
      if (e.key === 'F6') { 
        e.preventDefault(); 
        if (terminalView === 'configuracoes') {
          setTerminalView('pdv');
        } else {
          handleAcessarConfiguracoes('bairros');
        }
      }

      if (terminalView === 'pdv') {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleFinalizarPedido();
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setDisplayValue('');
        }
        if (e.key >= '0' && e.key <= '9') {
          handleKeyTouch(e.key);
        }
        if (e.key === '.' || e.key === ',') {
          handleKeyTouch('.');
        }
        if (e.key === 'Backspace') {
          handleKeyTouch('BACKSPACE');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, terminalView, valorItens, valorTotal, tipo, canal, bairro, taxaFinal, formaPagto, obs, trocoPara, clienteFiado, telefoneFiado]);

  const touchBairrosFiltrados = useMemo(() => {
    if (!buscaBairroPDV.trim()) return bairrosList;
    const term = buscaBairroPDV.toLowerCase().trim();
    return bairrosList.filter(b => b.nome.toLowerCase().includes(term));
  }, [bairrosList, buscaBairroPDV]);

  const touchBairros = touchBairrosFiltrados;

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-100 text-slate-800 select-none">
      
      {/* ======================================================== */}
      {/* CABEÇALHO COM IDENTIDADE VISUAL: SANTIAGO AÇAÍ E CIA     */}
      {/* ======================================================== */}
      <header className="h-16 bg-gradient-to-r from-[#2a0845] via-[#3b0764] to-[#1e1035] text-white px-3 sm:px-5 flex items-center justify-between shrink-0 shadow-lg border-b border-amber-500/30 z-30">
        
        {/* Logo Oficial e Nome da Empresa */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src="/logo.png" 
              alt="Santiago Açaí e Cia" 
              className="w-11 h-11 rounded-full border-2 border-amber-400 shadow-md object-cover bg-amber-400"
            />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#2a0845]"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg tracking-tight text-white drop-shadow-sm">
                SANTIAGO <span className="text-amber-400 font-black">AÇAÍ</span> E CIA
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold border border-amber-400/40">
                TERMINAL 01
              </span>
            </div>
            <span className="text-[11px] text-purple-200/80 font-mono hidden sm:block">
              CAIXA LIVRE • {currentClock}
            </span>
          </div>
        </div>

        {/* Abas com Cores da Logo (F1 - F4) */}
        <div className="flex items-center gap-1.5 bg-black/25 backdrop-blur-xs p-1 rounded-xl border border-purple-500/30">
          <button
            onClick={() => setTerminalView('pdv')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              terminalView === 'pdv'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md font-black ring-1 ring-amber-300'
                : 'text-purple-100 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="opacity-60 text-[10px] hidden sm:inline">[F1]</span>
            <span>NOVO PEDIDO</span>
          </button>

          <button
            onClick={() => setTerminalView('fechamento')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              terminalView === 'fechamento'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md font-black ring-1 ring-amber-300'
                : 'text-purple-100 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="opacity-60 text-[10px] hidden sm:inline">[F2]</span>
            <span>FECHAMENTO</span>
          </button>

          <button
            onClick={() => setTerminalView('fiados')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              terminalView === 'fiados'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md font-black ring-1 ring-amber-300'
                : 'text-purple-100 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="opacity-60 text-[10px] hidden sm:inline">[F3]</span>
            <span>FIADOS</span>
          </button>

          <button
            onClick={() => setTerminalView('historico')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              terminalView === 'historico'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md font-black ring-1 ring-amber-300'
                : 'text-purple-100 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="opacity-60 text-[10px] hidden sm:inline">[F4]</span>
            <span>HISTÓRICO</span>
          </button>

          <button
            onClick={handleAcessarDashboard}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              terminalView === 'dashboard'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md font-black ring-1 ring-amber-300'
                : 'text-purple-100 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="opacity-60 text-[10px] hidden sm:inline">[F5]</span>
            <BarChart3 className="w-3.5 h-3.5" />
            <span>DASHBOARD</span>
          </button>

        </div>

        {/* Status de Conexão da Planilha & Botão Abrir Planilha & Engrenagem de Configurações */}
        <div className="flex items-center gap-2.5">
          {/* Mascote Singelo: Sr. Belinho */}
          <SrBelinho />
          
          {/* Botão Principal: ABRIR PLANILHA */}
          <button
            onClick={handleAbrirPlanilha}
            title="Abrir a Planilha Google (Requer PIN Gerencial)"
            className="px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-md transition-all active:scale-95 cursor-pointer ring-1 ring-emerald-300"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>ABRIR PLANILHA</span>
          </button>

          {/* Único Indicador de Status: Apenas a Bolinha (Texto aparece ao passar o mouse) */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => handleAcessarConfiguracoes('planilha')}
              title={syncStatus.isSyncing ? 'Verificando sincronização...' : (syncStatus.connected ? 'Planilha Conectada (Acesso Gerencial)' : 'Planilha Desconectada / Modo Local (Acesso Gerencial)')}
              className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all cursor-pointer shadow-xs active:scale-95 ${
                syncStatus.connected
                  ? 'bg-emerald-500/20 border-emerald-400/50 hover:bg-emerald-500/35'
                  : syncStatus.isSyncing
                  ? 'bg-amber-500/20 border-amber-400/50'
                  : 'bg-rose-500/20 border-rose-400/50 hover:bg-rose-500/35'
              }`}
            >
              <span className={`w-3 h-3 rounded-full ${
                syncStatus.connected 
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse' 
                  : syncStatus.isSyncing 
                  ? 'bg-amber-400 animate-ping' 
                  : 'bg-rose-500 shadow-sm shadow-rose-400'
              }`}></span>
            </button>

            {/* Tooltip elegante ao passar o mouse */}
            <div className="absolute right-0 top-full mt-2 hidden group-hover:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/95 text-white text-xs font-bold shadow-xl border border-slate-700 whitespace-nowrap z-50 pointer-events-none">
              <span className={`w-2 h-2 rounded-full ${
                syncStatus.connected ? 'bg-emerald-400' : syncStatus.isSyncing ? 'bg-amber-400' : 'bg-rose-400'
              }`}></span>
              <span>{syncStatus.isSyncing ? 'Verificando...' : (syncStatus.connected ? 'Planilha Conectada (Gerência)' : 'Modo Local / Desconectada (Gerência)')}</span>
            </div>
          </div>

          {/* Botão de Configurações (Ícone de Engrenagem no Canto) */}
          <button
            type="button"
            onClick={() => {
              if (terminalView === 'configuracoes') {
                setTerminalView('pdv');
              } else {
                handleAcessarConfiguracoes('bairros');
              }
            }}
            title="Configurações do Sistema (Requer PIN Gerencial)"
            className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all cursor-pointer shadow-xs active:scale-95 ${
              terminalView === 'configuracoes'
                ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-300 shadow-md font-black'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Botão de Bloquear Terminal (Cadeado) */}
          <button
            type="button"
            onClick={lockTerminalDevice}
            title="Bloquear Caixa / Exigir PIN"
            className="w-8 h-8 rounded-xl flex items-center justify-center border border-purple-400/30 bg-purple-950/60 hover:bg-purple-900 text-purple-200 hover:text-white transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* CORPO DO TERMINAL ERP (100% DA ALTURA DISPONÍVEL)        */}
      {/* ======================================================== */}
      <main className="flex-1 overflow-hidden p-2 sm:p-3">
        {terminalView === 'pdv' && (
          <div className="h-full w-full grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-3">
            
            {/* ---------------------------------------------------- */}
            {/* COLUNA 1: MODALIDADE, CANAL & BAIRROS (TROPICAL/AÇAÍ)*/}
            {/* ---------------------------------------------------- */}
            <div className="md:col-span-3 bg-white border border-slate-300/80 rounded-2xl p-3 flex flex-col gap-2.5 shadow-xs overflow-y-auto">
              
              {/* Botões Gigantes: DELIVERY vs BALCÃO */}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-900 block mb-1">
                  1. Modalidade de Venda
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSelectTipo('Delivery')}
                    className={`h-16 rounded-2xl font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-1 border transition-all active:scale-[0.98] ${
                      tipo === 'Delivery'
                        ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 border-amber-500 shadow-md ring-2 ring-amber-400'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Bike className="w-5 h-5" />
                    <span>DELIVERY</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTipo('Balcão')}
                    className={`h-16 rounded-2xl font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-1 border transition-all active:scale-[0.98] ${
                      tipo === 'Balcão'
                        ? 'bg-[#3b0764] text-white border-[#3b0764] shadow-md ring-2 ring-purple-400'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Store className="w-5 h-5 text-amber-300" />
                    <span>BALCÃO</span>
                  </button>
                </div>
              </div>

              {/* Se for Delivery: Canais */}
              {tipo === 'Delivery' ? (
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-900 block mb-1">
                    2. Canal de Entrada
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {/* Canal: WhatsApp */}
                    <button
                      type="button"
                      onClick={() => { playTouchBeep(); setCanal('ZAP'); }}
                      className={`h-12 rounded-xl text-xs font-black border transition-all active:scale-95 flex items-center justify-center gap-1.5 px-2 ${
                        canal === 'ZAP'
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-950/30'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300'
                      }`}
                    >
                      <WhatsAppIcon 
                        className="w-4 h-4" 
                        inverted={canal === 'ZAP'} 
                        color={canal === 'ZAP' ? '#FFFFFF' : '#059669'} 
                      />
                      <span>WhatsApp</span>
                    </button>

                    {/* Canal: iFood */}
                    <button
                      type="button"
                      onClick={() => { playTouchBeep(); setCanal('IFOOD'); }}
                      className={`h-12 rounded-xl text-xs font-black border transition-all active:scale-95 flex items-center justify-center gap-1.5 px-2 ${
                        canal === 'IFOOD'
                          ? 'bg-[#ea1d2c] text-white border-red-700 shadow-sm ring-2 ring-red-950/30'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-300'
                      }`}
                    >
                      <IFoodIcon 
                        className="h-3.5 w-auto" 
                        inverted={canal === 'IFOOD'} 
                        color={canal === 'IFOOD' ? '#FFFFFF' : '#ea1d2c'} 
                      />
                      <span>iFood</span>
                    </button>

                    {/* Canal: 99Food */}
                    <button
                      type="button"
                      onClick={() => { playTouchBeep(); setCanal('99F'); }}
                      className={`h-12 rounded-xl text-xs font-black border transition-all active:scale-95 flex items-center justify-center gap-1.5 px-2 ${
                        canal === '99F'
                          ? 'bg-[#ffc700] text-slate-950 border-amber-500 shadow-sm ring-2 ring-amber-950/30 font-black'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-amber-50 hover:text-amber-950 hover:border-amber-300'
                      }`}
                    >
                      <NoventaIcon 
                        className="h-4 w-4" 
                        withBorder={canal === '99F'} 
                      />
                      <span>99Food</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 font-bold flex items-center justify-between">
                  <span>Atendimento no Balcão</span>
                  <span className="text-purple-700 font-mono">Taxa: R$ 0,00</span>
                </div>
              )}

              {/* Se Delivery: Grade Táctil de Bairros */}
              {tipo === 'Delivery' && (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-1 gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-900 shrink-0">
                        3. Bairro & Taxa
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        ({touchBairros.length})
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Botão rápido para Adicionar Novo Bairro */}
                      <button
                        type="button"
                        onClick={() => {
                          setNovoBairroNome(buscaBairroPDV.trim());
                          setModalNovoBairroOpen(true);
                        }}
                        className="px-2 py-0.5 bg-[#3b0764] hover:bg-purple-900 text-white rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-0.5 shadow-xs active:scale-95"
                        title="Cadastrar novo bairro se não houver na lista"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Novo</span>
                      </button>
                    </div>
                  </div>

                  {/* Barra de busca rápida de bairro */}
                  <div className="relative mb-1.5 shrink-0">
                    <input
                      type="text"
                      placeholder="Filtrar bairro..."
                      value={buscaBairroPDV}
                      onChange={(e) => setBuscaBairroPDV(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg py-1 pl-6 pr-6 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-600 shadow-xs font-semibold"
                    />
                    <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2 pointer-events-none" />
                    {buscaBairroPDV && (
                      <button
                        type="button"
                        onClick={() => setBuscaBairroPDV('')}
                        className="absolute right-1.5 top-1.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 overflow-y-auto pr-0.5 max-h-52 md:max-h-none flex-1">
                    {touchBairros.length === 0 ? (
                      <div className="col-span-2 text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-1.5">
                        <p className="text-[11px] font-bold text-slate-600">
                          Bairro "{buscaBairroPDV}" não encontrado
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setNovoBairroNome(buscaBairroPDV.trim());
                            setModalNovoBairroOpen(true);
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black shadow-xs cursor-pointer inline-flex items-center gap-1 active:scale-95 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Cadastrar "{buscaBairroPDV}"</span>
                        </button>
                      </div>
                    ) : (
                      touchBairros.map(b => {
                        const isSelected = bairro === b.nome;
                        return (
                          <button
                            key={b.nome}
                            type="button"
                            onClick={() => handleSelectBairro(b.nome, b.taxa)}
                            className={`p-2 rounded-xl text-left border transition-all active:scale-95 flex flex-col justify-between ${
                              isSelected
                                ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400'
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span className="font-extrabold text-xs text-slate-900 truncate" title={b.nome}>{b.nome}</span>
                            <span className="text-[11px] font-mono font-bold text-amber-700">
                              {formatCurrency(b.taxa)}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Ajuste manual da taxa de entrega */}
                  <div className="pt-2 flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200 mt-auto">
                    <button
                      type="button"
                      onClick={() => { playTouchBeep(); setTaxaEntrega(prev => Math.max(0, prev - 1)); }}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-black text-slate-700 flex items-center justify-center hover:bg-slate-100"
                    >
                      -1
                    </button>
                    <div className="text-center font-mono">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Taxa Entrega</span>
                      <span className="font-bold text-sm text-emerald-700">{formatCurrency(taxaEntrega)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { playTouchBeep(); setTaxaEntrega(prev => prev + 1); }}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-black text-slate-700 flex items-center justify-center hover:bg-slate-100"
                    >
                      +1
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ---------------------------------------------------- */}
            {/* COLUNA 2: DISPLAY LCD AÇAÍ & TECLADO TOUCH ERP       */}
            {/* ---------------------------------------------------- */}
            <div className="md:col-span-5 bg-white border border-slate-300/80 rounded-2xl p-3 flex flex-col gap-2.5 shadow-xs">
              
              {/* DISPLAY LCD ESTILO CAIXA DE AÇAÍTERIA */}
              <div className="bg-[#1f0535] text-white rounded-2xl p-4 shadow-inner border border-purple-900/60 space-y-1">
                <div className="flex items-center justify-between text-xs text-purple-200/80 font-mono">
                  <span>PRODUTOS: {formatCurrency(valorItens)}</span>
                  <span>TAXA: {formatCurrency(taxaFinal)}</span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                    TOTAL A PAGAR:
                  </span>
                  <span className="text-3xl sm:text-4xl font-mono font-black text-emerald-400 tracking-tight">
                    {formatCurrency(valorTotal)}
                  </span>
                </div>
              </div>

              {/* Botões Rápidos de Dinheiro */}
              <div className="grid grid-cols-5 gap-1.5">
                {[10, 20, 30, 50, 100].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAddQuickCash(val)}
                    className="py-2 rounded-xl bg-slate-100 border border-slate-300 font-mono font-black text-xs sm:text-sm text-slate-800 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 active:scale-95 transition-all shadow-2xs"
                  >
                    +{val}
                  </button>
                ))}
              </div>

              {/* TECLADO TOUCH ERP */}
              <div className="flex-1 grid grid-cols-3 gap-2 min-h-60 sm:min-h-72">
                {[
                  '7', '8', '9',
                  '4', '5', '6',
                  '1', '2', '3',
                  'CLEAR', '0', '.'
                ].map(k => {
                  const isClear = k === 'CLEAR';
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => handleKeyTouch(k)}
                      className={`rounded-2xl font-mono font-black text-xl sm:text-2xl transition-all active:scale-[0.96] flex items-center justify-center border shadow-xs ${
                        isClear
                          ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100 text-sm font-sans font-bold'
                          : 'bg-slate-50 border-slate-300 text-slate-900 hover:bg-white'
                      }`}
                    >
                      {isClear ? 'LIMPAR' : k}
                    </button>
                  );
                })}
              </div>

              {/* Campo de Observação Touch */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Observação (ex: com granola, leite condensado, sem banana)..."
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-purple-600"
                />
                <button
                  type="button"
                  onClick={() => handleKeyTouch('BACKSPACE')}
                  className="px-4 bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-700 font-bold flex items-center justify-center"
                  title="Apagar dígito"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* COLUNA 3: FORMAS DE PAGAMENTO, CUPOM & FINALIZAR     */}
            {/* ---------------------------------------------------- */}
            <div className="md:col-span-4 bg-white border border-slate-300/80 rounded-2xl p-3 flex flex-col gap-2.5 shadow-xs">
              
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-900 block">
                4. Forma de Pagamento
              </span>

              {/* Botões Grandes de Pagamento */}
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map(pm => {
                  const isSelected = formaPagto === pm.id;
                  let selectedClass = 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-700';
                  if (isSelected) {
                    if (pm.id === 'PIX') selectedClass = 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400';
                    else if (pm.id === 'A REC') selectedClass = 'bg-[#3b0764] text-amber-300 border-[#3b0764] shadow-md ring-2 ring-amber-400';
                    else if (pm.id === 'DINHEIRO') selectedClass = 'bg-amber-500 text-slate-950 border-amber-500 shadow-md ring-2 ring-amber-400';
                    else if (pm.id === 'CREDITO' || pm.id === 'DEBITO') selectedClass = 'bg-sky-600 text-white border-sky-600 shadow-md ring-2 ring-sky-400';
                  }

                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => { playTouchBeep(); setFormaPagto(pm.id); }}
                      className={`h-13 rounded-2xl border font-black text-xs sm:text-sm flex items-center justify-between px-3 transition-all active:scale-[0.98] ${
                        isSelected
                          ? selectedClass
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {pm.id === 'PIX' && <QrCode className="w-4 h-4 text-emerald-500" />}
                        {pm.id === 'CREDITO' && <CreditCard className="w-4 h-4 text-sky-500" />}
                        {pm.id === 'DEBITO' && <CreditCard className="w-4 h-4 text-sky-500" />}
                        {pm.id === 'DINHEIRO' && <Banknote className="w-4 h-4 text-amber-500" />}
                        {pm.id === 'A REC' && <ClockAlert className="w-4 h-4 text-purple-600" />}
                        {pm.id === 'ON' && <Smartphone className="w-4 h-4 text-indigo-500" />}
                        <span>{pm.label}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>

              {/* Se Dinheiro: Teclas de Troco */}
              {formaPagto === 'DINHEIRO' && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 animate-fadeIn">
                  <span className="text-[11px] font-bold text-amber-900 block">Troco para:</span>
                  <div className="flex gap-1.5">
                    {['Exato', '50', '100'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => { playTouchBeep(); setTrocoPara(t === 'Exato' ? '' : t); }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          (t === 'Exato' && !trocoPara) || trocoPara === t
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white border-amber-200 text-amber-900'
                        }`}
                      >
                        {t === 'Exato' ? 'Sem Troco' : `R$ ${t}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Se Fiado: Clientes & Telefone WhatsApp Obrigatório */}
              {formaPagto === 'A REC' && (
                <div className="p-2.5 bg-purple-50/80 border-2 border-purple-300 rounded-2xl space-y-2 animate-fadeIn shadow-2xs">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase text-purple-950 block mb-1">
                      Cliente Fiado / Mensalista:
                    </span>
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {fiados.slice(0, 6).map(f => (
                        <button
                          key={f.cliente}
                          type="button"
                          onClick={() => { 
                            playTouchBeep(); 
                            setClienteFiado(f.cliente);
                            if (f.telefone) setTelefoneFiado(f.telefone);
                          }}
                          className={`px-2 py-1 rounded-lg text-xs font-black border transition-all cursor-pointer ${
                            clienteFiado === f.cliente 
                              ? 'bg-[#3b0764] text-amber-300 border-[#3b0764] shadow-xs ring-1 ring-purple-400' 
                              : 'bg-white border-purple-200 text-purple-950 hover:bg-purple-100'
                          }`}
                        >
                          {f.cliente}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Nome do cliente fiado..."
                      value={clienteFiado}
                      onChange={(e) => setClienteFiado(e.target.value.toUpperCase())}
                      className="w-full bg-white border border-purple-300 focus:border-purple-600 rounded-xl py-2 px-3 text-xs font-bold uppercase text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-emerald-950 flex items-center gap-1 mb-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp do Cliente (Obrigatório):</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="Ex: (12) 99123-4567"
                      value={telefoneFiado}
                      onChange={(e) => setTelefoneFiado(e.target.value)}
                      className="w-full bg-white border-2 border-emerald-400 focus:border-emerald-600 rounded-xl py-2 px-3 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Resumo do Cupom */}
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col justify-between text-xs overflow-y-auto min-h-24">
                <div className="space-y-1 font-mono">
                  <div className="flex justify-between font-bold text-slate-700 border-b border-slate-200 pb-1">
                    <span>{tipo.toUpperCase()} • {canal}</span>
                    <span>{tipo === 'Delivery' ? bairro : 'BALCÃO'}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 pt-1">
                    <span>Produtos:</span>
                    <span>{formatCurrency(valorItens)}</span>
                  </div>
                  {tipo === 'Delivery' ? (
                    <div className="flex justify-between text-amber-900 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                      <span>Taxa de Entrega ({bairro}):</span>
                      <span>{formatCurrency(taxaFinal)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-slate-500 py-0.5">
                      <span>Taxa de Entrega:</span>
                      <span className="text-emerald-700 font-bold">R$ 0,00 (Balcão)</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-800 font-bold pt-1">
                    <span>Pagamento:</span>
                    <span>{formaPagto}</span>
                  </div>

                  {feePercent > 0 && (
                    <div className="bg-red-50 text-red-900 text-[11px] p-1.5 rounded-lg border border-red-200 space-y-0.5 mt-1">
                      <div className="flex justify-between font-semibold">
                        <span>Taxa {canal} ({feePercent}%):</span>
                        <span className="font-mono text-red-700">-{formatCurrency(valorTaxaPlataforma)}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t border-red-200/60 pt-0.5">
                        <span>Líquido Empresa:</span>
                        <span className="font-mono text-emerald-700">{formatCurrency(valorLiquidoEmpresa)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {lastOrderSuccess && (
                  <div className="bg-emerald-100 text-emerald-800 p-2 rounded-xl text-center font-bold text-[11px] animate-fadeIn mt-2">
                    ✓ Pedido #{lastOrderSuccess.id} gravado!
                  </div>
                )}
              </div>

              {/* BOTÃO FINALIZAR GIGANTE TOUCH */}
              <button
                type="button"
                disabled={valorItens <= 0 || submitting}
                onClick={handleFinalizarPedido}
                className={`h-20 w-full rounded-2xl font-black text-lg sm:text-xl tracking-wider flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg ${
                  valorItens > 0
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 cursor-pointer ring-4 ring-emerald-300'
                    : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    <span>GRAVANDO...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-8 h-8 stroke-[3]" />
                    <span>FINALIZAR PEDIDO</span>
                    {valorTotal > 0 && (
                      <span className="bg-black/25 px-2.5 py-1 rounded-xl text-white font-mono text-base">
                        {formatCurrency(valorTotal)}
                      </span>
                    )}
                  </>
                )}
              </button>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TELAS SECUNDÁRIAS DENTRO DO TERMINAL                     */}
        {/* ======================================================== */}
        {/* ======================================================== */}
        {/* TELAS SECUNDÁRIAS DENTRO DO TERMINAL                     */}
        {/* ======================================================== */}
        {terminalView === 'fechamento' && (
          <div className="h-full w-full bg-slate-50/50 border border-slate-300 rounded-2xl p-4 sm:p-6 overflow-y-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 bg-white p-4 rounded-2xl shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900">Fechamento e Auditoria do Caixa</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                    Hoje: {todayStr.split('-').reverse().join('/')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Conferência do dia • Clique nos cartões abaixo para abrir o detalhamento completo de cada valor
                </p>
              </div>
              <button
                onClick={() => setTerminalView('pdv')}
                className="px-4 py-2.5 bg-[#3b0764] text-white rounded-xl text-xs font-bold hover:bg-purple-900 transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <span>← Voltar ao Terminal PDV</span>
              </button>
            </div>

            {/* 4 CARDS INTERATIVOS COM BADGES DE CLIQUE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Card 1: TOTAL FATURADO */}
              <div 
                onClick={() => setModalDetalheFechamento('faturado')}
                role="button"
                tabIndex={0}
                className="group bg-white hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-400 p-4 rounded-2xl transition-all shadow-xs hover:shadow-md cursor-pointer relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">TOTAL FATURADO</span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full group-hover:bg-emerald-200 transition-colors">
                    <Eye className="w-3 h-3" />
                    <span>Ver Origem</span>
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-600">
                  {formatCurrency(totalFaturadoHoje)}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{pedidosHoje.length} pedidos hoje</span>
                  <span className="font-semibold text-emerald-600 group-hover:underline">Detalhar canais →</span>
                </div>
              </div>

              {/* Card 2: QUANTIDADE PEDIDOS */}
              <div 
                onClick={() => setTerminalView('historico')}
                role="button"
                tabIndex={0}
                className="group bg-white hover:bg-purple-50/40 border border-slate-200 hover:border-purple-400 p-4 rounded-2xl transition-all shadow-xs hover:shadow-md cursor-pointer relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">QTD. PEDIDOS</span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full group-hover:bg-purple-200 transition-colors">
                    <Receipt className="w-3 h-3" />
                    <span>Ver Pedidos</span>
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-black text-slate-900">
                  {pedidosHoje.length}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Ticket médio: {pedidosHoje.length > 0 ? formatCurrency(totalFaturadoHoje / pedidosHoje.length) : 'R$ 0,00'}
                  </span>
                  <span className="font-semibold text-purple-700 group-hover:underline">Histórico →</span>
                </div>
              </div>

              {/* Card 3: TOTAL DESPESAS (Destaque para entender os R$ 122,43) */}
              <div 
                onClick={() => setModalDetalheFechamento('despesas')}
                role="button"
                tabIndex={0}
                className="group bg-white hover:bg-rose-50/50 border-2 border-rose-200 hover:border-rose-400 p-4 rounded-2xl transition-all shadow-xs hover:shadow-md cursor-pointer relative overflow-hidden ring-2 ring-rose-50"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-rose-700 font-bold uppercase tracking-wider">TOTAL DESPESAS</span>
                  <span className="flex items-center gap-1 text-[10px] font-black text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full group-hover:bg-rose-200 transition-colors animate-pulse">
                    <Eye className="w-3 h-3" />
                    <span>Clique p/ Detalhar</span>
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-black text-rose-600">
                  {formatCurrency(totalDespesasHoje)}
                </div>
                <div className="mt-2 pt-2 border-t border-rose-100 flex items-center justify-between text-xs text-rose-600 font-medium">
                  <span>{despesasHoje.length} lançamento(s) hoje</span>
                  <span className="font-bold underline">Ver itens e planilha →</span>
                </div>
              </div>

              {/* Card 4: LUCRO DO DIA (Destaque para a fórmula) */}
              <div 
                onClick={() => setModalDetalheFechamento('lucro')}
                role="button"
                tabIndex={0}
                className="group bg-white hover:bg-emerald-50/50 border-2 border-emerald-200 hover:border-emerald-400 p-4 rounded-2xl transition-all shadow-xs hover:shadow-md cursor-pointer relative overflow-hidden ring-2 ring-emerald-50"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider">LUCRO DO DIA</span>
                  <span className="flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full group-hover:bg-emerald-200 transition-colors">
                    <TrendingUp className="w-3 h-3" />
                    <span>Ver Cálculo</span>
                  </span>
                </div>
                <div className={`text-2xl sm:text-3xl font-mono font-black ${lucroLiquidoHoje >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {formatCurrency(lucroLiquidoHoje)}
                </div>
                <div className="mt-2 pt-2 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-700 font-medium">
                  <span>Faturamento - Despesas</span>
                  <span className="font-bold underline">Como é calculado? →</span>
                </div>
              </div>
            </div>

            {/* SEÇÕES DE AUDITORIA VISÍVEL DIRETA NO FECHAMENTO */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* BLOCO 1: ITENS DE DESPESAS DE HOJE */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      Origem das Despesas de Hoje
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      O que está somando os {formatCurrency(totalDespesasHoje)}
                    </p>
                  </div>
                  <button
                    onClick={() => setModalDetalheFechamento('despesas')}
                    className="text-xs text-rose-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver Tudo</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {despesasHoje.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Nenhuma despesa ou custo lançado para a data de hoje.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {despesasHoje.map((d, idx) => {
                      const v = parseFloat(d.valor) || 0;
                      return (
                        <div 
                          key={d.id || idx}
                          onClick={() => setModalDetalheFechamento('despesas')}
                          className="flex items-center justify-between p-3 rounded-xl bg-rose-50/60 border border-rose-100 hover:bg-rose-100/60 transition-colors cursor-pointer"
                        >
                          <div>
                            <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                              <span>{d.descricao || d.nome || 'Despesa'}</span>
                              {d.categoria && (
                                <span className="text-[10px] font-medium bg-white px-2 py-0.5 rounded text-rose-700 border border-rose-200">
                                  {d.categoria}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                              <span>Origem: {d.origem || 'Planilha Google / Fechamento'}</span>
                              {d.dia && <span>• Dia {d.dia}</span>}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-rose-600 text-sm">
                              -{formatCurrency(v)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* BLOCO 2: DEMONSTRATIVO RÁPIDO DO LUCRO */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      Demonstrativo do Lucro
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Entenda passo a passo a matemática do dia
                    </p>
                  </div>
                  <button
                    onClick={() => setModalDetalheFechamento('lucro')}
                    className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Fórmula Completa</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="text-slate-600 font-medium">(+) Faturamento Bruto ({pedidosHoje.length} pedidos)</span>
                    <span className="font-mono font-bold text-emerald-600">+{formatCurrency(totalFaturadoHoje)}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="text-slate-600 font-medium">(-) Total de Despesas ({despesasHoje.length} lançadas)</span>
                    <span className="font-mono font-bold text-rose-600">-{formatCurrency(totalDespesasHoje)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 mt-2">
                    <div className="font-bold text-emerald-950">
                      (=) Lucro do Dia
                      <span className="block text-[10px] font-normal text-emerald-700">Faturamento menos despesas diretas</span>
                    </div>
                    <span className="font-mono text-base font-black text-emerald-700">
                      {formatCurrency(lucroLiquidoHoje)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {terminalView === 'fiados' && (
          <GerenciadorFiados
            fiados={fiados}
            onDarBaixaFiado={onDarBaixaFiado}
            onEditarFiado={onEditarFiado}
            onAdicionarFiado={onAdicionarFiado}
            onExcluirFiado={onExcluirFiado}
            onClose={() => setTerminalView('pdv')}
          />
        )}

        {terminalView === 'historico' && (
          <div className="h-full w-full bg-white border border-slate-300 rounded-2xl p-4 sm:p-6 overflow-y-auto space-y-4 flex flex-col">
            {/* Topo do Histórico com Título e Botão Voltar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-900">
                  <Receipt className="w-5 h-5 text-[#3b0764]" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">Histórico de Vendas</h2>
                  <p className="text-xs text-slate-500">Consulte pedidos por período com filtros rápidos</p>
                </div>
              </div>

              <button
                onClick={() => setTerminalView('pdv')}
                className="px-4 py-2 bg-[#3b0764] hover:bg-purple-900 text-white rounded-xl text-xs font-black shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                ← Voltar ao Terminal PDV
              </button>
            </div>

            {/* Barra de Filtros: DIA (Padrão), SEMANA, MÊS, TODO O PERÍODO */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              {/* Barra de Filtros Unificada à Esquerda */}
              <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-xl border border-slate-300 shadow-xs">
                <button
                  type="button"
                  onClick={() => setFiltroHistorico('dia')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    filtroHistorico === 'dia'
                      ? 'bg-[#3b0764] text-white shadow-sm ring-1 ring-purple-400'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Dia (Hoje)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFiltroHistorico('semana')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    filtroHistorico === 'semana'
                      ? 'bg-[#3b0764] text-white shadow-sm ring-1 ring-purple-400'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Semana</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelecionarFiltroHistorico('mes')}
                  title="Histórico do Mês (Requer PIN Gerencial)"
                  className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    filtroHistorico === 'mes'
                      ? 'bg-[#3b0764] text-white shadow-sm ring-1 ring-purple-400'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Mês</span>
                  <Lock className={`w-2.5 h-2.5 ${filtroHistorico === 'mes' ? 'text-amber-300' : 'text-amber-600'}`} />
                </button>

                <button
                  type="button"
                  onClick={() => handleSelecionarFiltroHistorico('todo')}
                  title="Todo o Período (Requer PIN Gerencial)"
                  className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    filtroHistorico === 'todo'
                      ? 'bg-[#3b0764] text-white shadow-sm ring-1 ring-purple-400'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Todo Período</span>
                  <Lock className={`w-2.5 h-2.5 ${filtroHistorico === 'todo' ? 'text-amber-300' : 'text-amber-600'}`} />
                </button>

                {/* Botão Calendário integrado na mesma barra à esquerda */}
                <button
                  type="button"
                  onClick={() => {
                    setTempDataPicker(dataEspecificaFiltro || todayStr);
                    setShowDatePickerModal(true);
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    filtroHistorico === 'data_especifica'
                      ? 'bg-[#3b0764] text-white shadow-sm ring-1 ring-purple-400'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Clique para escolher uma data no calendário"
                >
                  <Calendar className={`w-3.5 h-3.5 ${filtroHistorico === 'data_especifica' ? 'text-amber-300' : 'text-purple-700'}`} />
                  <span>
                    {filtroHistorico === 'data_especifica' && dataEspecificaFiltro
                      ? dataEspecificaFiltro.split('-').reverse().join('/')
                      : 'Calendário'}
                  </span>
                </button>
              </div>

              {/* Resumo Rápido do Período Filtrado */}
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-right">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Qtd. Pedidos</span>
                  <span className="text-sm font-mono font-black text-slate-900">
                    {pedidosFiltradosHistorico.length}
                  </span>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-right">
                  <span className="text-[10px] text-emerald-700 font-bold uppercase block">Total Período</span>
                  <span className="text-sm font-mono font-black text-emerald-700">
                    {formatCurrency(totalHistoricoFiltrado)}
                  </span>
                </div>
              </div>
            </div>

            {/* Barra de Filtros Complementares: CANAL/ORIGEM, BAIRRO DE ENTREGA e BUSCA */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
                {/* Filtro: Por onde foi feito (Canal) */}
                <div className="md:col-span-6 flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Store className="w-3 h-3 text-purple-700" />
                    <span>Por onde foi feito (Canal)</span>
                  </span>
                  <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-xl border border-slate-300 shadow-xs">
                    {[
                      { id: 'todos', label: 'Todos' },
                      { id: 'Balcão', label: 'Balcão', icon: Store },
                      { id: 'ZAP', label: 'WhatsApp', icon: WhatsAppIcon },
                      { id: 'IFOOD', label: 'iFood', icon: IFoodIcon },
                      { id: '99F', label: '99Food', icon: NoventaIcon }
                    ].map(c => {
                      const isSel = filtroCanalHistorico === c.id;
                      const IconComp = c.icon;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setFiltroCanalHistorico(c.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSel
                              ? 'bg-[#3b0764] text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          {IconComp && (
                            c.id === 'IFOOD' ? <IconComp className="h-2.5 w-auto" color={isSel ? '#ffffff' : '#ea1d2c'} /> :
                            c.id === '99F' ? <IconComp className="h-2.5 w-2.5" /> :
                            c.id === 'ZAP' ? <IconComp className="w-2.5 h-2.5" color={isSel ? '#ffffff' : '#059669'} /> :
                            <IconComp className="w-3 h-3" />
                          )}
                          <span>{c.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Filtro: Bairro de Entrega */}
                <div className="md:col-span-3 flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-purple-700" />
                    <span>Bairro de Entrega</span>
                  </span>
                  <div className="relative">
                    <select
                      value={filtroBairroHistorico}
                      onChange={(e) => setFiltroBairroHistorico(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl py-2 pl-8 pr-7 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-600 shadow-xs appearance-none cursor-pointer"
                    >
                      <option value="todos">Todos os Bairros ({listaBairrosHistorico.length})</option>
                      {listaBairrosHistorico.map(b => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                    <div className="pointer-events-none absolute right-2.5 top-2.5 text-slate-400 text-[10px]">▼</div>
                  </div>
                </div>

                {/* Campo de Busca */}
                <div className="md:col-span-3 flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Search className="w-3 h-3 text-purple-700" />
                    <span>Buscar Pedido</span>
                  </span>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Buscar por ID, bairro ou obs..."
                      value={buscaHistorico}
                      onChange={(e) => setBuscaHistorico(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl py-2 pl-7 pr-7 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 shadow-xs font-medium"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
                    {buscaHistorico && (
                      <button
                        type="button"
                        onClick={() => setBuscaHistorico('')}
                        className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Tag informativa de filtros ativos */}
              {(filtroCanalHistorico !== 'todos' || filtroBairroHistorico !== 'todos' || buscaHistorico.trim() !== '' || filtroHistorico !== 'dia') && (
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-purple-50 text-purple-900 px-3 py-1.5 rounded-xl border border-purple-200">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium">
                    <Filter className="w-3 h-3 text-purple-700" />
                    <span className="font-bold">Filtros Ativos:</span>
                    {filtroHistorico !== 'dia' && (
                      <span className="bg-white px-2 py-0.5 rounded-md border border-purple-200 font-bold">
                        {filtroHistorico === 'semana' ? 'Semana' : filtroHistorico === 'mes' ? 'Mês' : filtroHistorico === 'todo' ? 'Todo Período' : dataEspecificaFiltro}
                      </span>
                    )}
                    {filtroCanalHistorico !== 'todos' && (
                      <span className="bg-white px-2 py-0.5 rounded-md border border-purple-200 font-bold">
                        Canal: {filtroCanalHistorico}
                      </span>
                    )}
                    {filtroBairroHistorico !== 'todos' && (
                      <span className="bg-white px-2 py-0.5 rounded-md border border-purple-200 font-bold">
                        Bairro: {filtroBairroHistorico}
                      </span>
                    )}
                    {buscaHistorico.trim() !== '' && (
                      <span className="bg-white px-2 py-0.5 rounded-md border border-purple-200 font-bold">
                        Busca: "{buscaHistorico}"
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFiltroHistorico('dia');
                      setFiltroCanalHistorico('todos');
                      setFiltroBairroHistorico('todos');
                      setBuscaHistorico('');
                    }}
                    className="text-purple-700 hover:text-purple-950 font-black hover:underline cursor-pointer flex items-center gap-1 text-[11px]"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Redefinir Todos</span>
                  </button>
                </div>
              )}
            </div>

            {/* Listagem de Pedidos Filtrados */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {pedidosFiltradosHistorico.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                  <ClockAlert className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">Nenhum pedido encontrado com estes filtros</p>
                  <p className="text-xs text-slate-400">
                    Experimente alterar o canal, bairro ou período selecionado.
                  </p>
                  {(filtroCanalHistorico !== 'todos' || filtroBairroHistorico !== 'todos' || buscaHistorico.trim() !== '' || filtroHistorico !== 'dia') && (
                    <button
                      type="button"
                      onClick={() => {
                        setFiltroHistorico('dia');
                        setFiltroCanalHistorico('todos');
                        setFiltroBairroHistorico('todos');
                        setBuscaHistorico('');
                      }}
                      className="mt-2 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Limpar Filtros</span>
                    </button>
                  )}
                </div>
              ) : (
                pedidosFiltradosHistorico.map(p => {
                  const pDate = parseRecordDate(p);
                  const dataStr = pDate 
                    ? pDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' + pDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                    : (p.data_hora || p.data || 'Hoje');

                  return (
                    <div 
                      key={p.id} 
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200 rounded-xl flex flex-wrap justify-between items-center text-xs gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-slate-900 bg-white px-2 py-1 rounded-md border border-slate-200">
                          #{p.id}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">
                              {p.tipo}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1 ${
                              p.canal === 'IFOOD' ? 'bg-red-50 text-red-700 border border-red-200' :
                              p.canal === '99F' ? 'bg-amber-50 text-amber-900 border border-amber-200' :
                              p.canal === 'ZAP' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                              'bg-sky-50 text-sky-800 border border-sky-200'
                            }`}>
                              {p.canal === 'IFOOD' && <IFoodIcon className="h-2.5 w-auto" color="#ea1d2c" />}
                              {p.canal === '99F' && <NoventaIcon className="h-2.5 w-2.5" />}
                              {p.canal === 'ZAP' && <WhatsAppIcon className="w-2.5 h-2.5" color="#059669" />}
                              <span>{p.canal}</span>
                            </span>
                            {p.bairro && (
                              <span className="text-slate-500 font-medium">
                                • {p.bairro}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {dataStr}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-mono font-black text-emerald-600 text-sm block">
                            {formatCurrency(p.valor_total)}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            {p.forma_pagto}
                          </span>
                        </div>

                        {/* Botão de Edição (Lápis) */}
                        <button
                          type="button"
                          onClick={() => setPedidoEmEdicao(p)}
                          className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 text-slate-600 shadow-xs cursor-pointer transition-all active:scale-95"
                          title="Editar Pedido Lançado"
                        >
                          <Pencil className="w-4 h-4 text-amber-600" />
                        </button>

                        {onVisualizarComprovante && (
                          <button
                            onClick={() => onVisualizarComprovante(p)}
                            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-purple-50 hover:text-purple-700 text-slate-600 shadow-xs cursor-pointer transition-all active:scale-95"
                            title="Ver Cupom / Reimprimir"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ABA: CONFIGURAÇÕES DO SISTEMA (BAIRROS, TAXAS & PLANILHA)*/}
        {/* ======================================================== */}
        {terminalView === 'configuracoes' && (
          <div className="h-full w-full flex flex-col gap-3">
            {/* Seletor de Sub-Abas de Configuração */}
            <div className="bg-white border border-slate-300 p-2 rounded-2xl flex flex-wrap items-center justify-between gap-2 shrink-0 shadow-xs">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSubAbaConfig('bairros')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    subAbaConfig === 'bairros'
                      ? 'bg-[#3b0764] text-white shadow-sm ring-1 ring-purple-400'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <MapPin className={`w-3.5 h-3.5 ${subAbaConfig === 'bairros' ? 'text-amber-300' : 'text-purple-700'}`} />
                  <span>Bairros de Caçapava ({bairrosList.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSubAbaConfig('taxas')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    subAbaConfig === 'taxas'
                      ? 'bg-[#3b0764] text-white shadow-sm ring-1 ring-purple-400'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <Percent className={`w-3.5 h-3.5 ${subAbaConfig === 'taxas' ? 'text-amber-300' : 'text-purple-700'}`} />
                  <span>Taxas dos Apps ({platformFees.IFOOD || 15.5}%)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSubAbaConfig('planilha')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    subAbaConfig === 'planilha'
                      ? 'bg-[#3b0764] text-white shadow-sm ring-1 ring-purple-400'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <Database className={`w-3.5 h-3.5 ${subAbaConfig === 'planilha' ? 'text-amber-300' : 'text-emerald-700'}`} />
                  <span>Planilha Google</span>
                  <span className={`w-2 h-2 rounded-full ${syncStatus.connected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setTerminalView('pdv')}
                className="px-4 py-2 bg-[#3b0764] hover:bg-purple-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
              >
                ← Voltar ao Terminal PDV
              </button>
            </div>

            {/* Conteúdo Dinâmico da Sub-Aba de Configurações */}
            <div className="flex-1 min-h-0">
              {subAbaConfig === 'bairros' ? (
                <ConfigBairrosCacapava
                  onClose={() => setTerminalView('pdv')}
                  onBairrosUpdated={(novaLista) => setBairrosList(novaLista)}
                />
              ) : subAbaConfig === 'taxas' ? (
                <ConfigTaxasPlataformas
                  pedidosHoje={pedidosHoje}
                  onClose={() => {
                    setPlatformFees(getPlatformFees());
                    setTerminalView('pdv');
                  }}
                />
              ) : (
                <ConfigPlanilhaGoogle
                  syncStatus={syncStatus}
                  onTestConnection={onTestConnection}
                  dataStats={{
                    pedidosCount: pedidos.length,
                    despesasCount: despesas.length,
                    fiadosCount: fiados.length
                  }}
                  onClose={() => setTerminalView('pdv')}
                />
              )}
            </div>
          </div>
        )}

        {terminalView === 'dashboard' && (
          <DashboardAnalitico
            pedidos={pedidos}
            despesas={despesas}
            onBackToPdv={() => setTerminalView('pdv')}
          />
        )}
      </main>

      {/* ======================================================== */}
      {/* BARRA DE RODAPÉ DO TERMINAL                              */}
      {/* ======================================================== */}
      <footer className="h-8 bg-slate-200 border-t border-slate-300 px-3 flex items-center justify-between text-[11px] text-slate-600 font-mono shrink-0">
        <div className="flex items-center gap-4">
          <span>ATALHOS: <strong>[F1]</strong> NOVO <strong>[F2]</strong> CAIXA <strong>[F3]</strong> FIADO <strong>[F4]</strong> HISTÓRICO <strong>[F5]</strong> DASHBOARD <strong>[F6]</strong> CONFIG</span>
        </div>
        <div className="flex items-center gap-3">
          <span>PEDIDOS HOJE: <strong>{pedidosHoje.length}</strong></span>
          <span>FATURADO: <strong className="text-emerald-700 font-bold">{formatCurrency(totalFaturadoHoje)}</strong></span>
        </div>
      </footer>

      {/* Modal Rápido para Configurar Link da Planilha caso não esteja salvo */}
      {showSheetUrlPrompt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Abrir Planilha Google</h3>
                  <p className="text-xs text-slate-500">Cole o link da sua planilha para acesso rápido</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSheetUrlPrompt(false)} 
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Link da Planilha Google (URL):
              </label>
              <input
                type="url"
                autoFocus
                value={sheetInputUrl}
                onChange={(e) => setSheetInputUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
              <p className="text-[11px] text-slate-500">
                Você só precisa colar este link uma vez. O terminal salvará e abrirá automaticamente no modo visualização limpo.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSheetUrlPrompt(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (sheetInputUrl.trim()) {
                    setSheetsViewUrl(sheetInputUrl.trim());
                    window.open(convertToPreviewUrl(sheetInputUrl.trim()), '_blank');
                    setShowSheetUrlPrompt(false);
                  }
                }}
                disabled={!sheetInputUrl.trim()}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Salvar e Abrir Planilha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Seleção de Data Específica para o Histórico */}
      {showDatePickerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-900">
                  <Calendar className="w-5 h-5 text-purple-800" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Filtrar por Data</h3>
                  <p className="text-xs text-slate-500">Selecione o dia desejado</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowDatePickerModal(false)} 
                className="text-slate-400 hover:text-slate-700 p-1.5 cursor-pointer rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Data Específica:
                </label>
                <input
                  type="date"
                  autoFocus
                  value={tempDataPicker}
                  onChange={(e) => setTempDataPicker(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-purple-300 focus:border-purple-600 rounded-2xl px-4 py-3 text-base font-bold text-slate-900 focus:outline-none focus:bg-white shadow-xs cursor-pointer"
                />
              </div>

              {/* Botões de Atalho Rápido */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Atalhos Rápidos:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      const y = d.getFullYear();
                      const m = String(d.getMonth() + 1).padStart(2, '0');
                      const day = String(d.getDate()).padStart(2, '0');
                      setTempDataPicker(`${y}-${m}-${day}`);
                    }}
                    className="py-2 px-2 text-xs font-extrabold rounded-xl bg-slate-100 hover:bg-purple-100 hover:text-purple-900 text-slate-700 border border-slate-200 transition-all active:scale-95 cursor-pointer"
                  >
                    Hoje
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() - 1);
                      const y = d.getFullYear();
                      const m = String(d.getMonth() + 1).padStart(2, '0');
                      const day = String(d.getDate()).padStart(2, '0');
                      setTempDataPicker(`${y}-${m}-${day}`);
                    }}
                    className="py-2 px-2 text-xs font-extrabold rounded-xl bg-slate-100 hover:bg-purple-100 hover:text-purple-900 text-slate-700 border border-slate-200 transition-all active:scale-95 cursor-pointer"
                  >
                    Ontem
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() - 2);
                      const y = d.getFullYear();
                      const m = String(d.getMonth() + 1).padStart(2, '0');
                      const day = String(d.getDate()).padStart(2, '0');
                      setTempDataPicker(`${y}-${m}-${day}`);
                    }}
                    className="py-2 px-2 text-xs font-extrabold rounded-xl bg-slate-100 hover:bg-purple-100 hover:text-purple-900 text-slate-700 border border-slate-200 transition-all active:scale-95 cursor-pointer"
                  >
                    Anteontem
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDatePickerModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (tempDataPicker) {
                    setDataEspecificaFiltro(tempDataPicker);
                    setFiltroHistorico('data_especifica');
                    setShowDatePickerModal(false);
                  }
                }}
                disabled={!tempDataPicker}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#3b0764] hover:bg-purple-900 disabled:opacity-50 text-white shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 text-amber-300" />
                <span>Aplicar Filtro</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rápido: Adicionar Novo Bairro Diretamente no PDV */}
      {modalNovoBairroOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-900">
                  <MapPin className="w-4 h-4 text-purple-700" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Cadastrar Novo Bairro</h3>
                  <p className="text-[11px] text-slate-500">Adicione para seleção e entrega imediata</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalNovoBairroOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovoBairro} className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                  Nome do Bairro
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: Condomínio Ecopark"
                  value={novoBairroNome}
                  onChange={(e) => setNovoBairroNome(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                  Taxa de Entrega (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">R$</span>
                  <input
                    type="text"
                    required
                    placeholder="0,00"
                    value={novoBairroTaxa}
                    onChange={(e) => setNovoBairroTaxa(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-mono font-black text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Botões Rápidos de Taxa */}
              <div className="flex items-center gap-1.5">
                {['4.00', '5.00', '6.00', '7.00', '8.00', '10.00'].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setNovoBairroTaxa(val)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-bold border cursor-pointer transition-all ${
                      novoBairroTaxa === val
                        ? 'bg-purple-700 text-white border-purple-800'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {val.replace('.', ',')}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNovoBairroOpen(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar e Usar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edição de Pedido Lançado */}
      <EditOrderModal
        isOpen={!!pedidoEmEdicao}
        pedido={pedidoEmEdicao}
        onClose={() => setPedidoEmEdicao(null)}
        onSalvar={(pedidoAtualizado) => {
          if (onEditarPedido) onEditarPedido(pedidoAtualizado);
          setPedidoEmEdicao(null);
        }}
        onExcluir={(id) => {
          if (onExcluirPedido) onExcluirPedido(id);
          setPedidoEmEdicao(null);
        }}
      />

      {/* Modal de PIN Gerencial */}
      <DashboardPinModal
        isOpen={gerencialModalConfig.isOpen}
        title={gerencialModalConfig.title}
        subtitle={gerencialModalConfig.subtitle}
        onSuccess={() => {
          gerencialModalConfig.onSuccess();
        }}
        onClose={() => setGerencialModalConfig(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Modal de Auditoria e Detalhamento do Fechamento do Dia */}
      <ModalDetalheFechamento
        isOpen={!!modalDetalheFechamento}
        tipo={modalDetalheFechamento || 'despesas'}
        onClose={() => setModalDetalheFechamento(null)}
        pedidosHoje={pedidosHoje}
        despesasHoje={despesasHoje}
        totalFaturadoHoje={totalFaturadoHoje}
        totalDespesasHoje={totalDespesasHoje}
        lucroLiquidoHoje={lucroLiquidoHoje}
        platformFees={platformFees}
      />
    </div>
  );
}
