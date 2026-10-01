
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MONTHLY_REVIEW_TEXTS, EMOTION_CONFIG, CONTEXT_CONFIG, EMOTION_LABELS } from '../constants';
import Button from './ui/Button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { EmotionType, ContextCategory, JournalEntry } from '../types';
import { X, Sparkles, ChevronRight, Link as LinkIcon, Check, Calendar, BarChart2, Trophy } from 'lucide-react';
import { generateAnalysisInsight, AnalysisData } from '../services/geminiService';

interface MonthlyReflectionModalProps {
    entries?: JournalEntry[]; // Optional: if provided, uses these (Statistics view). If not, uses Context (Auto view).
    targetDate?: Date; // Optional: Reference date.
    existingEntry?: JournalEntry; 
    onClose?: () => void; 
}

const MonthlyReflectionModal: React.FC<MonthlyReflectionModalProps> = ({ entries, targetDate, existingEntry, onClose }) => {
  const { settings, setShowMonthlyReview, addEntry, previousMonthStats } = useApp();
  const [step, setStep] = useState(1);
  const [reflectionText, setReflectionText] = useState(existingEntry?.userText || '');
  const [aiInsight, setAiInsight] = useState(existingEntry?.aiReply || '');
  const [loadingInsight, setLoadingInsight] = useState(false);

  // --- RESOLVE EFFECTIVE DATA (Props vs Context Fallback) ---
  const effectiveEntries = useMemo(() => {
      if (entries) return entries;
      return previousMonthStats?.entries || [];
  }, [entries, previousMonthStats]);

  const effectiveTargetDate = useMemo(() => {
      if (targetDate) return targetDate;
      // Default to last day of previous month relative to now
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), 0);
  }, [targetDate]);

  const t = MONTHLY_REVIEW_TEXTS[settings.language];
  const isViewMode = !!existingEntry;
  
  // Safe locale string generation
  const monthLabel = effectiveTargetDate.toLocaleString(settings.language === 'en' ? 'en-US' : 'pt-PT', { month: 'long' });

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    // Edge case: No entries and no existing entry
    if ((!effectiveEntries || effectiveEntries.length === 0) && !existingEntry) return null;

    // 1. Emotion Counts & Pie Data
    const emotionCounts: Record<string, number> = {};
    effectiveEntries.forEach(e => {
        emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
    });

    // Sort for Top Emotions
    const sortedEmotions = Object.entries(emotionCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([emo, count]) => ({
            emotion: emo as EmotionType,
            count,
            percentage: Math.round((count / effectiveEntries.length) * 100)
        }));

    const top2 = sortedEmotions.slice(0, 2);
    const top3 = sortedEmotions.slice(0, 3);

    // Fallback if empty but existing exists
    if (top2.length === 0 && existingEntry) {
        const fallback = { emotion: existingEntry.emotion, count: 1, percentage: 100 };
        top2.push(fallback);
        top3.push(fallback);
    }

    // Pie Chart Data
    const pieData = sortedEmotions.map(d => ({
        name: d.emotion,
        value: d.count,
        fill: EMOTION_CONFIG[d.emotion].bg.replace('bg-', '').replace('-100', '')
    })).map(d => {
        // Fix color mapping
        const colorMap: Record<string, string> = {
            'yellow': '#eab308', 'blue': '#3b82f6', 'orange': '#f97316', 
            'purple': '#a855f7', 'red': '#ef4444', 'slate': '#64748b', 'teal': '#14b8a6'
        };
        return { ...d, fill: colorMap[d.fill] || '#cbd5e1' };
    });

    // 2. Context Helper
    const getTopContextForEntries = (subsetEntries: JournalEntry[]): ContextCategory | null => {
        const ctxCounts: Record<string, number> = {};
        subsetEntries.forEach(e => {
            if (e.contextTags) {
                e.contextTags.forEach(c => {
                    ctxCounts[c] = (ctxCounts[c] || 0) + 1;
                });
            }
        });
        const sorted = Object.entries(ctxCounts).sort((a, b) => b[1] - a[1]);
        return sorted.length > 0 ? sorted[0][0] as ContextCategory : null;
    };

    // 3. Correlations
    const topEmotion1 = top2[0]?.emotion;
    const topContext1 = topEmotion1 ? getTopContextForEntries(effectiveEntries.filter(e => e.emotion === topEmotion1)) : null;

    const topEmotion2 = top2[1]?.emotion;
    const topContext2 = topEmotion2 ? getTopContextForEntries(effectiveEntries.filter(e => e.emotion === topEmotion2)) : null;

    const generalTopContext = getTopContextForEntries(effectiveEntries);

    return { 
        pieData,
        top2,
        top3,
        topContext1, 
        topContext2, 
        generalTopContext,
        total: effectiveEntries.length
    };
  }, [effectiveEntries, existingEntry]);

  // --- AI INSIGHT GENERATION ---
  useEffect(() => {
      if (step === 2 && stats && stats.top2.length > 0 && !aiInsight && !loadingInsight && !existingEntry) {
          setLoadingInsight(true);
          
          const analysisData: AnalysisData = {
              topEmotion: stats.top2[0].emotion,
              topEmotionContext: stats.topContext1,
              secondEmotion: stats.top2[1]?.emotion,
              secondEmotionContext: stats.topContext2,
              generalTopContext: stats.generalTopContext
          };

          generateAnalysisInsight(analysisData, settings.language)
            .then(text => {
                setAiInsight(text);
                setLoadingInsight(false);
            })
            .catch(() => setLoadingInsight(false));
      }
  }, [step, stats, settings.language, existingEntry, aiInsight]);

  if (!stats) return null;

  const handleClose = () => {
    if (onClose) onClose();
    else setShowMonthlyReview(false);
  };

  const handleSave = () => {
    if (!existingEntry) {
        // Force save date to end of month
        const saveDate = new Date(effectiveTargetDate);
        saveDate.setHours(23, 59, 59);
        
        const year = saveDate.getFullYear();
        const month = saveDate.getMonth();
        const monthRef = `${year}-${(month + 1).toString().padStart(2, '0')}`;

        addEntry(
          stats.top2[0].emotion,
          reflectionText,
          aiInsight || t.aiInsight,
          'monthly',
          monthRef,
          undefined,
          stats.generalTopContext ? [stats.generalTopContext] : [],
          saveDate.toISOString()
        );
    }
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]">
        
        {/* Progress Bar */}
        {!isViewMode && (
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 flex">
                <div className={`h-full bg-purple-500 transition-all duration-500 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`} />
            </div>
        )}
        {isViewMode && <div className="w-full h-1.5 bg-purple-500/20" />}

        <button onClick={handleClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full z-10 transition-colors">
           <X className="w-5 h-5 text-slate-400" />
        </button>

        <div className="p-6 flex-1 overflow-y-auto">

             {/* VIEW MODE INDICATOR */}
            {isViewMode && (
                <div className="flex items-center justify-center gap-2 mb-4 bg-purple-50 dark:bg-purple-900/20 py-2 rounded-full">
                    <Check className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">Saved Review</span>
                </div>
            )}
            
            {/* STEP 1: BREAKDOWN (PIE CHART) */}
            {(step === 1 || isViewMode) && (
                <div className="animate-fade-in mb-8">
                    <div className="flex items-center gap-2 mb-1 text-purple-600 dark:text-purple-400">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">{monthLabel}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t.title1}</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                        {t.summaryIntro} <span className="font-bold text-purple-500">{monthLabel}</span>.
                    </p>

                    {stats.pieData.length > 0 && (
                        <div className="h-48 w-full mb-6 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {stats.pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Count */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold text-slate-700 dark:text-slate-200">{stats.total}</span>
                                <span className="text-[10px] text-slate-400 uppercase font-bold">Entries</span>
                            </div>
                        </div>
                    )}

                    {/* Top 3 Breakdown List */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Trophy className="w-3 h-3" /> Top 3 Emotions
                        </h4>
                        {stats.top3.map((d, index) => {
                            const config = EMOTION_CONFIG[d.emotion];
                            const label = EMOTION_LABELS[settings.language][d.emotion];
                            const isWinner = index === 0;

                            return (
                                <div key={d.emotion} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        {/* Rank Badge */}
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isWinner ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-700'}`}>
                                            #{index + 1}
                                        </div>
                                        
                                        <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center text-xl`}>
                                            {config.emoji}
                                        </div>
                                        <div>
                                            <span className="block font-bold text-sm text-slate-700 dark:text-slate-200">{label}</span>
                                            <span className="text-xs text-slate-400">{d.count} {t.times}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-black text-lg text-slate-800 dark:text-white">{d.percentage}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* STEP 2: DOMINANT & CORRELATION */}
            {(step === 2 || isViewMode) && (
                <div className="animate-slide-up mb-8">
                     <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">{t.title2}</h2>

                     {/* Correlation Card */}
                     <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-5 rounded-2xl border border-purple-100 dark:border-purple-800 mb-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 text-purple-600 dark:text-purple-400">
                            <LinkIcon className="w-5 h-5" />
                            <span className="font-bold text-sm uppercase tracking-wide">{t.contextCorrelation}</span>
                        </div>
                        
                        {loadingInsight ? (
                            <div className="flex items-center gap-2 text-slate-400 italic">
                                <Sparkles className="w-4 h-4 animate-spin" /> {t.analyzing}
                            </div>
                        ) : aiInsight ? (
                            <p className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                                {aiInsight}
                            </p>
                        ) : (
                            <div className="text-slate-400 italic text-sm">
                                "Analysis unavailable."
                            </div>
                        )}
                     </div>

                     {/* Top Emotion Context */}
                     {stats.topContext1 && (
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{EMOTION_CONFIG[stats.top2[0].emotion].emoji}</span>
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                    {EMOTION_LABELS[settings.language][stats.top2[0].emotion]}
                                </span>
                            </div>
                            <span className="text-xs text-slate-400">linked to</span>
                            <span className="text-sm font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-700 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-600">
                                {CONTEXT_CONFIG[stats.topContext1].label[settings.language]}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* STEP 3: REFLECTION */}
            {(step === 3 || isViewMode) && (
                <div className="flex flex-col h-full animate-slide-up">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t.title3}</h2>
                    {!isViewMode && <p className="text-slate-500 dark:text-slate-400 mb-6">{t.prompt}</p>}

                    <div className="flex-1 mb-4">
                         <textarea
                            value={reflectionText}
                            onChange={(e) => setReflectionText(e.target.value)}
                            placeholder="..."
                            className="w-full h-48 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:ring-2 focus:ring-purple-500/50 outline-none resize-none text-lg"
                            readOnly={isViewMode}
                            autoFocus={!isViewMode}
                        />
                    </div>
                </div>
            )}

        </div>

        <div className="p-6 pt-0">
            {isViewMode ? (
                <Button onClick={handleClose} fullWidth variant="primary" className="h-14 bg-purple-600 hover:bg-purple-700">
                    {t.close}
                </Button>
            ) : (
                step < 3 ? (
                    <Button onClick={() => setStep(step + 1)} fullWidth className="h-14">
                        {t.next} <ChevronRight className="w-5 h-5" />
                    </Button>
                ) : (
                    <Button onClick={handleSave} disabled={!reflectionText.trim()} fullWidth variant="primary" className="h-14 bg-purple-600 hover:bg-purple-700">
                        {t.save}
                    </Button>
                )
            )}
        </div>

      </div>
    </div>
  );
};

export default MonthlyReflectionModal;
