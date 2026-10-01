import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TEXTS, EMOTION_CONFIG, EMOTION_LABELS, INSPIRATIONAL_QUOTES, CONTEXT_CONFIG } from '../constants';
import { EmotionType, Language, ContextCategory } from '../types';
import { generateSupportMessage } from '../services/geminiService';
import { Loader2, Lock, Sparkles, Check, MessageCircleHeart, Quote, Clock, Zap } from 'lucide-react';

interface HomeProps {
  onResult: (emotion: EmotionType, text: string, reply: string) => void;
  onShowPaywall: () => void;
}

const Home: React.FC<HomeProps> = ({ onResult, onShowPaywall }) => {
  const { settings, remainingSupports, incrementUsage, addEntry, entries } = useApp();
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [selectedContexts, setSelectedContexts] = useState<ContextCategory[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  
  const t = TEXTS[settings.language];
  const limit = remainingSupports;

  // --- QUOTE OF THE DAY LOGIC ---
  const dailyQuote = useMemo(() => {
    // 1. Deterministic Seed based on Date (so it stays same all day)
    const todayStr = new Date().toDateString(); // "Mon Oct 02 2023"
    let hash = 0;
    for (let i = 0; i < todayStr.length; i++) {
        hash = todayStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const safeHash = Math.abs(hash);

    // 2. Logic: Based on YESTERDAY'S emotion (or random if new)
    let targetEmotion = EmotionType.NEUTRAL;
    
    if (entries.length > 0) {
        targetEmotion = entries[0].emotion;
    }

    const quotesMap = INSPIRATIONAL_QUOTES[settings.language] || INSPIRATIONAL_QUOTES[Language.EN];
    const quotesList = quotesMap[targetEmotion];
    
    // 4. Select
    const index = safeHash % quotesList.length;
    return quotesList[index];

  }, [settings.language, entries]);

  // --- VENT LIMIT LOGIC ---
  const ventAvailability = useMemo(() => {
      if (!settings.lastVentDate) return { available: true, daysLeft: 0 };
      
      const lastVent = new Date(settings.lastVentDate);
      const now = new Date();
      // Calculate difference in days
      const diffTime = Math.abs(now.getTime() - lastVent.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const LIMIT_DAYS = 30;
      
      if (diffDays >= LIMIT_DAYS) {
          return { available: true, daysLeft: 0 };
      } else {
          return { available: false, daysLeft: LIMIT_DAYS - diffDays };
      }
  }, [settings.lastVentDate]);


  const handleGetSupport = async (mode: 'standard' | 'vent' = 'standard') => {
    // 1. Validate Emotion: Required for Standard, NOT for Vent
    if (mode !== 'vent' && !selectedEmotion) return;
    
    // 2. Validate Text: Required for Standard and Vent
    if (!text.trim()) {
        return;
    }

    // 3. Check Pro limits & Feature limits
    if (mode === 'vent') {
        if (!settings.isPro) {
            onShowPaywall();
            return;
        }
        if (!ventAvailability.available) {
            alert(`Emergency Vent is available once every 30 days. Available in ${ventAvailability.daysLeft} days.`);
            return;
        }
    }

    // 4. Check Daily Limit
    if (limit <= 0) {
      onShowPaywall();
      return;
    }

    setLoading(true);
    incrementUsage();

    const emotionArg = selectedEmotion || EmotionType.STRESSED;
    const textArg = text.trim();

    try {
      const reply = await generateSupportMessage(emotionArg, textArg, settings.language, mode, selectedContexts);
      onResult(emotionArg, textArg, reply); 
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLog = () => {
    if (!settings.isPro) {
      onShowPaywall();
      return;
    }
    if (!selectedEmotion) return;

    // Here I can save contexts directly
    addEntry(
      selectedEmotion, 
      t.quickLog, 
      "Emotion logged.", 
      'daily', 
      undefined, 
      undefined,
      selectedContexts // Passing context tags
    );
    alert(t.quickLogSaved);
    setSelectedEmotion(null);
    setSelectedContexts([]);
    setText('');
  };

  const handleQuoteClick = () => {
    if (!settings.isPro) {
      onShowPaywall();
      return;
    }
    setText(dailyQuote);
  };

  const toggleContext = (ctx: ContextCategory) => {
      setSelectedContexts(prev => 
        prev.includes(ctx) ? prev.filter(c => c !== ctx) : [...prev, ctx]
      );
  };

  // --- BENTO GRID CONFIGURATION ---
  const BENTO_LAYOUT: Record<EmotionType, string> = {
    [EmotionType.HAPPY]: 'col-span-2 row-span-2', // Big Square
    [EmotionType.SAD]: 'col-span-1 row-span-2',   // Tall Rectangle
    [EmotionType.STRESSED]: 'col-span-1 row-span-1',
    [EmotionType.ANXIOUS]: 'col-span-1 row-span-1',
    [EmotionType.ANGRY]: 'col-span-1 row-span-1',
    [EmotionType.TIRED]: 'col-span-2 row-span-1', // Wide Rectangle
    [EmotionType.NEUTRAL]: 'col-span-1 row-span-1',
  };

  const BENTO_STYLES: Record<EmotionType, string> = {
      [EmotionType.HAPPY]: 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 shadow-orange-500/20',
      [EmotionType.SAD]: 'bg-gradient-to-br from-blue-300 via-blue-400 to-indigo-400 shadow-indigo-500/20',
      [EmotionType.STRESSED]: 'bg-gradient-to-br from-orange-300 via-orange-400 to-red-400 shadow-red-500/20',
      [EmotionType.ANXIOUS]: 'bg-gradient-to-br from-purple-300 via-purple-400 to-fuchsia-400 shadow-purple-500/20',
      [EmotionType.ANGRY]: 'bg-gradient-to-br from-red-400 via-red-500 to-rose-600 shadow-red-600/20',
      [EmotionType.TIRED]: 'bg-gradient-to-br from-slate-300 via-slate-400 to-gray-500 shadow-slate-500/20',
      [EmotionType.NEUTRAL]: 'bg-gradient-to-br from-teal-300 via-teal-400 to-emerald-400 shadow-teal-500/20',
  };

  const GRID_ORDER = [
      EmotionType.HAPPY,
      EmotionType.SAD,
      EmotionType.STRESSED,
      EmotionType.ANXIOUS,
      EmotionType.ANGRY,
      EmotionType.TIRED,
      EmotionType.NEUTRAL
  ];
  
  const CONTEXT_ORDER: ContextCategory[] = ['work', 'relationships', 'health', 'finance', 'self', 'other'];

  const isFormValid = selectedEmotion && text.trim() && !loading;

  return (
    <div className="flex flex-col h-full p-6 pb-24 overflow-y-auto no-scrollbar bg-slate-50 dark:bg-slate-950">
      
      {/* Quote of the Day (Pro) */}
      <div 
        onClick={handleQuoteClick}
        className="mt-2 mb-6 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl p-4 text-white shadow-lg cursor-pointer relative overflow-hidden group shrink-0 transition-transform active:scale-98"
      >
        <div className="absolute top-0 right-0 p-2 opacity-20">
            <Quote className="w-12 h-12 text-white" />
        </div>
        {!settings.isPro && (
            <div className="absolute top-2 right-2 bg-black/20 p-1 rounded-full">
                <Lock className="w-4 h-4 text-white" />
            </div>
        )}
        <h3 className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> {t.magicQuestionTitle}
        </h3>
        <p className="font-medium text-lg leading-snug pr-4 italic">"{dailyQuote}"</p>
      </div>

      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
          {t.howAreYou}
        </h1>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span className={`font-bold ${limit === 0 ? 'text-red-500' : 'text-primary'}`}>{limit}</span> {t.remaining}
        </div>
      </header>

      {/* BENTO GRID EMOTION SELECTOR */}
      <div className="grid grid-cols-3 gap-3 auto-rows-[100px] mb-6">
        {GRID_ORDER.map((emotion) => {
          const config = EMOTION_CONFIG[emotion];
          const label = EMOTION_LABELS[settings.language][emotion];
          const layoutClass = BENTO_LAYOUT[emotion];
          const colorClass = BENTO_STYLES[emotion];
          const isSelected = selectedEmotion === emotion;
          const isOthersSelected = selectedEmotion !== null && !isSelected;

          return (
            <button
              key={emotion}
              onClick={() => setSelectedEmotion(emotion)}
              className={`
                relative rounded-3xl flex flex-col items-center justify-center p-3
                transition-all duration-300 ease-out shadow-lg group border border-white/10
                ${layoutClass}
                ${colorClass}
                ${isSelected ? 'scale-[1.02] ring-4 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-950 ring-current z-10' : ''}
                ${isOthersSelected ? 'opacity-40 grayscale-[0.3] scale-95' : 'hover:scale-[0.98] hover:shadow-xl'}
              `}
              style={{
                  color: isSelected ? 'inherit' : undefined 
              }}
            >
              <div className={`
                flex items-center justify-center mb-1 transition-transform duration-300 drop-shadow-md
                ${isSelected ? 'scale-110 rotate-6' : 'group-hover:scale-110'}
              `}>
                 <span className="text-4xl filter drop-shadow-sm">{config.emoji}</span>
              </div>

              <span className="text-white font-bold text-xs uppercase tracking-wider drop-shadow-md mt-1">
                {label}
              </span>

              {isSelected && (
                  <div className="absolute top-3 right-3 bg-white text-slate-900 rounded-full p-0.5 animate-fade-in shadow-sm">
                      <div className="w-2 h-2 bg-current rounded-full" /> 
                  </div>
              )}
            </button>
          );
        })}
      </div>

      {/* CONTEXT CHIPS (PILLS) */}
      <div className="mb-6 animate-slide-up">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block px-1">
             {t.selectContext || "What is this about?"}
        </label>
        <div className="flex flex-wrap gap-2">
            {CONTEXT_ORDER.map(ctx => {
                const config = CONTEXT_CONFIG[ctx];
                const Icon = config.icon;
                const isSelected = selectedContexts.includes(ctx);
                
                let activeStyle = 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'; 
                
                if (selectedEmotion) {
                    const emoConfig = EMOTION_CONFIG[selectedEmotion];
                    const baseColor = emoConfig.bg; 
                    const textColor = emoConfig.color.replace('500', '700'); 
                    const borderColor = emoConfig.bg.replace('100', '300'); 
                    
                    activeStyle = `${baseColor} ${textColor} border-2 border-${borderColor}`;
                }

                return (
                    <button
                        key={ctx}
                        onClick={() => toggleContext(ctx)}
                        className={`
                            flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 border
                            ${isSelected 
                                ? activeStyle 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'}
                        `}
                    >
                        <Icon className="w-3.5 h-3.5" />
                        {config.label[settings.language]}
                    </button>
                )
            })}
        </div>
      </div>

      {/* Text Input */}
      <div className="flex-1 mb-4 relative group">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.placeholder}
          className="w-full h-32 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none resize-none text-lg shadow-sm placeholder:text-slate-400 transition-all"
        />
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
          {/* GET SUPPORT - CARD STYLE */}
          <button
            onClick={() => handleGetSupport('standard')}
            disabled={!isFormValid}
            className={`
                w-full py-4 rounded-xl text-white transition-all duration-300 shadow-xl
                flex flex-col items-center justify-center
                ${!isFormValid
                    ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-70 shadow-none' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-500 shadow-indigo-600/40 hover:shadow-indigo-600/60 hover:scale-[1.02] animate-heartbeat'
                }
            `}
          >
             {loading ? (
                 <div className="flex items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="font-bold">Generating...</span>
                 </div>
             ) : (
                 <div className="flex flex-col items-center justify-center text-center">
                    <div className="flex items-center gap-2 mb-1">
                        {limit <= 0 ? (
                            <Lock className="w-5 h-5 text-white/80" />
                        ) : (
                            <Sparkles className="w-5 h-5 text-white fill-white/20" />
                        )}
                        <span className="text-xl font-bold tracking-wide">{t.getSupport}</span>
                    </div>
                    <span className="text-xs font-medium text-white/70 block px-4">
                        {t.getSupportSubtitle}
                    </span>
                 </div>
             )}
          </button>

          <div className="grid grid-cols-1 gap-3">
              {/* Quick Log - Full Width, DYNAMIC STYLE */}
              <button
                  onClick={handleQuickLog}
                  disabled={!selectedEmotion || loading}
                  className={`
                    w-full py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg
                    flex flex-col items-center justify-center text-center
                    ${!settings.isPro 
                        ? 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-blue-500/30 hover:shadow-blue-500/50 hover:brightness-105'
                    }
                  `}
              >
                  <div className="flex items-center gap-2 mb-1">
                      {(!settings.isPro) ? (
                        <Lock className="w-5 h-5 text-slate-400" /> 
                      ) : (
                        <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                      )}
                      
                      <span className={`text-xl font-bold ${!settings.isPro ? 'text-slate-500' : 'text-white'}`}>
                          {t.quickLog}
                      </span>
                  </div>
                  
                  {settings.isPro && (
                      <span className="text-xs font-medium text-blue-100 opacity-80 block px-4">
                          {t.quickLogSubtitle}
                      </span>
                  )}
              </button>

              {/* Emergency Vent - Full Width */}
              <button
                  onClick={() => handleGetSupport('vent')}
                  disabled={loading || (!settings.isPro && false) || (settings.isPro && !ventAvailability.available)}
                  className={`
                    w-full flex flex-col items-center justify-center p-4 rounded-xl transition-all active:scale-95 border group relative overflow-hidden
                    ${!ventAvailability.available && settings.isPro
                        ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-80' 
                        : 'bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 border-rose-100 dark:border-rose-800 hover:border-rose-200'
                    }
                  `}
              >
                  {/* Icon & Label */}
                  <div className="flex items-center justify-center gap-2 mb-1">
                      {(!settings.isPro) ? (
                        <Lock className="w-4 h-4 text-rose-400" /> 
                      ) : !ventAvailability.available ? (
                        <Clock className="w-4 h-4 text-slate-400" />
                      ) : (
                        <MessageCircleHeart className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
                      )}
                      
                      <span className={`text-sm font-bold leading-tight text-center ${!ventAvailability.available && settings.isPro ? 'text-slate-500' : 'text-rose-600 dark:text-rose-300'}`}>
                         {t.ventMode}
                      </span>
                  </div>

                  {/* Warning / Availability Text */}
                  {settings.isPro && !ventAvailability.available ? (
                      <span className="text-[10px] font-bold text-slate-400 text-center px-4">
                          Available in {ventAvailability.daysLeft} days
                      </span>
                  ) : (
                      <span className={`text-[10px] font-medium text-center px-4 leading-tight ${!settings.isPro ? 'text-rose-400' : 'text-rose-400 dark:text-rose-300/70'}`}>
                          {t.ventWarning}
                      </span>
                  )}
              </button>
          </div>
      </div>
    </div>
  );
};

export default Home;