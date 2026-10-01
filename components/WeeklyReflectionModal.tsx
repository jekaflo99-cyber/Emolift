

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { WEEKLY_SUMMARY_TEXTS, EMOTION_CONFIG, CONTEXT_CONFIG, EMOTION_LABELS } from '../constants';
import Button from './ui/Button';
import { EmotionType, JournalEntry, ContextCategory } from '../types';
import { X, Sparkles, ChevronRight, BarChart2, Link as LinkIcon, Calendar, PieChart, Check } from 'lucide-react';
import { generateAnalysisInsight, AnalysisData } from '../services/geminiService';

interface WeeklyReflectionModalProps {
  entries: JournalEntry[];
  weekLabel: string;
  onClose: () => void;
  existingEntry?: JournalEntry; // Optional existing data
  targetDate?: Date; // To save entry at specific date (e.g. end of that week)
}

const WeeklyReflectionModal: React.FC<WeeklyReflectionModalProps> = ({ entries, weekLabel, onClose, existingEntry, targetDate }) => {
  const { settings, addEntry } = useApp();
  const [step, setStep] = useState(1);
  const [reflectionText, setReflectionText] = useState(existingEntry?.userText || '');
  const [aiInsight, setAiInsight] = useState(existingEntry?.aiReply || '');
  const [loadingInsight, setLoadingInsight] = useState(false);

  const t = WEEKLY_SUMMARY_TEXTS[settings.language];
  const isViewMode = !!existingEntry;

  // Process Data
  const stats = useMemo(() => {
    // If we have an existing entry, we might not have the raw entries if looking far back?
    // Statistics.tsx tries to filter them, but if 0 entries returned but we have existingEntry, we should still show what we can (insight).
    if ((!entries || entries.length === 0) && !existingEntry) return null;

    // --- 1. Emotion Counts ---
    const emotionCounts: Record<string, number> = {};
    entries.forEach(e => {
        emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
    });

    // Sort Emotions
    const sortedEmotions = Object.entries(emotionCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([emo, count]) => ({
            emotion: emo as EmotionType,
            count,
            percentage: Math.round((count / entries.length) * 100)
        }));

    const top2 = sortedEmotions.slice(0, 2);

    // If existingEntry exists but raw entries are missing (edge case), we fake top2 using the existingEntry emotion if needed
    // But typically Statistics.tsx sends the raw entries along with existingEntry.
    
    // Fallback if empty but existing exists (just to prevent crash)
    if (top2.length === 0 && existingEntry) {
        top2.push({ emotion: existingEntry.emotion, count: 1, percentage: 100 });
    }

    // --- 2. Context Calculation Helper ---
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

    // --- 3. Specific Contexts ---
    const topEmotion1 = top2[0]?.emotion;
    const topContext1 = topEmotion1 ? getTopContextForEntries(entries.filter(e => e.emotion === topEmotion1)) : null;

    const topEmotion2 = top2[1]?.emotion;
    const topContext2 = topEmotion2 ? getTopContextForEntries(entries.filter(e => e.emotion === topEmotion2)) : null;

    // --- 4. General Top Context (Overall) ---
    const generalTopContext = getTopContextForEntries(entries);

    return { 
        top2, 
        topContext1, 
        topContext2,
        generalTopContext,
        total: entries.length 
    };
  }, [entries, existingEntry]);

  // Fetch AI Insight when step 2 opens (Only if NOT existing)
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

  if (!stats) {
      return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 text-center">
                  <p className="text-slate-500 mb-4">{t.noData}</p>
                  <Button onClick={onClose} fullWidth>{t.close}</Button>
              </div>
          </div>
      );
  }

  const handleSave = () => {
    // Only save if it's a new entry
    if (!existingEntry) {
        addEntry(
          stats.top2[0].emotion,
          reflectionText,
          aiInsight || "Weekly reflection saved.",
          'weekly',
          undefined, // monthRef
          undefined, // tags
          stats.generalTopContext ? [stats.generalTopContext] : [], // Save General context tag
          targetDate ? targetDate.toISOString() : undefined // Save at specific date (End of that week)
        );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]">
        
        {/* Progress Bar (Hidden in view mode or fixed) */}
        {!isViewMode && (
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 flex">
                <div className={`h-full bg-teal-500 transition-all duration-500 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`} />
            </div>
        )}
        {isViewMode && (
             <div className="w-full h-1.5 bg-teal-500/20" />
        )}

        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full z-10 transition-colors">
           <X className="w-5 h-5 text-slate-400" />
        </button>

        <div className="p-6 flex-1 overflow-y-auto">
            
            {/* VIEW MODE INDICATOR */}
            {isViewMode && (
                <div className="flex items-center justify-center gap-2 mb-4 bg-teal-50 dark:bg-teal-900/20 py-2 rounded-full">
                    <Check className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span className="text-xs font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wide">Saved Reflection</span>
                </div>
            )}

            {/* STEP 1: BREAKDOWN */}
            {(step === 1 || isViewMode) && (
                <div className="animate-fade-in mb-8">
                    <div className="flex items-center gap-2 mb-1 text-teal-600 dark:text-teal-400">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">{weekLabel}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">{t.title1}</h2>

                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <BarChart2 className="w-4 h-4" /> {t.topEmotions}
                    </h3>
                    
                    <div className="space-y-3 mb-8">
                        {stats.top2.map((item, idx) => {
                            const config = EMOTION_CONFIG[item.emotion];
                            const label = EMOTION_LABELS[settings.language][item.emotion];
                            return (
                                <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center text-xl`}>
                                            {config.emoji}
                                        </div>
                                        <div>
                                            <span className="block font-bold text-slate-700 dark:text-slate-200">{label}</span>
                                            <span className="text-xs text-slate-400">{item.count} entries</span>
                                        </div>
                                    </div>
                                    <span className="text-xl font-black text-slate-800 dark:text-white opacity-80">{item.percentage}%</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* STEP 2: INSIGHTS & CORRELATION */}
            {(step === 2 || isViewMode) && (
                <div className="animate-slide-up mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">{t.title2}</h2>

                    {/* Correlation Card */}
                    <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 p-5 rounded-2xl border border-teal-100 dark:border-teal-800 mb-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 text-teal-600 dark:text-teal-400">
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
                    
                    {/* Visual Breakdown of Top 1 Context */}
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
                            className="w-full h-48 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:ring-2 focus:ring-teal-500/50 outline-none resize-none text-lg"
                            readOnly={isViewMode}
                            autoFocus={!isViewMode}
                        />
                    </div>
                </div>
            )}

        </div>

        <div className="p-6 pt-0">
            {isViewMode ? (
                <Button onClick={onClose} fullWidth variant="primary" className="h-14 bg-teal-600 hover:bg-teal-700">
                    {t.close}
                </Button>
            ) : (
                step < 3 ? (
                    <Button onClick={() => setStep(step + 1)} fullWidth className="h-14">
                        {t.next} <ChevronRight className="w-5 h-5" />
                    </Button>
                ) : (
                    <Button onClick={handleSave} disabled={!reflectionText.trim()} fullWidth variant="primary" className="h-14 bg-teal-600 hover:bg-teal-700">
                        {t.save}
                    </Button>
                )
            )}
        </div>

      </div>
    </div>
  );
};

export default WeeklyReflectionModal;