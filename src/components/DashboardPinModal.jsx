import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, AlertCircle, Delete, Check, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getDashboardTargetPin, saveDashboardAuthentication } from '../utils/auth';

export default function DashboardPinModal({ 
  isOpen, 
  onSuccess, 
  onClose,
  title = "PIN Gerencial",
  subtitle = "Digite o PIN gerencial de 3 dígitos para liberar o acesso"
}) {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [unlockedSuccess, setUnlockedSuccess] = useState(false);

  const targetPin = getDashboardTargetPin(); // Padrão: '157'

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMsg('');
      setUnlockedSuccess(false);
      setIsShaking(false);
    }
  }, [isOpen]);

  // Sons de feedback
  const playBeep = (freq = 440, type = 'sine', duration = 0.08) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignorar se áudio não for permitido antes de interação
    }
  };

  const playSuccessSound = () => {
    playBeep(523.25, 'triangle', 0.1);
    setTimeout(() => playBeep(659.25, 'triangle', 0.15), 100);
    setTimeout(() => playBeep(783.99, 'triangle', 0.25), 200);
  };

  const playErrorSound = () => {
    playBeep(220, 'sawtooth', 0.15);
    setTimeout(() => playBeep(180, 'sawtooth', 0.2), 150);
  };

  const handleValidatePin = (inputPin) => {
    if (inputPin === targetPin) {
      setUnlockedSuccess(true);
      playSuccessSound();

      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#f59e0b', '#10b981']
      });

      saveDashboardAuthentication();

      setTimeout(() => {
        onSuccess();
      }, 350);
    } else {
      playErrorSound();
      setIsShaking(true);
      setErrorMsg('PIN incorreto! Acesso negado.');
      setTimeout(() => {
        setPin('');
        setIsShaking(false);
      }, 500);
    }
  };

  const handleDigit = (digit) => {
    if (unlockedSuccess) return;
    setErrorMsg('');
    playBeep(550, 'sine', 0.05);

    if (pin.length < 3) {
      const novoPin = pin + digit;
      setPin(novoPin);

      if (novoPin.length === 3) {
        setTimeout(() => {
          handleValidatePin(novoPin);
        }, 120);
      }
    }
  };

  const handleBackspace = () => {
    if (unlockedSuccess) return;
    playBeep(350, 'sine', 0.05);
    setErrorMsg('');
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (unlockedSuccess) return;
    playBeep(300, 'sine', 0.05);
    setErrorMsg('');
    setPin('');
  };

  // Teclado físico
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        e.stopPropagation();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        e.stopPropagation();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, pin, unlockedSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      {/* Luz ambiente de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-900/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative w-full max-w-sm bg-white border-2 border-purple-900/30 rounded-3xl p-6 shadow-2xl space-y-4 my-auto text-slate-800 animate-scaleUp">
        {/* Botão Fechar Modal */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Fechar e voltar ao terminal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div className="text-center space-y-2 pt-1">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-800 to-amber-500 text-white shadow-md flex items-center justify-center">
            <Lock className="w-7 h-7 text-amber-200" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-100 text-purple-950 font-black text-[11px] border border-purple-200 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
              <span>Ação Gerencial Protegida</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>
            <p className="text-xs text-slate-500">
              {subtitle}
            </p>
          </div>
        </div>

        {/* 3 Bolinhas Indicadoras do PIN */}
        <div className={`flex items-center justify-center gap-4 py-2 ${isShaking ? 'animate-shake' : ''}`}>
          {[0, 1, 2].map(index => {
            const isFilled = pin.length > index;
            return (
              <div 
                key={index}
                className={`w-5 h-5 rounded-full transition-all duration-200 flex items-center justify-center ${
                  unlockedSuccess 
                    ? 'bg-emerald-500 ring-4 ring-emerald-300 scale-110 shadow-md'
                    : isFilled 
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 ring-4 ring-amber-200 scale-110 shadow-md' 
                    : 'bg-slate-200 border-2 border-slate-300'
                }`}
              >
                {unlockedSuccess && <Check className="w-3 h-3 text-white stroke-[3]" />}
              </div>
            );
          })}
        </div>

        {/* Mensagem de Erro ou Sucesso */}
        <div className="h-4 text-center">
          {errorMsg ? (
            <p className="text-xs font-bold text-rose-600 flex items-center justify-center gap-1 animate-fadeIn">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </p>
          ) : unlockedSuccess ? (
            <p className="text-xs font-black text-emerald-600 flex items-center justify-center gap-1 animate-fadeIn">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PIN Correto! Liberando...</span>
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 font-medium">
              Digite no teclado numérico ou clique abaixo
            </p>
          )}
        </div>

        {/* Teclado Numérico Táctil */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {['7', '8', '9', '4', '5', '6', '1', '2', '3'].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num)}
              className="h-13 rounded-2xl bg-slate-50 hover:bg-purple-50 active:bg-purple-100 border border-slate-200 hover:border-purple-300 text-slate-800 hover:text-purple-950 font-black text-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              {num}
            </button>
          ))}

          {/* Botão Limpar */}
          <button
            type="button"
            onClick={handleClear}
            className="h-13 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 font-bold text-xs flex items-center justify-center transition-all active:scale-95 cursor-pointer border border-slate-200"
          >
            LIMPAR
          </button>

          {/* Dígito 0 */}
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-13 rounded-2xl bg-slate-50 hover:bg-purple-50 active:bg-purple-100 border border-slate-200 hover:border-purple-300 text-slate-800 hover:text-purple-950 font-black text-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            0
          </button>

          {/* Botão Apagar */}
          <button
            type="button"
            onClick={handleBackspace}
            className="h-13 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 font-bold text-base flex items-center justify-center transition-all active:scale-95 cursor-pointer border border-slate-200"
            title="Apagar dígito"
          >
            <Delete className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Rodapé com botão Cancelar */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            ← Voltar ao Terminal
          </button>
          <span className="text-[10px] text-slate-400 font-mono">
            PIN: 3 dígitos
          </span>
        </div>
      </div>
    </div>
  );
}
