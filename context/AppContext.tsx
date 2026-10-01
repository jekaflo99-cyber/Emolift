

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppContextType, JournalEntry, UserSettings, Language, EmotionType, EntryType, EntryTag, ContextCategory } from '../types';
import { LIMITS, DATE_LOCALES } from '../constants';

const defaultSettings: UserSettings = {
  isPro: false,
  language: Language.EN,
  theme: 'light',
  isOnboarded: false,
  dailyUsageCount: 0,
  lastUsageDate: new Date().toISOString().split('T')[0],
  installDate: new Date().toISOString(), // Default to now
  currentStreak: 0,
  longestStreak: 0,
  lastStreakDate: null,
  notificationsEnabled: false,
  dailyQuoteDate: '',
  dailyQuote: '', // Legacy field
  lastVentDate: null, 
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from local storage
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('emoLift_settings');
    if (saved) {
        const parsed = JSON.parse(saved);
        
        // Backwards compatibility
        if (!parsed.installDate) {
            parsed.installDate = new Date().toISOString();
        }
        if (parsed.lastVentDate === undefined) {
            parsed.lastVentDate = null;
        }

        // Migration: Convert old 'pt' to 'pt-pt'
        if (parsed.language === 'pt') {
          parsed.language = Language.PT_PT;
        }

        return { ...defaultSettings, ...parsed };
    }
    return defaultSettings;
  });

  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('emoLift_entries');
    return saved ? JSON.parse(saved) : [];
  });

  const [showMonthlyReview, setShowMonthlyReview] = useState(false);
  const [previousMonthStats, setPreviousMonthStats] = useState<{ monthLabel: string; entries: JournalEntry[] } | null>(null);

  // Persist state on change
  useEffect(() => {
    localStorage.setItem('emoLift_settings', JSON.stringify(settings));
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('emoLift_entries', JSON.stringify(entries));
  }, [entries]);

  // Reset daily usage
  const resetDailyUsageIfNeeded = () => {
    const today = new Date().toISOString().split('T')[0];
    const updates: Partial<UserSettings> = {};
    let needsUpdate = false;

    if (settings.lastUsageDate !== today) {
      updates.dailyUsageCount = 0;
      updates.lastUsageDate = today;
      needsUpdate = true;
    }

    // Quote rotation date check
    if (settings.dailyQuoteDate !== today) {
        updates.dailyQuoteDate = today;
        needsUpdate = true;
    }

    if (needsUpdate) {
      updateSettings(updates);
    }
  };

  // Check logic on mount and visibility change
  useEffect(() => {
    resetDailyUsageIfNeeded();
    checkMonthlyReviewEligibility();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        resetDailyUsageIfNeeded();
        checkMonthlyReviewEligibility();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, settings.isPro]);

  const checkMonthlyReviewEligibility = () => {
    if (!settings.isPro) return;

    const today = new Date();
    // Calculate previous month
    const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const year = prevMonthDate.getFullYear();
    const month = prevMonthDate.getMonth(); // 0-11

    const monthRef = `${year}-${(month + 1).toString().padStart(2, '0')}`;
    
    // Check if we already have a monthly review for this specific month
    const hasReview = entries.some(e => e.type === 'monthly' && e.monthRef === monthRef);
    if (hasReview) return;

    // Filter entries belonging to that month
    const monthEntries = entries.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month && e.type !== 'monthly';
    });

    if (monthEntries.length > 0) {
        const locale = DATE_LOCALES[settings.language];
        const monthName = prevMonthDate.toLocaleString(locale, { month: 'long', year: 'numeric' });
        setPreviousMonthStats({ monthLabel: monthName, entries: monthEntries });
        setShowMonthlyReview(true);
    }
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const calculateStreak = (currentStreak: number, lastStreakDate: string | null): number => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (!lastStreakDate) return 1;
    if (lastStreakDate === todayStr) return currentStreak; // Already counted today

    // Check if yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastStreakDate === yesterdayStr) {
      return currentStreak + 1;
    } else {
      // Streak broken
      return 1;
    }
  };

  const addEntry = (
      emotion: EmotionType, 
      userText: string, 
      aiReply: string, 
      type: EntryType = 'daily', 
      monthRef?: string, 
      tags?: EntryTag[],
      contextTags?: ContextCategory[],
      customDate?: string 
    ) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    let newStreak = settings.currentStreak;
    let newLongest = settings.longestStreak;
    let newLastStreakDate = settings.lastStreakDate;
    const updates: Partial<UserSettings> = {};

    // Only update streaks for daily/vent/restart entries (not reflections)
    if (type === 'daily' || type === 'vent' || type === 'restart') {
        // Only calculate streak if it's a NEW entry for TODAY
        // If customDate is in the past, we generally don't update current streak unless we want complex "backfill" logic.
        // For simplicity, streak only updates on live entries.
        if (!customDate) { 
            newStreak = calculateStreak(settings.currentStreak, settings.lastStreakDate);
            newLongest = Math.max(newStreak, settings.longestStreak);
            newLastStreakDate = todayStr;
            
            updates.currentStreak = newStreak;
            updates.longestStreak = newLongest;
            updates.lastStreakDate = newLastStreakDate;
        }
    }

    if (type === 'vent') {
        updates.lastVentDate = new Date().toISOString();
    }

    const newEntry: JournalEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
      date: customDate || new Date().toISOString(), // Use custom date if provided
      emotion,
      userText,
      aiReply,
      type,
      monthRef,
      tags,
      contextTags
    };
    
    setEntries((prev) => {
        const updated = [newEntry, ...prev];
        // Ensure sorted order if we insert historical data
        return updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
    updateSettings(updates);
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => {
      return prev.filter((e) => String(e.id) !== String(id));
    });
  };

  const incrementUsage = () => {
    updateSettings({ dailyUsageCount: settings.dailyUsageCount + 1 });
  };

  const remainingSupports = (settings.isPro ? LIMITS.PRO_DAILY : LIMITS.FREE_DAILY) - settings.dailyUsageCount;

  const upgradeToPro = () => {
    updateSettings({ isPro: true });
    // trigger check next tick
    setTimeout(() => checkMonthlyReviewEligibility(), 500);
    alert('Welcome to EmoLift Pro!');
  };

  const restoreSubscription = () => {
    setTimeout(() => {
      updateSettings({ isPro: true });
      alert('Subscription restored.');
    }, 1000);
  };

  // DEBUG / DEV TOOLS
  const debugInsertEntries = (newEntries: JournalEntry[]) => {
    if (!newEntries || newEntries.length === 0) return;

    // Use functional update to ensure we have latest entries for state update
    setEntries(prev => {
        const combined = [...newEntries, ...prev];
        return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    // Re-calculate streak based on combined data
    try {
        const allEntries = [...newEntries, ...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const validTypes = ['daily', 'vent', 'restart'];
        const uniqueDays = new Set<string>();
        
        allEntries.forEach(e => {
            if (validTypes.includes(e.type || 'daily')) {
                const dayStr = e.date.split('T')[0];
                uniqueDays.add(dayStr);
            }
        });

        // Calculate Current Streak logic...
        let calcStreak = 0;
        const nowStr = new Date().toISOString().split('T')[0];
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let checkDate = new Date();
        let currentCheckStr = checkDate.toISOString().split('T')[0];

        if (uniqueDays.has(nowStr)) {
            calcStreak = 1;
        } else if (uniqueDays.has(yesterdayStr)) {
            calcStreak = 1;
            checkDate = yesterday;
            currentCheckStr = yesterdayStr;
        }

        if (calcStreak > 0) {
            // Walk backwards
            while (true) {
                checkDate.setDate(checkDate.getDate() - 1);
                const prevStr = checkDate.toISOString().split('T')[0];
                if (uniqueDays.has(prevStr)) {
                    calcStreak++;
                } else {
                    break;
                }
            }
        }

        updateSettings({
            currentStreak: calcStreak,
            longestStreak: Math.max(calcStreak, settings.longestStreak),
            lastStreakDate: uniqueDays.has(nowStr) ? nowStr : (uniqueDays.has(yesterdayStr) ? yesterdayStr : settings.lastStreakDate)
        });
    } catch (e) {
        console.error("Failed to recalculate streak during debug insert", e);
    }
  };

  const debugClearAllEntries = () => {
      setEntries([]);
      updateSettings({
          currentStreak: 0,
          longestStreak: 0,
          lastStreakDate: null,
          dailyUsageCount: 0
      });
      alert("All entries deleted.");
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        entries,
        addEntry,
        deleteEntry,
        updateSettings,
        resetDailyUsageIfNeeded,
        incrementUsage,
        remainingSupports,
        upgradeToPro,
        restoreSubscription,
        showMonthlyReview,
        setShowMonthlyReview,
        previousMonthStats,
        debugInsertEntries,
        debugClearAllEntries
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};