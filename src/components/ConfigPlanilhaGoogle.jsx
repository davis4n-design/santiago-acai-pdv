import React, { useState } from 'react';
import { 
  Database, 
  ExternalLink, 
  RefreshCw, 
  Check, 
  Copy, 
  Code, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  getApiUrl, 
  setApiUrl, 
  getSheetsViewUrl, 
  setSheetsViewUrl, 
  convertToPreviewUrl,
  GOOGLE_APPS_SCRIPT_CODE, 
  DEFAULT_API_URL 
} from '../services/api';

export default function ConfigPlanilhaGoogle({ 
  syncStatus = {}, 
  onTestConnection, 
  dataStats = {},
  onClose
}) {
  const [currentUrl, setCurrentUrl] = useState(getApiUrl());
  const [sheetsViewUrl, setSheetsViewUrlState] = useState(getSheetsViewUrl());
  const [copiedCode, setCopiedCode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveSheetSuccess, setSaveSheetSuccess] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleSaveUrl = () => {
    setApiUrl(currentUrl);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSaveSheetViewUrl = () => {
    setSheetsViewUrl(sheetsViewUrl);
    setSaveSheetSuccess(true);
    setTimeout(() => setSaveSheetSuccess(false), 2500);
  };

  const handleOpenSheetDirectly = (mode = 'preview') => {
    const raw = (sheetsViewUrl || '').trim() || 'https://docs.google.com/spreadsheets/';
    const targetUrl = mode === 'preview' ? convertToPreviewUrl(raw) : raw;
    window.open(targetUrl, '_blank');
  };

  const handleResetDefaultUrl = () => {
    setCurrentUrl(DEFAULT_API_URL);
    setApiUrl(DEFAULT_API_URL);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleRunTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      if (onTestConnection) {
        const res = await onTestConnection();
        setTestResult(res);
      }
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="h-full w-full bg-white border border-slate-300 rounded-3xl p-5 sm:p-6 overflow-y-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-[#3b0764]">Integração Google Planilhas</h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                <Lock className="w-3 h-3 text-amber-700" />
                Acesso Restrito (Gerência)
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Gerencie a conexão da API Google Apps Script, link da planilha e status de sincronização
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#3b0764] text-white rounded-xl text-xs font-bold hover:bg-purple-900 transition-all self-start sm:self-auto cursor-pointer"
          >
            ← Voltar ao Terminal PDV
          </button>
        )}
      </div>

      {/* Cartão de Status da Conexão */}
      <div className={`p-4 rounded-2xl border transition-all ${
        syncStatus.connected 
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' 
          : 'bg-amber-50/80 border-amber-200 text-amber-950'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
              syncStatus.connected 
                ? 'bg-emerald-500 shadow-md shadow-emerald-400 animate-pulse' 
                : 'bg-amber-500 shadow-md shadow-amber-400'
            }`}>
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm">
                  {syncStatus.connected ? 'Planilha Conectada em Tempo Real' : 'Modo Offline / Local'}
                </span>
                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md ${
                  syncStatus.connected 
                    ? 'bg-emerald-200/70 text-emerald-800' 
                    : 'bg-amber-200/70 text-amber-900'
                }`}>
                  {syncStatus.connected ? 'Online' : 'Armazenamento Local'}
                </span>
              </div>
              <p className="text-xs opacity-80 mt-0.5">
                {syncStatus.connected 
                  ? 'Todos os pedidos registrados, alterações e exclusões são gravados instantaneamente na sua planilha.' 
                  : 'O sistema continua funcionando perfeitamente! Os dados ficam gravados no navegador e serão sincronizados automaticamente assim que houver conexão com o Apps Script.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunTest}
            disabled={testing}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-black text-slate-800 hover:bg-slate-50 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-700 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Testando Conexão...' : 'Testar Conexão Agora'}</span>
          </button>
        </div>

        {testResult && (
          <div className={`mt-3 p-3 rounded-xl text-xs font-bold border flex items-center gap-2 ${
            testResult.success 
              ? 'bg-white/80 border-emerald-300 text-emerald-800' 
              : 'bg-white/80 border-amber-300 text-amber-900'
          }`}>
            {testResult.success ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Sucesso: Conexão com o Google Apps Script validada e dados atualizados!</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Aviso: Não foi possível alcançar o script Google neste momento. O caixa permanece em Modo Local seguro.</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Grid de Configurações da Planilha e API */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Bloco 1: URL da API (Google Apps Script) */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-sm text-slate-800 flex items-center gap-2">
                <Code className="w-4 h-4 text-purple-700" />
                URL da API (Google Apps Script)
              </span>
              <button
                type="button"
                onClick={handleResetDefaultUrl}
                className="text-[11px] font-bold text-slate-500 hover:text-purple-700 underline cursor-pointer"
              >
                Restaurar Padrão
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Endereço da implantação da Web App no Google Apps Script terminada em <code className="text-[10px] bg-slate-200 px-1 py-0.5 rounded font-mono font-bold">/exec</code>.
            </p>

            <div className="space-y-1.5">
              <input
                type="url"
                value={currentUrl}
                onChange={(e) => setCurrentUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 shadow-inner"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">
              {(currentUrl || '').slice(0, 35)}...
            </span>
            <button
              type="button"
              onClick={handleSaveUrl}
              className={`px-4 py-2 rounded-xl font-black text-xs transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5 ${
                saveSuccess 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-[#3b0764] hover:bg-purple-900 text-white'
              }`}
            >
              {saveSuccess ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{saveSuccess ? 'URL Salva!' : 'Salvar URL'}</span>
            </button>
          </div>
        </div>

        {/* Bloco 2: Link Direto da Planilha Google */}
        <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/70 border border-emerald-200 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-sm text-emerald-950 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-700" />
                Link da Planilha Google (Visualização)
              </span>
            </div>

            <p className="text-xs text-emerald-800">
              Cole o link direto da sua planilha para abrir rapidamente no balcão em tela de visualização leve.
            </p>

            <div className="space-y-1.5">
              <input
                type="url"
                placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                value={sheetsViewUrl}
                onChange={(e) => setSheetsViewUrlState(e.target.value)}
                className="w-full bg-white border border-emerald-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-inner"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleOpenSheetDirectly('preview')}
                title="Abre a planilha sem barras de edição, focada em visualização ágil"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Visualização (/preview)</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenSheetDirectly('edit')}
                title="Abre a planilha no modo de edição padrão"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Edição (/edit)</span>
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSaveSheetViewUrl}
              className={`px-4 py-2 rounded-xl font-black text-xs transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5 ${
                saveSheetSuccess 
                  ? 'bg-emerald-700 text-white' 
                  : 'bg-emerald-800 hover:bg-emerald-900 text-white'
              }`}
            >
              {saveSheetSuccess ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{saveSheetSuccess ? 'Link Salvo!' : 'Salvar Link'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Cards de Estatísticas de Registros Locais / Sincronizados */}
      <div className="space-y-2">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
          Registros Carregados no Terminal
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-black">Total de Pedidos</span>
              <span className="text-xl font-mono font-black text-[#3b0764]">{dataStats.pedidosCount || 0}</span>
            </div>
            <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
              <Database className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-black">Total de Despesas</span>
              <span className="text-xl font-mono font-black text-rose-700">{dataStats.despesasCount || 0}</span>
            </div>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <Database className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-black">Total de Fiados</span>
              <span className="text-xl font-mono font-black text-amber-700">{dataStats.fiadosCount || 0}</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Database className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Código Google Apps Script Pronto (Code.gs) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-sm font-black text-white block">Código Oficial Google Apps Script (Code.gs)</span>
              <p className="text-[11px] text-slate-400">
                Suporta gravação de novos pedidos, edição e exclusão de pedidos direto na planilha Google.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyCode}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-xs transition-all cursor-pointer shadow-md active:scale-95 ${
              copiedCode 
                ? 'bg-emerald-600 text-white' 
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black'
            }`}
          >
            {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedCode ? 'Código Copiado!' : 'Copiar Código Completo'}</span>
          </button>
        </div>

        <div className="p-3.5 bg-black/50 rounded-xl text-xs font-mono text-slate-300 max-h-48 overflow-y-auto space-y-1 border border-slate-800/80">
          <div className="text-slate-500">// 1. Na planilha Google, clique em: Extensões &gt; Apps Script</div>
          <div className="text-slate-500">// 2. Cole o código copiado no arquivo Code.gs</div>
          <div className="text-slate-500">// 3. Clique em: Implantar &gt; Gerenciar implantações &gt; Editar &gt; Nova versão &gt; Implantar</div>
          <div className="text-amber-300 pt-1">function doGet(e) &#123; ... &#125;</div>
          <div className="text-emerald-400">function doPost(e) &#123; ... // Suporta 'pedido', 'editar_pedido', 'excluir_pedido', 'despesa', 'fiado' &#125;</div>
        </div>
      </div>

    </div>
  );
}
