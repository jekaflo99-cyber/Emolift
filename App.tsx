
import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import BottomNav from './components/ui/BottomNav';
import Onboarding from './screens/Onboarding';
import Home from './screens/Home';
import Journal from './screens/Journal';
import Statistics from './screens/Statistics';
import Settings from './screens/Settings';
import Response from './screens/Response';
import Paywall from './screens/Paywall';
import MonthlyReflectionModal from './components/MonthlyReflectionModal';
import { Tab, EmotionType } from './types';

const MainContent: React.FC = () => {
  const { settings, showMonthlyReview, setShowMonthlyReview } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showPaywall, setShowPaywall] = useState(false);
  
  // Response State (when coming from Home)
  const [responseState, setResponseState] = useState<{
    show: boolean;
    emotion: EmotionType | null;
    text: string;
    reply: string;
  }>({ show: false, emotion: null, text: '', reply: '' });

  if (!settings.isOnboarded) {
    return <Onboarding />;
  }

  const handleHomeResult = (emotion: EmotionType, text: string, reply: string) => {
    setResponseState({
      show: true,
      emotion,
      text,
      reply,
    });
  };

  const closeResponse = () => {
    setResponseState({ show: false, emotion: null, text: '', reply: '' });
    setActiveTab('journal'); // Redirect to journal after saving
  };

  const renderScreen = () => {
    if (responseState.show && responseState.emotion) {
      return (
        <Response 
          emotion={responseState.emotion}
          text={responseState.text}
          reply={responseState.reply}
          onBack={closeResponse}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return <Home onResult={handleHomeResult} onShowPaywall={() => setShowPaywall(true)} />;
      case 'journal':
        return <Journal onShowPaywall={() => setShowPaywall(true)} />;
      case 'stats':
        return <Statistics onShowPaywall={() => setShowPaywall(true)} onNavigate={(tab) => setActiveTab(tab)} />;
      case 'settings':
        return <Settings onShowPaywall={() => setShowPaywall(true)} />;
      default:
        return <Home onResult={handleHomeResult} onShowPaywall={() => setShowPaywall(true)} />;
    }
  };

  return (
    <Layout>
      <main className="flex-1 relative h-full">
        {renderScreen()}
      </main>
      
      {!responseState.show && (
        <BottomNav 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          showStats={settings.isPro} 
        />
      )}

      {showPaywall && <Paywall onClose={() => setShowPaywall(false)} />}
      {showMonthlyReview && <MonthlyReflectionModal onClose={() => setShowMonthlyReview(false)} />}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default App;
