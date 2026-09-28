import React, { useState, useEffect, useMemo } from 'react';
import TouchTerminalERP from './components/TouchTerminalERP';
import SheetsModal from './components/SheetsModal';
import ReceiptModal from './components/ReceiptModal';
import TelaDescansoBelinho from './components/TelaDescansoBelinho';
import PinAuthModal from './components/PinAuthModal';
import ErrorBoundary from './components/ErrorBoundary';
import { isDeviceAuthenticated } from './utils/auth';
import { 
  getLocalData, 
  saveLocalData, 
  fetchRemoteData, 
  registrarPedido, 
  atualizarPedido,
  excluirPedido,
  registrarDespesa, 
  darBaixaFiado,
  editarFiado,
  adicionarNovoFiado,
  excluirFiado,
  flushSyncQueue 
} from './services/api';

export default function App() {
  // Autenticação por PIN de 3 dígitos (Padrão: 159)
  const [isAuthenticated, setIsAuthenticated] = useState(() => isDeviceAuthenticated());

  useEffect(() => {
    const handleLock = () => setIsAuthenticated(false);
    window.addEventListener('santiago-lock-terminal', handleLock);
    return () => window.removeEventListener('santiago-lock-terminal', handleLock);
  }, []);

  // Dados principais
  const [pedidos, setPedidos] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [fiados, setFiados] = useState([]);
  
  // Status de sincronização
  const [syncStatus, setSyncStatus] = useState({
    connected: false,
    isSyncing: false,
    lastSync: null,
    error: null
  });
  
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSheetsModal, setShowSheetsModal] = useState(false);
  const [receiptModalPedido, setReceiptModalPedido] = useState(null);

  // Carregar dados locais na inicialização
  useEffect(() => {
    const local = getLocalData();
    setPedidos(local.pedidos);
    setDespesas(local.despesas);
    setFiados(local.fiados);

    // Tentar sincronização remota inicial
    handleSyncRemote(false);

    // Sincronização periódica em segundo plano (a cada 45 segundos)
    const interval = setInterval(() => {
      handleSyncRemote(false);
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  const handleSyncRemote = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setIsRefreshing(true);
    setSyncStatus(prev => ({ ...prev, isSyncing: true }));

    try {
      const result = await fetchRemoteData();
      if (result.success) {
        setPedidos(result.data.pedidos);
        setDespesas(result.data.despesas);
        setFiados(result.data.fiados);
        setSyncStatus({
          connected: true,
          isSyncing: false,
          lastSync: new Date().toISOString(),
          error: null
        });
        // Descarrega pedidos e despesas pendentes para a planilha
        await flushSyncQueue();
      } else {
        setSyncStatus({
          connected: false,
          isSyncing: false,
          lastSync: null,
          error: result.error
        });
      }
      return result;
    } finally {
      if (showLoadingSpinner) setIsRefreshing(false);
    }
  };

  const handleRegistrarPedido = async (pedidoData) => {
    const res = await registrarPedido(pedidoData);
    const local = getLocalData();
    setPedidos(local.pedidos);
    setFiados(local.fiados);
    return res;
  };

  const handleRegistrarDespesa = async (despesaData) => {
    const res = await registrarDespesa(despesaData);
    const local = getLocalData();
    setDespesas(local.despesas);
    return res;
  };

  const handleEditarPedido = async (pedidoAtualizado) => {
    const res = await atualizarPedido(pedidoAtualizado);
    const local = getLocalData();
    setPedidos(local.pedidos);
    setFiados(local.fiados);
    return res;
  };

  const handleExcluirPedido = async (id) => {
    await excluirPedido(id);
    const local = getLocalData();
    setPedidos(local.pedidos);
    setFiados(local.fiados);
  };

  const handleDarBaixaFiado = async (dados) => {
    const res = await darBaixaFiado(dados);
    const local = getLocalData();
    setFiados(local.fiados);
    return res;
  };

  const handleEditarFiado = async (dados) => {
    const res = await editarFiado(dados);
    const local = getLocalData();
    setFiados(local.fiados);
    return res;
  };

  const handleAdicionarFiado = async (dados) => {
    const res = await adicionarNovoFiado(dados);
    const local = getLocalData();
    setFiados(local.fiados);
    return res;
  };

  const handleExcluirFiado = async (cliente) => {
    const res = await excluirFiado(cliente);
    const local = getLocalData();
    setFiados(local.fiados);
    return res;
  };

  return (
    <ErrorBoundary>
      <div className="h-screen w-screen overflow-hidden bg-slate-100 font-sans">
        {/* Terminal ERP Touchscreen Fullscreen */}
        <TouchTerminalERP
          isLocked={!isAuthenticated}
          pedidos={pedidos}
          despesas={despesas}
          fiados={fiados}
          onRegistrarPedido={handleRegistrarPedido}
          onEditarPedido={handleEditarPedido}
          onRegistrarDespesa={handleRegistrarDespesa}
          onExcluirPedido={handleExcluirPedido}
          onDarBaixaFiado={handleDarBaixaFiado}
          onEditarFiado={handleEditarFiado}
          onAdicionarFiado={handleAdicionarFiado}
          onExcluirFiado={handleExcluirFiado}
          onVisualizarComprovante={(p) => setReceiptModalPedido(p)}
          onOpenSheetsModal={() => setShowSheetsModal(true)}
          onTestConnection={() => handleSyncRemote(true)}
          syncStatus={syncStatus}
          soundEnabled={soundEnabled}
        />

        {/* Modal Sheets */}
        <SheetsModal
          isOpen={showSheetsModal}
          onClose={() => setShowSheetsModal(false)}
          syncStatus={syncStatus}
          onTestConnection={() => handleSyncRemote(true)}
          dataStats={{
            pedidosCount: pedidos.length,
            despesasCount: despesas.length,
            fiadosCount: fiados.length
          }}
        />

        {/* Modal Cupom Térmico */}
        {receiptModalPedido && (
          <ReceiptModal
            pedido={receiptModalPedido}
            onClose={() => setReceiptModalPedido(null)}
          />
        )}

        {/* Modo Descanso / Screensaver do Sr. Belinho (20 min de inatividade) */}
        <TelaDescansoBelinho timeoutMinutes={20} />

        {/* Tela de Autenticação por PIN de 3 Dígitos (Padrão: 159) */}
        {!isAuthenticated && (
          <PinAuthModal onUnlock={() => setIsAuthenticated(true)} />
        )}
      </div>
    </ErrorBoundary>
  );
}
