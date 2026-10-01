
import React, { useState } from 'react';
import { EmotionType, EntryTag } from '../types';
import { EMOTION_CONFIG, TEXTS, STREAK_MESSAGES } from '../constants';
import { useApp } from '../context/AppContext';
import Button from '../components/ui/Button';
import TagSelector from '../components/ui/TagSelector';
import { CheckCircle, ArrowLeft, Sparkles, Star, X, Lock } from 'lucide-react';

interface ResponseProps {
  emotion: EmotionType;
  text: string;
  reply: string;
  onBack: () => void;
}

const Response: React.FC<ResponseProps> = ({ emotion, text, reply, onBack }) => {
  const { settings, addEntry } = useApp();
  const [showBadge, setShowBadge] = useState(false);
  const [selectedTags, setSelectedTags] = useState<EntryTag[]>([]);
  
  const t = TEXTS[settings.language];
  const tBadge = STREAK_MESSAGES[settings.language];
  const config = EMOTION_CONFIG[emotion];
  const Icon = config.icon;

  const handleSave = () => {
    addEntry(emotion, text, reply, 'daily', undefined, selectedTags);
    setShowBadge(true);
  };

  const handleCloseBadge = () => {
    setShowBadge(false);
    onBack();
  };

  const toggleTag = (tag: EntryTag) => {
      if (selectedTags.includes(tag)) {
          setSelectedTags(prev => prev.filter(t => t !== tag));
      } else {
          // Single tag selection for simplicity, or allow multiple
          setSelectedTags([tag]);
      }
  };

  return (
    <>
      <div className="flex flex-col h-full p-6 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 overflow-y-auto">
        
        <div className="flex-1 flex flex-col items-center animate-slide-up">
          
          {/* Header Emotion */}
          <div className={`w-20 h-20 rounded-full ${config.bg} flex items-center justify-center shadow-lg mb-6`}>
            <Icon className={`w-10 h-10 ${config.color}`} />
          </div>

          {/* User Text Bubble */}
          <div className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tr-none shadow-sm border border-slate-100 dark:border-slate-700 mb-6 opacity-80">
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">"{text}"</p>
          </div>

          {/* AI Response Bubble */}
          <div className="w-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1 rounded-2xl shadow-xl shadow-indigo-500/20 mb-8">
              <div className="bg-white dark:bg-slate-900 h-full w-full rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                      <Sparkles className="w-24 h-24 text-indigo-500" />
                  </div>
                  <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" /> EmoLift AI
                  </h3>
                  <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-200 font-medium whitespace-pre-line">
                      {reply}
                  </p>
              </div>
          </div>
          
          {/* Bookmarks / Tags (Pro Feature visually, but let's show it) */}
          <div className="w-full mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.selectTag}</span>
                {!settings.isPro && <Lock className="w-3 h-3 text-slate-400" />}
              </div>
              
              {settings.isPro ? (
                  <TagSelector 
                    selectedTags={selectedTags} 
                    onToggleTag={toggleTag} 
                    language={settings.language}
                  />
              ) : (
                  <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-center">
                      <p className="text-xs text-slate-500 mb-2">Upgrade to Pro to bookmark meaningful moments.</p>
                  </div>
              )}
          </div>

        </div>

        <div className="mt-auto space-y-3">
          <Button onClick={handleSave} fullWidth variant="primary" className="h-14">
            <CheckCircle className="w-5 h-5" /> {t.saveEntry}
          </Button>
          <Button onClick={onBack} fullWidth variant="ghost">
            <ArrowLeft className="w-5 h-5" /> {t.backHome}
          </Button>
        </div>
      </div>

      {/* Streak Badge Modal */}
      {showBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center shadow-2xl w-full max-w-xs relative animate-slide-up">
            <button onClick={handleCloseBadge} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
               <X className="w-5 h-5" />
            </button>
            
            <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
               <Star className="w-12 h-12 text-yellow-500 fill-yellow-500" />
            </div>

            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
              {tBadge.completed}!
            </h2>
            
            <p className="text-indigo-500 font-bold text-lg mb-4">
               {settings.currentStreak} {t.streak} 🔥
            </p>

            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              {tBadge.keepGoing}
            </p>

            <Button onClick={handleCloseBadge} fullWidth variant="primary">
               Awesome
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Response;
