
import React from 'react';
import { useApp } from '../context/AppContext';
import { TEXTS } from '../constants';
import { Language } from '../types';
import Button from '../components/ui/Button';
import { Moon, Sun, Globe, Crown, Shield, Info, Bell, Database, Trash2, Download, FileText } from 'lucide-react';
import { generateMockEntries } from '../services/seeder';
import reportMarkdown from '../RELATORIO_EMOLIFT.md?raw';

interface SettingsProps {
    onShowPaywall: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onShowPaywall }) => {
  const { settings, updateSettings, restoreSubscription, debugInsertEntries, debugClearAllEntries } = useApp();
  const t = TEXTS[settings.language];

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' });
  };

  const cycleLang = () => {
    const langs = [Language.EN, Language.PT_PT, Language.PT_BR, Language.ES];
    const currentIndex = langs.indexOf(settings.language);
    const nextIndex = (currentIndex + 1) % langs.length;
    updateSettings({ language: langs[nextIndex] });
  };

  const getLangLabel = (lang: Language) => {
      switch(lang) {
          case Language.EN: return 'English';
          case Language.PT_PT: return 'Português (PT)';
          case Language.PT_BR: return 'Português (BR)';
          case Language.ES: return 'Español';
          default: return 'English';
      }
  };

  const toggleNotifications = () => {
     if (!settings.notificationsEnabled && 'Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                updateSettings({ notificationsEnabled: true });
            }
        });
     } else {
        updateSettings({ notificationsEnabled: !settings.notificationsEnabled });
     }
  };

  const handleGenerateData = () => {
      try {
          // 1. Gerar dados
          const mocks = generateMockEntries(30);
          
          // 2. Inserir no contexto
          debugInsertEntries(mocks);
          
          // 3. Ativar PRO automaticamente para conseguir ver o histórico todo (Dev helper)
          if (!settings.isPro) {
              updateSettings({ isPro: true });
          }

          alert(`✅ Sucesso! Foram gerados ${mocks.length} registos. O modo PRO foi ativado para conseguires ver o histórico completo.`);
      } catch (error) {
          console.error("Erro ao gerar dados:", error);
          alert("❌ Ocorreu um erro ao gerar os dados. Verifica a consola.");
      }
  };

  const handleClearData = () => {
      if (window.confirm("⚠️ Tens a certeza? Isto vai apagar TODO o diário e reiniciar os dias seguidos.")) {
          debugClearAllEntries();
      }
  };

  const handleDownloadReport = () => {
    try {
      const blob = new Blob([reportMarkdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'RELATORIO_EMOLIFT.md';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Erro ao descarregar relatório:', e);
      alert('Não foi possível descarregar o ficheiro diretamente.');
    }
  };

  return (
    <div className="h-full flex flex-col p-6 pb-24 overflow-y-auto no-scrollbar">
      <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">{t.settings}</h1>

      {/* Pro Banner */}
      {!settings.isPro && (
        <div onClick={onShowPaywall} className="bg-gradient-to-r from-rose-400 to-orange-400 rounded-2xl p-4 text-white mb-8 shadow-lg shadow-rose-400/30 cursor-pointer active:scale-98 transition-transform">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-6 h-6 fill-white" />
            <h3 className="font-bold text-lg">Upgrade to Pro</h3>
          </div>
          <p className="text-sm opacity-90 mb-3">Unlock all features and remove limits.</p>
          <div className="bg-white/20 rounded-lg px-3 py-1 inline-block text-sm font-semibold">
            Try Free
          </div>
        </div>
      )}

      {/* Status if Pro */}
      {settings.isPro && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-8 flex items-center gap-3">
              <div className="bg-green-500 rounded-full p-1">
                  <Crown className="w-4 h-4 text-white fill-white" />
              </div>
              <div>
                  <h3 className="font-bold text-green-800 dark:text-green-300">EmoLift Pro Active</h3>
                  <p className="text-xs text-green-600 dark:text-green-400">Thank you for your support.</p>
              </div>
          </div>
      )}

      <div className="space-y-6">
        {/* Appearance */}
        <section>
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Preferences</h4>
          <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
            <button onClick={toggleTheme} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <div className="flex items-center gap-3">
                {settings.theme === 'light' ? <Sun className="w-5 h-5 text-orange-500" /> : <Moon className="w-5 h-5 text-indigo-400" />}
                <span className="font-medium">{t.darkMode}</span>
              </div>
              <div className={`w-11 h-6 bg-slate-200 dark:bg-slate-600 rounded-full relative transition-colors ${settings.theme === 'dark' ? 'bg-primary' : ''}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm transition-transform ${settings.theme === 'dark' ? 'translate-x-5' : ''}`} />
              </div>
            </button>
            
            <div className="h-px bg-slate-100 dark:bg-slate-700" />
            
            <button onClick={toggleNotifications} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-rose-500" />
                <span className="font-medium">{t.notifications}</span>
              </div>
              <div className={`w-11 h-6 bg-slate-200 dark:bg-slate-600 rounded-full relative transition-colors ${settings.notificationsEnabled ? 'bg-green-500' : ''}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm transition-transform ${settings.notificationsEnabled ? 'translate-x-5' : ''}`} />
              </div>
            </button>

            <div className="h-px bg-slate-100 dark:bg-slate-700" />
            
            <button onClick={cycleLang} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-blue-500" />
                <span className="font-medium">{t.selectLang}</span>
              </div>
              <span className="text-sm text-slate-500 font-medium">
                {getLangLabel(settings.language)}
              </span>
            </button>
          </div>
        </section>

        {/* Developer Zone */}
        <section>
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Developer Zone (Mock Data)</h4>
          <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 p-4 space-y-3">
             <Button onClick={handleGenerateData} fullWidth variant="secondary" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30 border-0">
                <Database className="w-4 h-4" /> Gerar 30 Dias + Ativar Pro
             </Button>
             
             <Button onClick={handleClearData} fullWidth variant="ghost" className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600">
                <Trash2 className="w-4 h-4" /> Apagar Tudo (Reset DB)
             </Button>
          </div>
        </section>

        {/* Documentation / Report */}
        <section>
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Relatório & Documentação</h4>
          <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 p-4 space-y-3">
             <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400 mt-0.5">
                   <FileText className="w-5 h-5" />
                </div>
                <div>
                   <p className="font-bold text-sm text-slate-800 dark:text-slate-100">RELATORIO_EMOLIFT.md</p>
                   <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Relatório completo com arquitetura, funcionalidades e objetivos da aplicação.
                   </p>
                </div>
             </div>
             <Button onClick={handleDownloadReport} fullWidth variant="primary" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30">
                <Download className="w-4 h-4 mr-2" /> Descarregar Ficheiro .MD
             </Button>
          </div>
        </section>

        {/* About */}
        <section>
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">App Info</h4>
          <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
             <div className="p-4 flex items-center gap-3 text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">
                <Shield className="w-5 h-5" />
                <span>{t.privacy}</span>
             </div>
             <div className="p-4 flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <Info className="w-5 h-5" />
                <span>Version 1.3.1 (Dev)</span>
             </div>
          </div>
        </section>

        {!settings.isPro && (
             <Button onClick={restoreSubscription} variant="ghost" fullWidth className="mt-4 text-sm">
                {t.restore}
             </Button>
        )}
      </div>
    </div>
  );
};

export default Settings;
