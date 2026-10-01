
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Language } from '../types';
import { TEXTS } from '../constants';
import Button from '../components/ui/Button';
import { ArrowRight, Check, Heart } from 'lucide-react';

const Onboarding: React.FC = () => {
  const { settings, updateSettings, upgradeToPro } = useApp();
  const [step, setStep] = useState(0);

  // Use the currently selected language for texts, or default to EN for step 0 (selection)
  const t = TEXTS[settings.language] || TEXTS[Language.EN];

  const steps = [
    {
      title: "EmoLift",
      desc: t.onboarding1,
      icon: <Heart className="w-16 h-16 text-rose-400" />,
    },
    {
      title: t.onboarding2,
      desc: "AI-powered emotional intelligence.",
      icon: <div className="text-6xl">🤖</div>,
    },
    {
      title: t.onboarding3,
      desc: t.proBenefit,
      icon: <Check className="w-16 h-16 text-green-400" />,
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Finish onboarding
      // Offer trial logic simulated here by just setting onboarded
      updateSettings({ isOnboarded: true });
    }
  };

  const handleLangSelect = (lang: Language) => {
    updateSettings({ language: lang });
  };

  if (step === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-br from-rose-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="mb-12 text-center animate-fade-in">
          <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-primary" fill="currentColor" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-2">EmoLift</h1>
          <p className="text-slate-500 dark:text-slate-400">Daily Mood Support</p>
        </div>

        <div className="w-full space-y-4 animate-slide-up">
          <p className="text-center mb-4 font-medium text-slate-600 dark:text-slate-300">Select Language</p>
          
          <Button onClick={() => { handleLangSelect(Language.EN); handleNext(); }} fullWidth variant="outline" className="justify-start">
            <span className="mr-2 text-xl">🇬🇧</span> English
          </Button>
          
          <Button onClick={() => { handleLangSelect(Language.PT_PT); handleNext(); }} fullWidth variant="outline" className="justify-start">
            <span className="mr-2 text-xl">🇵🇹</span> Português (Portugal)
          </Button>
          
          <Button onClick={() => { handleLangSelect(Language.PT_BR); handleNext(); }} fullWidth variant="outline" className="justify-start">
            <span className="mr-2 text-xl">🇧🇷</span> Português (Brasil)
          </Button>

          <Button onClick={() => { handleLangSelect(Language.ES); handleNext(); }} fullWidth variant="outline" className="justify-start">
            <span className="mr-2 text-xl">🇪🇸</span> Español
          </Button>
        </div>
      </div>
    );
  }

  const currentStep = steps[step - 1];

  return (
    <div className="flex flex-col h-full p-8 bg-white dark:bg-slate-950">
      <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
        <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-full shadow-inner">
          {currentStep.icon}
        </div>
        <h2 className="text-2xl font-bold mb-4">{currentStep.title}</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">{currentStep.desc}</p>
      </div>

      <div className="mt-auto space-y-4">
        {step === 3 && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl mb-4 border border-indigo-100 dark:border-indigo-800">
                <p className="text-sm text-indigo-800 dark:text-indigo-300 font-medium text-center mb-2">
                    Gift: 3 Days Free Pro Trial
                </p>
                <Button onClick={upgradeToPro} variant="secondary" fullWidth className="mb-2">Claim Free Trial</Button>
                <button onClick={() => updateSettings({ isOnboarded: true })} className="w-full text-xs text-slate-400 py-2">Skip for now</button>
            </div>
        )}

        {step < 3 && (
             <Button onClick={handleNext} fullWidth>
             Next <ArrowRight className="w-4 h-4" />
           </Button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
