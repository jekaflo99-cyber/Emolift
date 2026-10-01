
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TEXTS, EMOTION_CONFIG, LIMITS, TAG_CONFIG, DATE_LOCALES, EMOTION_LABELS, CONTEXT_CONFIG } from '../constants';
import { Lock, Calendar, Sparkles, Trash2, Loader2, AlertTriangle, X, MoreHorizontal, FileText, Bookmark } from 'lucide-react';
import Button from '../components/ui/Button';

interface JournalProps {
    onShowPaywall: () => void;
}

const Journal: React.FC<JournalProps> = ({ onShowPaywall }) => {
  const { settings, entries, deleteEntry } = useApp();
  
  // State for managing the deletion modal
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const t = TEXTS[settings.language];
  const locale = DATE_LOCALES[settings.language];

  const displayEntries = settings.isPro 
    ? entries 
    : entries.slice(0, LIMITS.FREE_HISTORY);

  const isLimited = !settings.isPro && entries.length > LIMITS.FREE_HISTORY;

  // Triggered when clicking the trash icon
  const requestDelete = (id: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setItemToDelete(id);
  };

  // Triggered when confirming in the modal
  const confirmDelete = async () => {
      if (!itemToDelete) return;
      
      try {
          setIsDeleting(true);
          // Artificial delay for smooth UX
          await new Promise(resolve => setTimeout(resolve, 500));
          deleteEntry(itemToDelete);
          setItemToDelete(null);
      } catch (error) {
          console.error('Error deleting entry:', error);
      } finally {
          setIsDeleting(false);
      }
  };

  const cancelDelete = () => {
      if (!isDeleting) {
          setItemToDelete(null);
      }
  };

  if (entries.length === 0) {
      return (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
              <Calendar className="w-16 h-16 mb-4 opacity-50" />
              <p>{t.noEntries}</p>
          </div>
      )
  }

  // Helper strings for the modal
  const isPortuguese = settings.language === 'pt-pt' || settings.language === 'pt-br';
  const isSpanish = settings.language === 'es';
  
  let modalTexts = {
      title: 'Delete Entry?',
      message: 'Are you sure you want to delete this entry? This action cannot be undone.',
      cancel: 'Cancel',
      delete: 'Delete'
  };

  if (isPortuguese) {
      modalTexts = {
          title: 'Apagar Registo?',
          message: 'Tem a certeza que quer apagar este registo? Esta ação não pode ser desfeita.',
          cancel: 'Cancelar',
          delete: 'Apagar'
      };
  } else if (isSpanish) {
      modalTexts = {
          title: '¿Borrar entrada?',
          message: '¿Estás seguro de que quieres borrar esta entrada? Esta acción no se puede deshacer.',
          cancel: 'Cancelar',
          delete: 'Borrar'
      };
  }

  return (
    <>
    <div className="h-full flex flex-col px-4 py-6 pb-24 overflow-y-auto no-scrollbar bg-slate-50 dark:bg-slate-950">
      <header className="flex items-center justify-between mb-8 px-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t.journal}</h1>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            Timeline
        </span>
      </header>
      
      <div className="space-y-0 relative"> 
        {/* Global Timeline Line Background - Adjusted to sit behind avatars */}
        {displayEntries.length > 0 && (
            <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />
        )}

        {displayEntries.map((entry, index) => {
          const config = EMOTION_CONFIG[entry.emotion];
          const Icon = config.icon;
          const dateObj = new Date(entry.date);
          
          // Split date and time for the layout
          const dayStr = dateObj.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
          const timeStr = dateObj.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

          // Get translated emotion label
          const emotionLabel = EMOTION_LABELS[settings.language][entry.emotion];

          // --- WEEKLY REFLECTION CARD ---
          if (entry.type === 'weekly') {
              return (
                <div key={entry.id} className="relative pl-16 mb-8 group z-10">
                  {/* Timeline Node */}
                  <div className="absolute left-0 top-0 flex flex-col items-center w-14">
                      {/* Using Amber/Orange gradient for the node to signify "Golden Checkpoint" */}
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 border-4 border-slate-50 dark:border-slate-950 z-10">
                          <Bookmark className="w-6 h-6 text-white" fill="currentColor" />
                      </div>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-2 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">Weekly</span>
                  </div>

                  {/* Card - New Warm Design */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 border border-amber-200 dark:border-amber-900/30 p-5 rounded-3xl shadow-xl shadow-orange-900/5 text-slate-800 dark:text-slate-100 relative overflow-hidden transform transition-transform hover:scale-[1.01]">
                      <button 
                        type="button"
                        onClick={(e) => requestDelete(entry.id, e)}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 rounded-full transition-colors z-20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Decorative Background Element */}
                      <div className="absolute -bottom-6 -right-6 opacity-10 pointer-events-none">
                          <Bookmark className="w-32 h-32 text-amber-500" fill="currentColor" />
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">{dayStr} • Weekly Insight</span>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-5">
                        <div className={`p-2.5 rounded-2xl bg-white dark:bg-slate-700 shadow-sm border border-amber-100 dark:border-slate-600`}>
                            <Icon className={`w-6 h-6 text-amber-500`} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white tracking-tight leading-none mb-0.5">{emotionLabel} Week</h3>
                            <span className="text-xs text-slate-500 font-medium">Dominant Emotion</span>
                        </div>
                      </div>

                      {/* SERIF FONT FOR REFLECTION TEXT */}
                      <div className="relative pl-4 border-l-2 border-amber-300 dark:border-amber-700">
                        <p className="font-serif italic text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                            "{entry.userText}"
                        </p>
                      </div>
                      
                      {/* AI Insight Pill */}
                      {entry.aiReply && (
                         <div className="mt-4 pt-4 border-t border-amber-100 dark:border-slate-700/50 flex gap-2">
                             <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                             <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                {entry.aiReply}
                             </p>
                         </div>
                      )}
                  </div>
              </div>
              );
          }

          // --- MONTHLY REFLECTION CARD ---
          if (entry.type === 'monthly') {
            return (
              <div key={entry.id} className="relative pl-16 mb-8 group z-10">
                  {/* Timeline Node for Monthly */}
                  <div className="absolute left-0 top-0 flex flex-col items-center w-14">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 border-4 border-slate-50 dark:border-slate-950 z-10">
                          <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-[10px] font-bold text-indigo-500 mt-2 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">Review</span>
                  </div>

                  {/* Monthly Card */}
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-5 rounded-3xl shadow-xl shadow-indigo-900/10 text-white relative overflow-hidden transform transition-transform hover:scale-[1.01]">
                      <button 
                        type="button"
                        onClick={(e) => requestDelete(entry.id, e)}
                        className="absolute top-4 right-4 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="absolute -bottom-10 -right-10 p-4 opacity-10 pointer-events-none">
                          <Sparkles className="w-40 h-40 text-white" />
                      </div>

                      <div className="flex items-center gap-2 mb-2 opacity-80">
                          <span className="text-xs font-bold uppercase tracking-wider">{dayStr} • {t.monthlyReflection}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-2xl bg-white/20 backdrop-blur-md shadow-inner`}>
                            <Icon className={`w-6 h-6 text-white`} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl tracking-tight">{emotionLabel} Month</h3>
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                        <p className="text-sm leading-relaxed text-white/90 font-medium">"{entry.userText}"</p>
                      </div>
                  </div>
              </div>
            );
          }

          // Regular / Vent / Restart Entry
          // Extract colors for the "Pill"
          const pillBg = config.bg; 
          const pillText = config.color;

          return (
            <div key={entry.id} className="relative pl-16 mb-8 z-10 group">
              
              {/* Timeline Avatar Column */}
              <div className="absolute left-0 top-0 flex flex-col items-center w-14">
                 {/* The 3D Emoji Bubble */}
                 <div className={`
                    w-14 h-14 rounded-2xl ${config.bg} 
                    flex items-center justify-center 
                    shadow-sm hover:shadow-md transition-all duration-300
                    border-4 border-slate-50 dark:border-slate-950 z-10
                 `}>
                    <span className="text-3xl filter drop-shadow-sm transform hover:scale-110 transition-transform cursor-default">
                        {config.emoji}
                    </span>
                 </div>
                 {/* Time Label under avatar */}
                 <span className="text-[10px] font-semibold text-slate-400 mt-1.5 tabular-nums">
                    {timeStr}
                 </span>
              </div>

              {/* The "Premium" Floating Card */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-800 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300">
                  
                  {/* Card Header */}
                  <div className="flex flex-col gap-2 mb-3">
                      <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                              {/* Emotion Pill */}
                              <span className={`
                                px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide 
                                ${pillBg} ${pillText} flex items-center gap-1.5
                              `}>
                                <div className={`w-1.5 h-1.5 rounded-full bg-current opacity-50`} />
                                {emotionLabel}
                              </span>
                              
                              {/* Date Label */}
                              <span className="text-xs font-medium text-slate-400">
                                  {dayStr}
                              </span>
                          </div>

                          {/* Action Menu / Delete */}
                          <div className="flex gap-1">
                            {entry.tags && entry.tags.length > 0 && (
                                <div className="flex gap-1 mr-2">
                                    {entry.tags.map(tag => {
                                        const tagConfig = TAG_CONFIG[tag];
                                        if(!tagConfig.icon) return null;
                                        const TagIcon = tagConfig.icon;
                                        return (
                                            <div key={tag} className={`p-1.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400`} title={tagConfig.label[settings.language]}>
                                                <TagIcon className="w-3 h-3" />
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                            <button 
                                onClick={(e) => requestDelete(entry.id, e)}
                                className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                      </div>

                      {/* Context Tags Row (If available) */}
                      {entry.contextTags && entry.contextTags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                              {entry.contextTags.map(ctx => {
                                  const ctxConfig = CONTEXT_CONFIG[ctx];
                                  if(!ctxConfig) return null;
                                  return (
                                      <span key={ctx} className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                                          {ctxConfig.label[settings.language]}
                                      </span>
                                  )
                              })}
                          </div>
                      )}
                  </div>

                  {/* Content Body */}
                  <div className="space-y-4">
                      <p className="text-[15px] text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                          {entry.userText}
                      </p>

                      {/* AI Insight Box - Ultra Subtle */}
                      <div className="bg-slate-50/80 dark:bg-slate-800/50 p-4 rounded-2xl flex gap-3 items-start">
                          <div className="bg-white dark:bg-slate-700 p-1.5 rounded-full shadow-sm shrink-0 mt-0.5">
                             <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                          </div>
                          <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">EmoLift Insight</span>
                              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                  {entry.aiReply}
                              </p>
                          </div>
                      </div>
                  </div>

              </div>
            </div>
          );
        })}

        {isLimited && (
          <div className="pl-16 mt-8">
            <button 
                onClick={onShowPaywall}
                className="w-full p-6 rounded-[20px] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group"
            >
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <div className="text-center">
                    <span className="font-medium text-sm block text-slate-600 dark:text-slate-300">View History</span>
                    <span className="text-xs text-primary font-bold uppercase mt-1 block">{t.tryPro}</span>
                </div>
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Custom Confirmation Modal */}
    {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-3xl p-6 shadow-2xl animate-slide-up relative">
                <button 
                    onClick={cancelDelete}
                    disabled={isDeleting}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-rose-500" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 dark:text-white text-center mb-2">
                    {modalTexts.title}
                </h3>
                
                <p className="text-slate-500 dark:text-slate-400 text-center text-sm mb-6 leading-relaxed">
                    {modalTexts.message}
                </p>
                
                <div className="flex flex-col gap-3">
                    <Button 
                        onClick={confirmDelete} 
                        disabled={isDeleting}
                        fullWidth 
                        className="bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30"
                    >
                        {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : modalTexts.delete}
                    </Button>
                    <Button 
                        onClick={cancelDelete} 
                        disabled={isDeleting}
                        variant="ghost" 
                        fullWidth
                    >
                        {modalTexts.cancel}
                    </Button>
                </div>
            </div>
        </div>
    )}
    </>
  );
};

export default Journal;
