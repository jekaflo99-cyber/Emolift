import React from 'react';
import { useApp } from '../context/AppContext';
import { TEXTS } from '../constants';
import Button from '../components/ui/Button';
import { X, Check, Crown, Star } from 'lucide-react';

interface PaywallProps {
  onClose: () => void;
}

const Paywall: React.FC<PaywallProps> = ({ onClose }) => {
  const { settings, upgradeToPro, restoreSubscription } = useApp();
  const t = TEXTS[settings.language];

  const handlePurchase = () => {
    upgradeToPro();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-0 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative animate-slide-up max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/10 dark:bg-white/10 rounded-full z-10">
          <X className="w-5 h-5 text-slate-800 dark:text-white" />
        </button>

        {/* Header Image/Gradient */}
        <div className="h-48 bg-gradient-to-br from-indigo-600 to-pink-500 relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
          <Crown className="w-20 h-20 text-white drop-shadow-lg animate-bounce" />
          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white dark:from-slate-900 to-transparent"></div>
        </div>

        <div className="p-6 pb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Unlock EmoLift Pro</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Take control of your emotional wellbeing today.</p>

          {/* Features List */}
          <div className="space-y-3 mb-8 text-left">
            {t.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="font-medium text-slate-700 dark:text-slate-200">{feature}</span>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="mb-6">
             <span className="text-3xl font-bold text-slate-800 dark:text-white">€2.99</span>
             <span className="text-slate-500"> / month</span>
          </div>

          <Button onClick={handlePurchase} fullWidth variant="primary" className="h-14 text-lg shadow-indigo-500/50 mb-3">
            Upgrade Now
          </Button>

          <button onClick={() => { restoreSubscription(); onClose(); }} className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline">
            {t.restore}
          </button>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 leading-relaxed">
            Subscription automatically renews unless auto-renew is turned off at least 24-hours before the end of the current period. Account will be charged for renewal within 24-hours prior to the end of the current period.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paywall;