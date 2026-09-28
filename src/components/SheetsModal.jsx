import React, { useState } from 'react';
import { 
  Settings2, 
  X, 
  Copy, 
  Check, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Code,
  ExternalLink
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

export default function SheetsModal({ 
  isOpen, 
  onClose, 
  syncStatus, 
  onTestConnection, 
  dataStats = {} 
}) {
  const [currentUrl, setCurrentUrl] = useState(getApiUrl());
  const [sheetsViewUrl, setSheetsViewUrlState] = useState(getSheetsViewUrl());
  const [copiedCode, setCopiedCode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveSheetSuccess, setSaveSheetSuccess] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleSaveUrl = () => {
    setApiUrl(currentUrl);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSaveSheetViewUrl = () => {
    setSheetsViewUrl(sheetsViewUrl);
    setSaveSheetSuccess(true);
    setTimeout(() => setSaveSheetSuccess(false), 2000);
  };

  const handleOpenSheetDirectly = (mode = 'preview') => {
    const raw = sheetsViewUrl.trim() || 'https://docs.google.com/spreadsheets/';
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
      const res = await onTestConnection();
      setTestResult(res);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-5 my-8 animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-50 text-orange-600">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Integração Google Sheets</h2>
              <p className="text-xs text-slate-500">Status da API e script de sincronização</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status e URL */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">URL da API (Google Apps Script)</span>
            <div className="flex items-center gap-1.5 font-bold">
              <span className={`w-2 h-2 rounded-full ${syncStatus.connected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <span className={syncStatus.connected ? 'text-emerald-700' : 'text-amber-700'}>
                {syncStatus.connected ? 'Conectado' : 'Modo Local'}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="url"
              value={currentUrl}
              onChange={(e) => setCurrentUrl(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-orange-500"
            />
            <button
              type="button"
              onClick={handleSaveUrl}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
            >
              {saveSuccess ? 'Salvo!' : 'Salvar'}
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleRunTest}
              disabled={testing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-orange-600' : ''}`} />
              <span>{testing ? 'Testando...' : 'Testar Conexão'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefaultUrl}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              URL Padrão
            </button>
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl text-xs border ${
              testResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              {testResult.success ? 'Conexão confirmada com sucesso!' : 'Aviso: Planilha em modo offline/local.'}
            </div>
          )}
        </div>

        {/* Link Direto de Visualização da Planilha Google */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-black text-emerald-950 block">Planilha Google (Modo Visualização)</span>
              <p className="text-[11px] text-emerald-800">Abre sem barras de ferramentas pesadas, ideal para consulta ágil no balcão.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleOpenSheetDirectly('preview')}
                title="Abre a planilha sem barras de edição, focada em visualização"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Visualização (/preview)</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenSheetDirectly('edit')}
                title="Abre a planilha no modo de edição padrão"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-100/50 text-emerald-900 font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Edição (/edit)</span>
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <input
              type="url"
              placeholder="Cole aqui o link da planilha: https://docs.google.com/spreadsheets/d/.../edit"
              value={sheetsViewUrl}
              onChange={(e) => setSheetsViewUrlState(e.target.value)}
              className="flex-1 bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
            />
            <button
              type="button"
              onClick={handleSaveSheetViewUrl}
              className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs cursor-pointer"
            >
              {saveSheetSuccess ? 'Salvo!' : 'Salvar Link'}
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Pedidos</span>
            <span className="text-base font-mono font-black text-slate-900">{dataStats.pedidosCount || 0}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Despesas</span>
            <span className="text-base font-mono font-black text-slate-900">{dataStats.despesasCount || 0}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Fiados</span>
            <span className="text-base font-mono font-black text-slate-900">{dataStats.fiadosCount || 0}</span>
          </div>
        </div>

        {/* Copiar Script */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Code className="w-4 h-4 text-orange-600" />
              Código Google Apps Script Pronto (Code.gs)
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copiado!' : 'Copiar Script'}</span>
            </button>
          </div>

          <div className="p-3 bg-slate-900 text-slate-200 rounded-2xl text-[11px] font-mono max-h-36 overflow-y-auto">
            <div className="text-slate-400">// Cole no seu Google Apps Script (Extensões &gt; Apps Script)</div>
            <div className="text-emerald-400">function doGet(e) &#123; ... &#125;</div>
            <div className="text-emerald-400">function doPost(e) &#123; ... &#125;</div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
