
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TEXTS, EMOTION_CONFIG, DATE_LOCALES, EMOTION_LABELS, CONTEXT_CONFIG, TAG_CONFIG } from '../constants';
import Button from '../components/ui/Button';
import { Lock, ChevronLeft, ChevronRight, Calendar as CalendarIcon, BarChart3, GripVertical, BookOpen, X, Clock, AlignLeft, FileText, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { EmotionType, JournalEntry, Tab } from '../types';
import WeeklyReflectionModal from '../components/WeeklyReflectionModal';
import MonthlyReflectionModal from '../components/MonthlyReflectionModal';

interface StatisticsProps {
  onShowPaywall: () => void;
  onNavigate?: (tab: Tab) => void;
}

type TimeRange = 'daily' | 'weekly' | 'monthly';

// --- DATE HELPERS (Native JS to avoid heavy libs) ---
const getMonday = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  date.setDate(diff);
  date.setHours(0,0,0,0);
  return date;
};

const getEndOfWeek = (d: Date) => {
    const monday = getMonday(d);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23,59,59,999);
    return sunday;
};

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

const Statistics: React.FC<StatisticsProps> = ({ onShowPaywall, onNavigate }) => {
  const { settings, entries } = useApp();
  
  // Controls the "View Mode" of the Chart
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly');
  
  // Controls the "Active Selection" (The specific day user clicked, or reference for the week)
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Controls the "Calendar View" (Which month is visible in the grid)
  const [viewDate, setViewDate] = useState(new Date());

  // Bottom Sheet State
  const [showEntriesSheet, setShowEntriesSheet] = useState(false);
  
  // Weekly Reflection State
  const [showWeeklyReflection, setShowWeeklyReflection] = useState(false);
  
  // Monthly Reflection State (Local to Statistics for history viewing)
  const [showMonthlyReflection, setShowMonthlyReflection] = useState(false);

  // Weekly Reflection Persistence Logic
  const [existingWeeklyEntry, setExistingWeeklyEntry] = useState<JournalEntry | undefined>(undefined);

  const t = TEXTS[settings.language];
  const locale = DATE_LOCALES[settings.language];

  // --- Paywall / Trial Logic ---
  const installTime = new Date(settings.installDate).getTime();
  const currentTime = new Date().getTime();
  const daysSinceInstall = (currentTime - installTime) / (1000 * 60 * 60 * 24);
  const isTrialActive = daysSinceInstall <= 7;
  const isAccessGranted = settings.isPro || isTrialActive;

  // --- FILTER ENTRIES BASED ON SELECTION ---
  const { filteredEntries, dateLabel, dateRange } = useMemo(() => {
    let filtered: typeof entries = [];
    let label = "";
    let rangeStart: Date | null = null;
    let rangeEnd: Date | null = null;

    if (timeRange === 'daily') {
        // Filter exactly for selectedDate
        filtered = entries.filter(e => isSameDay(new Date(e.date), selectedDate));
        label = selectedDate.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
        rangeStart = selectedDate;
        rangeEnd = selectedDate;
    } 
    else if (timeRange === 'weekly') {
        // Filter for the week containing selectedDate (Mon-Sun)
        const start = getMonday(selectedDate);
        const end = getEndOfWeek(selectedDate);
        
        filtered = entries.filter(e => {
            const d = new Date(e.date);
            return d >= start && d <= end;
        });

        const startStr = start.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
        const endStr = end.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
        label = `${startStr} — ${endStr}`;
        rangeStart = start;
        rangeEnd = end;
    } 
    else {
        // Monthly: Filter for the MONTH visible in the calendar (viewDate)
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        
        filtered = entries.filter(e => {
            const d = new Date(e.date);
            return d.getFullYear() === year && d.getMonth() === month;
        });

        label = viewDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
        rangeStart = new Date(year, month, 1);
        rangeEnd = new Date(year, month + 1, 0);
    }

    // Sort by date desc (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { filteredEntries: filtered, dateLabel: label, dateRange: { start: rangeStart, end: rangeEnd } };
  }, [entries, timeRange, selectedDate, viewDate, locale]);

  // --- CHECK FOR EXISTING WEEKLY REFLECTIONS ---
  useEffect(() => {
      if (timeRange === 'weekly' && dateRange.start && dateRange.end) {
          // Check if there is a WEEKLY entry created roughly within this week period or covering this period
          const found = entries.find(e => {
             const d = new Date(e.date);
             return e.type === 'weekly' && d >= dateRange.start! && d <= dateRange.end!;
          });
          setExistingWeeklyEntry(found);
      } else {
          setExistingWeeklyEntry(undefined);
      }
  }, [timeRange, dateRange, entries]);

  // --- DETECT EXISTING MONTHLY REFLECTION (Instant Calculation) ---
  const existingMonthlyEntry = useMemo(() => {
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      const monthRef = `${year}-${(month + 1).toString().padStart(2, '0')}`;
      
      return entries.find(e => e.type === 'monthly' && e.monthRef === monthRef);
  }, [entries, viewDate]);


  // --- CHART DATA GENERATION ---
  const chartData = useMemo(() => {
    // Only count emotions from daily, vent, or restart entries (exclude reflections themselves)
    const validEntries = filteredEntries.filter(e => e.type !== 'monthly' && e.type !== 'weekly');

    const counts = validEntries.reduce((acc, e) => {
        acc[e.emotion] = (acc[e.emotion] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.keys(counts).map(key => {
        const config = EMOTION_CONFIG[key as EmotionType];
        // Ensure valid colors
        let hex = '#94a3b8';
        if (config.bg.includes('yellow')) hex = '#fbbf24';
        else if (config.bg.includes('blue')) hex = '#60a5fa';
        else if (config.bg.includes('orange')) hex = '#fb923c';
        else if (config.bg.includes('purple')) hex = '#c084fc';
        else if (config.bg.includes('red')) hex = '#f87171';
        else if (config.bg.includes('teal')) hex = '#2dd4bf';
        else if (config.bg.includes('slate')) hex = '#94a3b8';

        return {
            name: key,
            value: counts[key],
            emoji: config.emoji,
            hex: hex
        }
    }).sort((a,b) => b.value - a.value);
  }, [filteredEntries]);

  // --- CALENDAR GRID GENERATION (MONDAY START) ---
  const calendarWeeks = useMemo(() => {
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      
      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);
      
      const daysInMonth = lastDayOfMonth.getDate();
      
      // Calculate padding for Monday start
      let startDayOfWeek = firstDayOfMonth.getDay() - 1;
      if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday becomes 6

      const weeks = [];
      let currentWeek: (any | null)[] = [];

      // Start padding
      for(let i = 0; i < startDayOfWeek; i++) {
          currentWeek.push(null);
      }

      // Fill days
      for(let i = 1; i <= daysInMonth; i++) {
          const currentDate = new Date(year, month, i);
          const currentDateStr = currentDate.toISOString().split('T')[0];

          // Find dominant emotion for this day (exclude reflection entries)
          const dayEntries = entries.filter(e => 
              e.date.startsWith(currentDateStr) && 
              e.type !== 'monthly' && 
              e.type !== 'weekly'
          );
          
          let dominantEmotion: EmotionType | null = null;
          let solidColorClass = '';

          if (dayEntries.length > 0) {
              const counts: Record<string, number> = {};
              dayEntries.forEach(e => counts[e.emotion] = (counts[e.emotion] || 0) + 1);
              dominantEmotion = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b) as EmotionType;

              const config = EMOTION_CONFIG[dominantEmotion];
              // Map config to solid colors for calendar bubbles
              if (config.bg.includes('yellow')) solidColorClass = 'bg-yellow-400 text-white shadow-yellow-200';
              else if (config.bg.includes('blue')) solidColorClass = 'bg-blue-400 text-white shadow-blue-200';
              else if (config.bg.includes('orange')) solidColorClass = 'bg-orange-400 text-white shadow-orange-200';
              else if (config.bg.includes('purple')) solidColorClass = 'bg-purple-400 text-white shadow-purple-200';
              else if (config.bg.includes('red')) solidColorClass = 'bg-red-400 text-white shadow-red-200';
              else if (config.bg.includes('teal')) solidColorClass = 'bg-teal-400 text-white shadow-teal-200';
              else solidColorClass = 'bg-slate-400 text-white';
          }

          currentWeek.push({
              day: i,
              date: currentDate,
              emotion: dominantEmotion,
              colorClass: solidColorClass,
              isToday: isSameDay(new Date(), currentDate)
          });

          if (currentWeek.length === 7) {
              weeks.push(currentWeek);
              currentWeek = [];
          }
      }

      if (currentWeek.length > 0) {
          while(currentWeek.length < 7) {
              currentWeek.push(null);
          }
          weeks.push(currentWeek);
      }

      return weeks;
  }, [entries, viewDate]);

  // --- INTERACTION HANDLERS ---

  const changeMonth = (delta: number) => {
      const newDate = new Date(viewDate);
      newDate.setMonth(newDate.getMonth() + delta);
      setViewDate(newDate);
  };

  const handleDayClick = (date: Date) => {
      setSelectedDate(date);
      setTimeRange('daily');
  };

  const handleWeekSelect = (weekRow: any[]) => {
      const validDay = weekRow.find(d => d !== null);
      if (validDay) {
          setSelectedDate(validDay.date);
          setTimeRange('weekly');
      }
  };

  const triggerWeeklyReflection = () => {
      if (timeRange !== 'weekly') {
          setTimeRange('weekly');
      }
      setShowWeeklyReflection(true);
  };

  const triggerMonthlyReflection = () => {
      setShowMonthlyReflection(true);
  };

  // Prepare entries for monthly reflection modal based on VIEW DATE
  const currentMonthEntries = useMemo(() => {
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      // Filter for raw entries (not reflections) for this month
      return entries.filter(e => {
          const d = new Date(e.date);
          return d.getFullYear() === year && d.getMonth() === month && e.type !== 'monthly' && e.type !== 'weekly';
      });
  }, [entries, viewDate]);

  // Calculate End of Month date for target
  const endOfMonthDate = useMemo(() => {
      return new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
  }, [viewDate]);


  // --- BUTTON STATE LOGIC ---
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const isFutureMonth = viewYear > currentYear || (viewYear === currentYear && viewMonth > currentMonth);
  const isCurrentMonth = viewYear === currentYear && viewMonth === currentMonth;
  
  // Last day check
  const lastDayOfThisMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const isTodayLastDay = today.getDate() === lastDayOfThisMonth;

  const hasData = currentMonthEntries.length > 0;
  const hasExisting = !!existingMonthlyEntry;

  // Review is allowed if:
  // 1. It already exists (view mode)
  // 2. It is a past month AND has entries (create mode retroactive)
  // 3. It is the current month AND it is the last day AND has entries
  const canReview = hasExisting || 
                    (!isCurrentMonth && !isFutureMonth && hasData) || 
                    (isCurrentMonth && isTodayLastDay && hasData);
  
  const isPending = isCurrentMonth && !canReview;
  const isEmptyPast = !isCurrentMonth && !isFutureMonth && !hasData && !hasExisting;

  const isDisabled = !canReview;


  // --- LOCKED VIEW ---
  if (!isAccessGranted) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-950">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner animate-pulse">
          <Lock className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Pro Analytics</h2>
        <p className="text-slate-500 mb-8">Unlock your emotional timeline and patterns.</p>
        <Button onClick={onShowPaywall} className="w-full max-w-xs">
          Upgrade to Pro
        </Button>
      </div>
    );
  }

  // --- RENDER ---
  return (
    <>
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-y-auto no-scrollbar pb-24">
      
      {/* 1. MOOD MIX (CHART) */}
      <div className="p-4 pt-6">
        <div className="flex items-center justify-between mb-2">
             <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                Mood Mix
             </h2>
             
             {/* Read-Only Mode Indicator */}
             <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-0.5">
                {(['daily', 'weekly', 'monthly'] as TimeRange[]).map((range) => (
                    <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`
                            px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all
                            ${timeRange === range 
                                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}
                        `}
                    >
                        {range === 'daily' ? 'Day' : range === 'weekly' ? 'Week' : 'Month'}
                    </button>
                ))}
             </div>
        </div>
        
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 pl-1">
            {dateLabel}
        </p>

        {/* Chart Container */}
        <div className="h-48 w-full flex items-center gap-4">
            <div className="h-full aspect-square relative shrink-0">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={65}
                                paddingAngle={4}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.hex} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-slate-700">
                        <div className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800 border-dashed" />
                    </div>
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-slate-800 dark:text-white">
                        {chartData.reduce((acc, cur) => acc + cur.value, 0)}
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Entries</span>
                </div>
            </div>

            {/* Chart Legend */}
            <div className="flex-1 h-40 overflow-y-auto no-scrollbar pr-2 space-y-2">
                {chartData.length > 0 ? chartData.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <span className="text-base">{d.emoji}</span>
                            <span className="font-medium text-slate-600 dark:text-slate-300 capitalize">
                                {EMOTION_LABELS[settings.language][d.name as EmotionType]}
                            </span>
                        </div>
                        <span className="font-bold text-slate-400">{d.value}</span>
                    </div>
                )) : (
                    <div className="h-full flex flex-col justify-center items-center text-center opacity-50">
                        <p className="text-xs text-slate-400">No entries for this period.</p>
                        <p className="text-xs text-slate-300 mt-1">Select a day below.</p>
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="h-px bg-slate-100 dark:bg-slate-800 w-full mx-auto max-w-[90%] mb-4" />

      {/* 2. CALENDAR SECTION */}
      <div className="flex flex-col p-4">
         <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-500" />
                Mood Calendar
            </h2>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 p-1">
                <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                    <ChevronLeft className="w-4 h-4 text-slate-500" />
                </button>
                <span className="text-xs font-bold w-24 text-center tabular-nums text-slate-700 dark:text-slate-200">
                    {viewDate.toLocaleString(locale, { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
            </div>
         </div>

         {/* Calendar Grid Container */}
         <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 pb-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col mb-4">
            
            {/* Header Row: Spacer + Mon-Sun */}
            <div className="flex mb-2">
                <div className="w-6 shrink-0" /> {/* Spacer for Week Handle */}
                <div className="grid grid-cols-7 flex-1 gap-1">
                    {['M','T','W','T','F','S','S'].map((d, i) => (
                        <div key={i} className="text-center text-[10px] font-bold text-slate-300 uppercase">
                            {d}
                        </div>
                    ))}
                </div>
            </div>

            {/* Weeks Rows */}
            <div className="flex flex-col gap-2 mb-6">
                {calendarWeeks.map((week, wIndex) => {
                    const weekFirstValid = week.find(d => d);
                    const isWeekActive = timeRange === 'weekly' && weekFirstValid && isSameDay(getMonday(selectedDate), getMonday(weekFirstValid.date));

                    return (
                        <div key={wIndex} className={`flex items-center rounded-xl transition-colors duration-300 ${isWeekActive ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                            
                            {/* Week Selector Handle */}
                            <button 
                                onClick={() => handleWeekSelect(week)}
                                className={`
                                    w-6 h-8 flex items-center justify-center shrink-0 group
                                    ${isWeekActive ? 'text-indigo-500' : 'text-slate-200 hover:text-indigo-300'}
                                `}
                            >
                                <GripVertical className="w-4 h-4" />
                            </button>

                            {/* Days Grid */}
                            <div className="grid grid-cols-7 flex-1 gap-1">
                                {week.map((dayObj, dIndex) => {
                                    if (!dayObj) return <div key={`empty-${wIndex}-${dIndex}`} className="aspect-square" />;
                                    
                                    const isSelectedDay = timeRange === 'daily' && isSameDay(selectedDate, dayObj.date);

                                    return (
                                        <button 
                                            key={`day-${dayObj.day}`} 
                                            onClick={() => handleDayClick(dayObj.date)}
                                            className={`
                                                aspect-square rounded-full flex items-center justify-center transition-all relative
                                                ${isSelectedDay ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 z-10 scale-110' : 'hover:scale-105'}
                                                ${dayObj.colorClass ? dayObj.colorClass + ' shadow-sm' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}
                                            `}
                                        >
                                            <span className="text-[10px] font-bold relative z-10">
                                                {dayObj.day}
                                            </span>
                                            
                                            {/* Today Indicator */}
                                            {dayObj.isToday && (
                                                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* LEGEND - Now Inside the Card */}
            <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
                <div className="grid grid-cols-7 gap-1">
                    {Object.keys(EMOTION_CONFIG).map(emo => {
                        const config = EMOTION_CONFIG[emo as EmotionType];
                        let colorClass = 'bg-slate-400';
                        if (config.bg.includes('yellow')) colorClass = 'bg-yellow-400';
                        else if (config.bg.includes('blue')) colorClass = 'bg-blue-400';
                        else if (config.bg.includes('orange')) colorClass = 'bg-orange-400';
                        else if (config.bg.includes('purple')) colorClass = 'bg-purple-400';
                        else if (config.bg.includes('red')) colorClass = 'bg-red-400';
                        else if (config.bg.includes('teal')) colorClass = 'bg-teal-400';

                        return (
                            <div key={emo} className="flex flex-col items-center justify-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${colorClass}`} />
                                <span className="text-[7px] text-slate-400 uppercase tracking-tighter truncate w-full text-center">
                                    {EMOTION_LABELS[settings.language][emo as EmotionType].slice(0, 4)}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

         </div>
         
         {/* Action Buttons Group */}
         <div className="space-y-3">
             {/* View Entries Button */}
             {filteredEntries.length > 0 && (
                <button
                    onClick={() => setShowEntriesSheet(true)}
                    className="w-full py-3.5 bg-slate-800 dark:bg-slate-700 rounded-xl text-white font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 animate-slide-up"
                >
                    <BookOpen className="w-4 h-4" />
                    {t.viewEntries} ({filteredEntries.length})
                </button>
             )}
             
             {/* Reflection Buttons Row */}
             <div className="grid grid-cols-2 gap-3 animate-slide-up">
                 <button
                    onClick={triggerWeeklyReflection}
                    className={`py-4 border rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all shadow-sm
                        ${existingWeeklyEntry 
                            ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800/50' 
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80'}
                    `}
                 >
                     <div className="relative">
                         <FileText className={`w-5 h-5 ${existingWeeklyEntry ? 'text-teal-600' : 'text-indigo-500'}`} />
                         {existingWeeklyEntry && <div className="absolute -top-1 -right-1 w-2 h-2 bg-teal-500 rounded-full" />}
                     </div>
                     <span className={`text-xs font-bold ${existingWeeklyEntry ? 'text-teal-700 dark:text-teal-400' : 'text-slate-600 dark:text-slate-300'}`}>
                         {t.weeklyReflection}
                     </span>
                     {existingWeeklyEntry && <span className="text-[9px] text-teal-600/70 font-medium">Review saved</span>}
                 </button>

                 <button
                    onClick={triggerMonthlyReflection}
                    disabled={isDisabled}
                    className={`py-4 border rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all shadow-sm relative overflow-hidden
                        ${hasExisting 
                            ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/50' 
                            : isDisabled
                                ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80'}
                        ${(isPending || isEmptyPast) ? 'opacity-50' : ''}
                    `}
                 >
                     {isFutureMonth ? (
                         <div className="flex flex-col items-center gap-1 text-slate-300 dark:text-slate-600">
                             <Lock className="w-5 h-5" />
                             <span className="text-[10px] font-bold uppercase">Locked</span>
                         </div>
                     ) : (
                        <>
                             <div className="relative">
                                <Sparkles className={`w-5 h-5 ${hasExisting ? 'text-purple-600' : isDisabled ? 'text-slate-400' : 'text-purple-500'}`} />
                                {hasExisting && <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full" />}
                             </div>
                             <span className={`text-xs font-bold ${hasExisting ? 'text-purple-700 dark:text-purple-400' : isDisabled ? 'text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}>
                                 {t.monthlyReflection}
                             </span>
                             {hasExisting && <span className="text-[9px] text-purple-600/70 font-medium">Review saved</span>}
                             
                             {/* Show "Pending" style text if current month but not ready */}
                             {isPending && (
                                 <span className="text-[9px] text-slate-400 font-medium text-center leading-tight mt-1">
                                     Available End of Month
                                 </span>
                             )}
                        </>
                     )}
                 </button>
             </div>
         </div>
      </div>
    </div>

    {/* BOTTOM SHEET FOR ENTRIES */}
    {showEntriesSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
                onClick={() => setShowEntriesSheet(false)}
            />
            
            {/* Sheet */}
            <div className="bg-slate-100 dark:bg-slate-900 w-full h-[75%] rounded-t-3xl shadow-2xl relative animate-slide-up flex flex-col z-50 overflow-hidden">
                
                {/* Drag Handle */}
                <div className="flex items-center justify-center pt-3 pb-1 shrink-0" onClick={() => setShowEntriesSheet(false)}>
                    <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
                </div>

                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                             <CalendarIcon className="w-5 h-5 text-indigo-500" />
                             {timeRange === 'daily' ? 'Daily Entries' : timeRange === 'weekly' ? 'Weekly Entries' : 'Monthly Entries'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{dateLabel}</p>
                    </div>
                    <button 
                        onClick={() => setShowEntriesSheet(false)}
                        className="p-2 bg-slate-200 dark:bg-slate-800 rounded-full hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-4">
                    {filteredEntries.map((entry) => {
                         const config = EMOTION_CONFIG[entry.emotion];
                         const label = EMOTION_LABELS[settings.language][entry.emotion];
                         const d = new Date(entry.date);
                         const timeStr = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
                         const dayStr = d.toLocaleDateString(locale, { day: 'numeric', month: 'short' });

                         // Handle Reflection Entries visually distinct
                         if (entry.type === 'weekly' || entry.type === 'monthly') {
                             return (
                                 <div key={entry.id} className="bg-gradient-to-r from-slate-100 to-white dark:from-slate-800 dark:to-slate-800/50 p-4 rounded-2xl shadow-sm border border-indigo-100 dark:border-slate-700 flex gap-4 opacity-80">
                                     <div className="shrink-0 w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500">
                                         {entry.type === 'weekly' ? <FileText className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                                     </div>
                                     <div className="flex-1">
                                         <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block mb-1">
                                             {entry.type === 'weekly' ? 'Weekly Reflection' : 'Monthly Reflection'}
                                         </span>
                                         <p className="text-slate-700 dark:text-slate-300 text-sm italic">
                                             "{entry.userText.slice(0, 50)}..."
                                         </p>
                                     </div>
                                 </div>
                             );
                         }

                         return (
                             <div key={entry.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex gap-4">
                                 <div className={`shrink-0 w-12 h-12 rounded-2xl ${config.bg} flex items-center justify-center text-2xl shadow-sm`}>
                                     {config.emoji}
                                 </div>
                                 
                                 <div className="flex-1 min-w-0">
                                     <div className="flex items-center justify-between mb-1">
                                         <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color} bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-700`}>
                                             {label}
                                         </span>
                                         <div className="flex items-center gap-1 text-slate-400 text-[10px] font-medium">
                                             {timeRange !== 'daily' && <span>{dayStr} •</span>}
                                             <Clock className="w-3 h-3" />
                                             {timeStr}
                                         </div>
                                     </div>
                                     
                                     <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed mb-2 line-clamp-3">
                                         {entry.userText}
                                     </p>

                                     {(entry.contextTags?.length || 0) > 0 && (
                                         <div className="flex flex-wrap gap-1">
                                             {entry.contextTags?.map(ctx => {
                                                 const cConfig = CONTEXT_CONFIG[ctx];
                                                 return (
                                                     <span key={ctx} className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold">
                                                         {cConfig?.label[settings.language]}
                                                     </span>
                                                 )
                                             })}
                                         </div>
                                     )}
                                 </div>
                             </div>
                         )
                    })}
                </div>

                {/* Floating "View in Journal" Button */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center p-4 pointer-events-none">
                    <button
                        onClick={() => {
                            setShowEntriesSheet(false);
                            if (onNavigate) onNavigate('journal');
                        }}
                        className="pointer-events-auto flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-600/40 active:scale-95 transition-all animate-pulse hover:animate-none"
                    >
                        <span className="font-bold text-sm">{t.viewInJournal}</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

            </div>
        </div>
    )}

    {/* WEEKLY REFLECTION MODAL */}
    {showWeeklyReflection && (
        <WeeklyReflectionModal 
            entries={filteredEntries.filter(e => e.type !== 'weekly' && e.type !== 'monthly')} // Pass RAW daily entries for stats
            weekLabel={dateLabel}
            onClose={() => setShowWeeklyReflection(false)}
            existingEntry={existingWeeklyEntry}
            targetDate={dateRange.end || undefined} // Pass end of week date for accurate saving
        />
    )}
    
    {/* MONTHLY REFLECTION MODAL (Local for history view) */}
    {showMonthlyReflection && (
        <MonthlyReflectionModal 
            existingEntry={existingMonthlyEntry}
            targetDate={endOfMonthDate} 
            entries={currentMonthEntries}
            onClose={() => setShowMonthlyReflection(false)}
        />
    )}
    </>
  );
};

export default Statistics;
