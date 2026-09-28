import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  LayoutDashboard, 
  BarChart3, 
  ClockAlert, 
  History, 
  RefreshCw, 
  Settings2,
  Volume2,
  VolumeX,
  Clock
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  syncStatus, 
  onRefresh, 
  isRefreshing, 
  onOpenSheetsModal,
  totalFiadosPendentes = 0,
  soundEnabled,
  setSoundEnabled
}) {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard & PDV', icon: LayoutDashboard, badge: null },
    { id: 'fechamento', label: 'Fechamento Diário', icon: BarChart3, badge: null },
    { 
      id: 'fiados', 
      label: 'Fiados / A Receber', 
      icon: ClockAlert, 
      badge: totalFiadosPendentes > 0 ? formatCurrency(totalFiadosPendentes) : null
    },
    { id: 'historico', label: 'Histórico', icon: History, badge: null }
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Marca Lanchonete */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 p-0.5 shadow-sm flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                  SANTIAGO<span className="text-orange-600">PDV</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
                  Lanchonete
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Painel do Caixa & Atendimento
              </p>
            </div>
          </div>

          {/* Desktop Navigation - Clean Dashboard Pills */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-orange-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isActive 
                        ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Canto Direito: Hora, Status Sheets, Ações */}
          <div className="flex items-center gap-2">
            {/* Relógio do Caixa */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-mono font-semibold border border-slate-200/80">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentTime}</span>
            </div>

            {/* Status Conexão Sheets */}
            <button
              onClick={onOpenSheetsModal}
              title="Status do Google Sheets"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                syncStatus.connected
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${syncStatus.connected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <span className="hidden sm:inline">
                {syncStatus.connected ? 'Sheets Conectado' : 'Modo Local'}
              </span>
            </button>

            {/* Som On/Off */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Som ativado' : 'Silenciado'}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Atualizar / Sync */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Sincronizar dados"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-orange-600' : ''}`} />
            </button>

            {/* Configurações */}
            <button
              onClick={onOpenSheetsModal}
              title="Configurações da API"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar Clean Light */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 flex items-center justify-around shadow-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative ${
                isActive ? 'text-orange-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-orange-50' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{tab.label.split(' ')[0]}</span>
              {tab.badge && (
                <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-amber-500"></span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
}
