import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sparkles, X, Coffee } from 'lucide-react';

const DEFAULT_TIMEOUT_MINUTES = 20;

export default function TelaDescansoBelinho({ timeoutMinutes = DEFAULT_TIMEOUT_MINUTES }) {
  const [isDormindo, setIsDormindo] = useState(false);
  const [horaAtual, setHoraAtual] = useState(new Date());

  const isDormindoRef = useRef(false);
  const sleepStartTimeRef = useRef(0);
  const timerRef = useRef(null);

  // Manter ref sincronizada com o estado
  useEffect(() => {
    isDormindoRef.current = isDormindo;
    if (isDormindo) {
      sleepStartTimeRef.current = Date.now();
    }
  }, [isDormindo]);

  // Relógio do modo descanso (atualiza a cada 1 segundo)
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setHoraAtual(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Monitorar inatividade do usuário com tolerância a cliques residuais
  useEffect(() => {
    const timeoutMs = timeoutMinutes * 60 * 1000;

    const resetInactivityTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setIsDormindo(true);
      }, timeoutMs);
    };

    resetInactivityTimer();

    // Eventos que resetam ou acordam
    const eventos = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'];

    const handleUserInteraction = (e) => {
      // Se estiver dormindo:
      if (isDormindoRef.current) {
        // Bloquear os primeiros 1.2 segundos para ignorar o clique/arraste que disparou o botão
        const tempoDormindo = Date.now() - sleepStartTimeRef.current;
        if (tempoDormindo < 1200) {
          return;
        }

        // Se for ESC ou tecla ou clique após 1.2s: acordar!
        setIsDormindo(false);
        resetInactivityTimer();
      } else {
        // Se já está acordado, apenas renova o contador de inatividade
        resetInactivityTimer();
      }
    };

    eventos.forEach(ev => window.addEventListener(ev, handleUserInteraction, { passive: true }));

    // Handler para ativação manual (botão no card do Sr. Belinho)
    const handleManualSleep = () => {
      sleepStartTimeRef.current = Date.now();
      setIsDormindo(true);
    };
    window.addEventListener('ativar-descanso-belinho', handleManualSleep);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      eventos.forEach(ev => window.removeEventListener(ev, handleUserInteraction));
      window.removeEventListener('ativar-descanso-belinho', handleManualSleep);
    };
  }, [timeoutMinutes]);

  const handleAcordarManual = (e) => {
    e.stopPropagation();
    setIsDormindo(false);
  };

  if (!isDormindo) return null;

  const horaFormatada = horaAtual.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dataFormatada = horaAtual.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div 
      onClick={() => {
        // Só fecha ao clicar na tela se já passou 1 segundo de descanso
        if (Date.now() - sleepStartTimeRef.current > 1000) {
          setIsDormindo(false);
        }
      }}
      className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-2xl flex flex-col items-center justify-between p-6 sm:p-10 select-none animate-fadeIn cursor-pointer overflow-hidden"
    >
      {/* Luz ambiente de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Topo: Relógio e Identidade */}
      <div className="text-center space-y-1.5 z-10 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-900/70 border border-purple-400/40 text-purple-200 text-xs font-bold shadow-lg">
          <Moon className="w-3.5 h-3.5 text-amber-300" />
          <span>Modo Descanso • Santiago Açaí & Cia</span>
        </div>
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white font-mono drop-shadow-lg">
          {horaFormatada}
        </h1>
        <p className="text-xs sm:text-sm font-bold text-purple-200/90 capitalize tracking-wide">
          {dataFormatada}
        </p>
      </div>

      {/* Centro: Sr. Belinho Dormindo com Zzz flutuantes */}
      <div className="relative flex flex-col items-center justify-center my-auto z-10">
        
        {/* Letras Zzz flutuantes animadas */}
        <div className="absolute -top-14 right-4 sm:right-10 pointer-events-none select-none">
          <span className="absolute -top-3 -left-6 text-2xl font-black text-amber-300 drop-shadow-md animate-zzz-1">
            Z
          </span>
          <span className="absolute -top-9 left-3 text-3xl font-black text-purple-300 drop-shadow-md animate-zzz-2">
            Zz
          </span>
          <span className="absolute -top-16 left-12 text-4xl font-black text-indigo-300 drop-shadow-md animate-zzz-3">
            Zzz...
          </span>
        </div>

        {/* Halo e Vídeo do Sr. Belinho Dormindo no Balcão e Sonhando com a Praia */}
        <div className="relative animate-breathe flex flex-col items-center">
          <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-3xl bg-gradient-to-b from-purple-800/60 via-amber-500/20 to-purple-950/70 p-2.5 border-2 border-purple-400/40 shadow-2xl flex items-center justify-center overflow-hidden">
            <video 
              src="/belinho/descanso.mp4" 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-full object-cover rounded-2xl filter drop-shadow-2xl"
            >
              <img 
                src="/belinho/segunda.gif" 
                alt="Sr. Belinho Dormindo" 
                className="w-full h-full object-contain filter drop-shadow-2xl"
                onError={(e) => {
                  e.currentTarget.src = '/belinho/segunda.jpg';
                }}
              />
            </video>
          </div>

          <div className="mt-5 text-center space-y-1.5 max-w-lg">
            <h2 className="text-xl sm:text-2xl font-black text-amber-300 flex items-center justify-center gap-2 drop-shadow-sm">
              <span>Zzz... Cochilando no balcão e sonhando com a praia</span>
              <span className="text-xl sm:text-2xl">🏝️🥥</span>
            </h2>
            <p className="text-xs sm:text-sm text-purple-100 font-bold">
              O caixa descansou após {timeoutMinutes} minutos de tranquilidade.
            </p>
          </div>
        </div>

      </div>

      {/* Rodapé: Dica e Botão para acordar */}
      <div className="text-center z-10 pb-4 space-y-2.5">
        <button
          type="button"
          onClick={handleAcordarManual}
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-xl active:scale-95 cursor-pointer ring-2 ring-amber-300"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>Mova o mouse ou clique aqui para acordar</span>
        </button>
        <p className="text-[11px] text-slate-400 font-medium">
          Santiago PDV • Seus pedidos, caixa e dados continuam intactos
        </p>
      </div>

    </div>
  );
}
