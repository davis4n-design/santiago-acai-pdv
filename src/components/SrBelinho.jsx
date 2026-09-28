import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Coffee, Battery, Shirt, X, Play, RefreshCw, Calendar, Moon } from 'lucide-react';

/**
 * SR. BELINHO - Mascote Oficial e Dinâmico do Santiago Açaí e Cia
 * 
 * Assets oficiais carregados de /belinho/:
 * - Segunda: Na rede de pijama e óculos escuros (Folga Oficial 🏖️)
 * - Terça: Terno roxo Santiago, gravata dourada, crachá oficial, 100% energia (⚡)
 * - Quarta: Avental roxo e amarelo Santiago, focado e positivo (💪)
 * - Quinta: Caneca de Café Brasil, cansando levemente (🥱)
 * - Sexta: Sextou no caixa! Café na mão, pilha de comandas, adrenalina e olheiras (🔥)
 * - Sábado/Domingo: Zumbi operacional, roupas rasgadas com fita, 'Survived the Weekend Rush' (🧟)
 */

const DIAS_CONFIG = [
  {
    diaId: 1, // Segunda
    diaNome: 'Segunda-feira',
    short: 'Seg',
    isFolga: true,
    energiaBase: 0,
    statusTitulo: 'FOLGA MERECIDA 🏖️',
    statusDesc: 'Segunda a lanchonete não abre! Sr. Belinho está descansando na rede.',
    humor: 'Dormindo',
    emoji: '😴',
    assetGif: '/belinho/segunda.gif',
    assetJpg: '/belinho/segunda.jpg',
    frases: [
      "Zzzzz... Hoje é segunda, hoje eu não existo!",
      "Segunda de folga! Só me acordem amanhã com um açaí.",
      "Não respondo WhatsApp hoje nem se o mundo acabar.",
      "Recarregando as baterias pra semana toda..."
    ]
  },
  {
    diaId: 2, // Terça
    diaNome: 'Terça-feira',
    short: 'Ter',
    isFolga: false,
    energiaBase: 100,
    statusTitulo: '100% ENERGIA ⚡',
    statusDesc: 'Voltou da folga de ontem com a corda toda! Terno e crachá nos trinques.',
    humor: 'Animado',
    emoji: '😎',
    assetGif: '/belinho/terca.gif',
    assetJpg: '/belinho/terca.jpg',
    frases: [
      "Bom dia família! Voltei da folga renovado!",
      "Hoje o atendimento voa! Pode mandar pedido no WhatsApp!",
      "Terça com cara de recomeço e foco total!",
      "Bateria em 100%! Quem manda no caixa do Santiago sou eu."
    ]
  },
  {
    diaId: 3, // Quarta
    diaNome: 'Quarta-feira',
    short: 'Qua',
    isFolga: false,
    energiaBase: 80,
    statusTitulo: 'RITMO FIRME 💪',
    statusDesc: 'Avental alinhado, pedidos saindo a mil por hora.',
    humor: 'Focado',
    emoji: '🏃',
    assetGif: '/belinho/quarta.gif',
    assetJpg: '/belinho/quarta.jpg',
    frases: [
      "Quarta-feira a todo vapor, comandas nos trilhos!",
      "Ritmo constante, o açaí e as barcas não param de sair.",
      "Bora que a semana tá só engrenando!",
      "Tudo sob controle, planilha do Google e estoque alinhados."
    ]
  },
  {
    diaId: 4, // Quinta
    diaNome: 'Quinta-feira',
    short: 'Qui',
    isFolga: false,
    energiaBase: 60,
    statusTitulo: 'CANSANDO LEVEMENTE 🥱',
    statusDesc: 'A caneca de Café Brasil começa a trabalhar firme.',
    humor: 'Cansadinho',
    emoji: '☕',
    assetGif: '/belinho/quinta.gif',
    assetJpg: '/belinho/quinta.jpg',
    frases: [
      "Quinta-feira... já dá pra sentir o peso nos ombros.",
      "Mais um café e a gente bate a meta do dia!",
      "Firme na missão, amanhã já é sexta-feira!",
      "Atenção redobrada no troco pra não errar nada."
    ]
  },
  {
    diaId: 5, // Sexta
    diaNome: 'Sexta-feira',
    short: 'Sex',
    isFolga: false,
    energiaBase: 40,
    statusTitulo: 'SEXTOU NO CAIXA 🔥',
    statusDesc: 'Olheiras roxas, pedidos bombando e adrenalina pura!',
    humor: 'Na adrenalina',
    emoji: '😵‍💫',
    assetGif: '/belinho/sexta.gif',
    assetJpg: '/belinho/sexta.jpg',
    frases: [
      "SEXTOU! Se eu sentar nessa cadeira agora, eu desmaio.",
      "Açaí saindo de balde e eu funcionando à base de café puro!",
      "Pilha de pedidos na mão e foco total no atendimento!",
      "Chama no delivery que o Sr. Belinho aguenta o tranco da sexta!"
    ]
  },
  {
    diaId: 6, // Sábado
    diaNome: 'Sábado',
    short: 'Sáb',
    isFolga: false,
    energiaBase: 20,
    statusTitulo: 'SOBREVIVENTE DO CAIXA 🧟',
    statusDesc: 'Pico de movimento, fita isolante, sobrevivendo até a folga!',
    humor: 'Zumbi Operacional',
    emoji: '🧟',
    assetGif: '/belinho/sabado.gif',
    assetJpg: '/belinho/sabado.jpg',
    frases: [
      "Survived the Weekend Rush! Apenas um robô batendo pedido...",
      "Minha alma já foi pra casa, só sobrou meu corpo no caixa.",
      "Caneca virada, fita no peito, mas nenhum pedido atrasou!",
      "Piloto automático ativado com sucesso."
    ]
  },
  {
    diaId: 0, // Domingo
    diaNome: 'Domingo',
    short: 'Dom',
    isFolga: false,
    energiaBase: 5,
    statusTitulo: 'ÚLTIMO SUSPIRO ⏳',
    statusDesc: 'Olho no relógio e contagem regressiva para a folga de segunda!',
    humor: 'Contagem Regressiva',
    emoji: '⏳',
    assetGif: '/belinho/domingo.gif',
    assetJpg: '/belinho/domingo.jpg',
    frases: [
      "Olho no relógio: só mais umas horas e eu entro na folga de segunda!",
      "O avental do Santiago tá surrado, mas a meta do fim de semana tá batida!",
      "Minha xícara caiu, não sinto minhas pernas, mas sobrevivi!",
      "Amanhã é folga sagrada! Vou dormir 14 horas seguidas!"
    ]
  }
];

export default function SrBelinho() {
  const [isOpen, setIsOpen] = useState(false);
  const [coffeeBoost, setCoffeeBoost] = useState(0);
  const [speechIndex, setSpeechIndex] = useState(0);
  const [diaSimulado, setDiaSimulado] = useState(null); // null = dia real

  // Data atual
  const now = new Date();
  const realDayOfWeek = now.getDay(); // 0 = Dom, 1 = Seg, 2 = Ter, 3 = Qua, 4 = Qui, 5 = Sex, 6 = Sáb
  const dayOfMonth = now.getDate(); // 1 a 31

  // Dia ativo (real ou simulado pelo usuário para ver os outros dias)
  const activeDayIndex = diaSimulado !== null ? diaSimulado : realDayOfWeek;
  const currentDiaConfig = DIAS_CONFIG.find(d => d.diaId === activeDayIndex) || DIAS_CONFIG[1];

  // Cálculo da Energia Dinâmica
  const energiaAtual = currentDiaConfig.isFolga 
    ? 0 
    : Math.min(100, currentDiaConfig.energiaBase + coffeeBoost * 10);

  // Estado Mensal (Condição das Roupas / Finanças)
  const monthlyStatus = useMemo(() => {
    if (dayOfMonth <= 7) {
      return {
        estagio: 'Magnata do Açaí 👔',
        percentual: 100,
        descricao: 'Terno engomado, relógio brilhando! Salário na conta e bolso cheio!',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300'
      };
    } else if (dayOfMonth <= 18) {
      return {
        estagio: 'Trabalhador Padrão 👕',
        percentual: 75,
        descricao: 'Uniforme e avental alinhados. Contas pagas, vida normal.',
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-300'
      };
    } else if (dayOfMonth <= 25) {
      return {
        estagio: 'Apertado & Remendado 🧵',
        percentual: 40,
        descricao: 'Roupa gasta, café extra. Contando moedas até o próximo mês.',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300'
      };
    } else {
      return {
        estagio: 'Farrapos do Fim de Mês 🩳',
        percentual: 10,
        descricao: 'Roupa rasgada, fita isolante e remendos! Sobrevivendo até o dia 5!',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300'
      };
    }
  }, [dayOfMonth]);

  const handleDarCafe = (e) => {
    e.stopPropagation();
    setCoffeeBoost(prev => Math.min(6, prev + 1));
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.25 },
      colors: ['#78350f', '#d97706', '#f59e0b', '#fde047']
    });
  };

  const handleProximaFrase = (e) => {
    e.stopPropagation();
    setSpeechIndex(prev => (prev + 1) % currentDiaConfig.frases.length);
  };

  const currentFrase = currentDiaConfig.frases[speechIndex % currentDiaConfig.frases.length];

  return (
    <div className="relative select-none">
      
      {/* Botão Gatilho no Topo (Header do PDV) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-400/40 text-white transition-all active:scale-95 shadow-xs cursor-pointer"
        title="Clique para ver o status e animações do Sr. Belinho!"
      >
        {/* Avatar Miniatura Animado do Sr. Belinho */}
        <div className="relative w-8 h-8 rounded-full bg-amber-100 p-0.5 border-2 border-amber-400 shadow-sm flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
          <img 
            src={currentDiaConfig.assetGif} 
            alt="Sr. Belinho" 
            className="w-full h-full object-cover object-top rounded-full"
            onError={(e) => {
              // Fallback para JPG caso GIF demore
              e.currentTarget.src = currentDiaConfig.assetJpg;
            }}
          />
          {coffeeBoost > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 text-[9px] font-black rounded-full flex items-center justify-center border border-white text-slate-950 animate-bounce shadow-xs">
              ☕
            </span>
          )}
        </div>

        <div className="text-left hidden sm:block leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-amber-300">Sr. Belinho</span>
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border ${
              currentDiaConfig.isFolga 
                ? 'bg-indigo-900/80 text-indigo-200 border-indigo-400/40' 
                : energiaAtual > 50 
                ? 'bg-emerald-900/80 text-emerald-200 border-emerald-400/40' 
                : 'bg-rose-900/80 text-rose-200 border-rose-400/40 animate-pulse'
            }`}>
              {currentDiaConfig.isFolga ? 'Folga 🏖️' : `${energiaAtual}% ⚡`}
            </span>
          </div>
          <p className="text-[10px] text-purple-200 font-medium truncate max-w-[125px]">
            {currentDiaConfig.isFolga ? 'Dormindo na rede' : currentDiaConfig.humor}
          </p>
        </div>
      </button>

      {/* Modal / Card Popover Completo e Animado */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-88 bg-white border-2 border-purple-900/20 rounded-3xl p-4 shadow-2xl space-y-3.5 text-slate-800 animate-scaleUp">
          
          {/* Header do Card com Botão Fechar */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-3">
              {/* Moldura da Imagem Animada */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-amber-100 to-amber-200 border-2 border-amber-400 shadow-md p-0.5 overflow-hidden shrink-0 flex items-center justify-center">
                <img 
                  src={currentDiaConfig.assetGif} 
                  alt="Sr. Belinho" 
                  className="w-full h-full object-cover object-top rounded-xl"
                  onError={(e) => {
                    e.currentTarget.src = currentDiaConfig.assetJpg;
                  }}
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-base text-[#3b0764]">Sr. Belinho</h3>
                  <span className="text-sm">{currentDiaConfig.emoji}</span>
                </div>
                <p className="text-xs font-bold text-amber-700">Mascote Oficial do Santiago</p>
                <span className="text-[10px] text-slate-400 font-medium">
                  {currentDiaConfig.diaNome} • {currentDiaConfig.statusTitulo}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Seletor de Simulação dos Dias da Semana (Easter Egg Interativo) */}
          <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-1 px-1">
              <span className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-purple-700" />
                <span>Rotina da Semana:</span>
              </span>
              {diaSimulado !== null && (
                <button
                  type="button"
                  onClick={() => setDiaSimulado(null)}
                  className="text-[10px] font-bold text-purple-700 hover:underline flex items-center gap-0.5"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>Voltar a Hoje</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {DIAS_CONFIG.map(d => {
                const isSelected = activeDayIndex === d.diaId;
                const isToday = realDayOfWeek === d.diaId;
                return (
                  <button
                    key={d.diaId}
                    type="button"
                    onClick={() => {
                      setDiaSimulado(d.diaId);
                      setSpeechIndex(0);
                    }}
                    className={`py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer text-center relative ${
                      isSelected
                        ? 'bg-[#3b0764] text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-purple-50 hover:text-purple-900 border border-slate-200'
                    }`}
                  >
                    {d.short}
                    {isToday && (
                      <span className="absolute -top-1 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" title="Hoje" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Balão de Fala Dinâmico e Engraçado */}
          <div 
            onClick={handleProximaFrase}
            className="p-3 bg-purple-50 hover:bg-purple-100/70 border border-purple-200/90 rounded-2xl cursor-pointer transition-all shadow-2xs relative group select-none"
            title="Clique para trocar a frase do Sr. Belinho"
          >
            <span className="text-[9px] uppercase font-black text-purple-700 block mb-0.5 tracking-wider">
              Fala do Sr. Belinho (Clique p/ trocar):
            </span>
            <p className="text-xs font-black text-purple-950 italic leading-snug">
              "{currentFrase}"
            </p>
            <span className="text-[9px] text-purple-600 font-bold block text-right mt-1">
              💬 clique para outra fala
            </span>
          </div>

          {/* Barômetro de Energia Semanal */}
          <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 flex items-center gap-1 font-black">
                <Battery className="w-3.5 h-3.5 text-amber-600" />
                <span>Energia ({currentDiaConfig.diaNome}):</span>
              </span>
              <span className={`font-black text-[11px] ${currentDiaConfig.isFolga ? 'text-indigo-600' : 'text-emerald-700'}`}>
                {currentDiaConfig.isFolga ? 'FOLGA 🏖️' : `${energiaAtual}%`}
              </span>
            </div>

            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  currentDiaConfig.isFolga 
                    ? 'bg-indigo-400 w-full' 
                    : energiaAtual > 60 
                    ? 'bg-emerald-500' 
                    : energiaAtual > 25 
                    ? 'bg-amber-500' 
                    : 'bg-rose-500 animate-pulse'
                }`}
                style={{ width: currentDiaConfig.isFolga ? '100%' : `${energiaAtual}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              {currentDiaConfig.statusDesc}
            </p>
          </div>

          {/* Barômetro Mensal: Roupas & Fim de Mês */}
          <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 flex items-center gap-1 font-black">
                <Shirt className="w-3.5 h-3.5 text-purple-700" />
                <span>Traje (Dia {dayOfMonth} do Mês):</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${monthlyStatus.badgeClass}`}>
                {monthlyStatus.estagio}
              </span>
            </div>

            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  monthlyStatus.percentual > 70 
                    ? 'bg-emerald-500' 
                    : monthlyStatus.percentual > 30 
                    ? 'bg-amber-500' 
                    : 'bg-rose-600'
                }`}
                style={{ width: `${monthlyStatus.percentual}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              {monthlyStatus.descricao}
            </p>
          </div>

          {/* Botão Interativo: Pagar um Café ao Sr. Belinho */}
          <div className="pt-1 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleDarCafe}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer ring-1 ring-amber-300"
            >
              <Coffee className="w-4 h-4 text-slate-950" />
              <span>Pagar Café ao Belinho ☕</span>
            </button>

            {coffeeBoost > 0 && (
              <span className="text-[11px] font-black text-amber-700 font-mono bg-amber-50 px-2 py-1.5 rounded-xl border border-amber-200 shadow-2xs">
                +{coffeeBoost * 10}% ⚡
              </span>
            )}
          </div>

          {/* Botão para Testar Tela de Descanso */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('ativar-descanso-belinho'));
              }, 60);
            }}
            className="w-full py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Ativar imediatamente o Modo Descanso com blur e Zzz"
          >
            <Moon className="w-3.5 h-3.5 text-purple-700" />
            <span>Testar Modo Descanso (Screensaver 20min)</span>
          </button>

        </div>
      )}
    </div>
  );
}
