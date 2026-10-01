
import { EmotionType, Language, EntryTag, ContextCategory } from './types';
import { Smile, Frown, Zap, CloudRain, Flame, Coffee, Meh, Star, Feather, Lightbulb, Anchor, ShieldCheck, Briefcase, Heart, Activity, Wallet, User, CircleDashed } from 'lucide-react';

export const EMOTION_CONFIG: Record<EmotionType, { color: string; icon: any; bg: string; emoji: string }> = {
  [EmotionType.HAPPY]: { color: 'text-yellow-500', icon: Smile, bg: 'bg-yellow-100', emoji: '🤩' },
  [EmotionType.SAD]: { color: 'text-blue-500', icon: Frown, bg: 'bg-blue-100', emoji: '😢' },
  [EmotionType.STRESSED]: { color: 'text-orange-500', icon: Zap, bg: 'bg-orange-100', emoji: '🤯' },
  [EmotionType.ANXIOUS]: { color: 'text-purple-500', icon: CloudRain, bg: 'bg-purple-100', emoji: '😰' },
  [EmotionType.ANGRY]: { color: 'text-red-500', icon: Flame, bg: 'bg-red-100', emoji: '😡' },
  [EmotionType.TIRED]: { color: 'text-slate-500', icon: Coffee, bg: 'bg-slate-100', emoji: '😴' },
  [EmotionType.NEUTRAL]: { color: 'text-teal-500', icon: Meh, bg: 'bg-teal-100', emoji: '😐' },
};

export const CONTEXT_CONFIG: Record<ContextCategory, { label: Record<Language, string>; icon: any }> = {
  work: {
    label: { [Language.EN]: 'Work/Studies', [Language.PT_PT]: 'Trabalho/Estudos', [Language.PT_BR]: 'Trabalho/Estudos', [Language.ES]: 'Trabajo/Estudios' },
    icon: Briefcase
  },
  relationships: {
    label: { [Language.EN]: 'Relationships', [Language.PT_PT]: 'Relações', [Language.PT_BR]: 'Relacionamentos', [Language.ES]: 'Relaciones' },
    icon: Heart
  },
  health: {
    label: { [Language.EN]: 'Health', [Language.PT_PT]: 'Saúde', [Language.PT_BR]: 'Saúde', [Language.ES]: 'Salud' },
    icon: Activity
  },
  finance: {
    label: { [Language.EN]: 'Finance', [Language.PT_PT]: 'Finanças', [Language.PT_BR]: 'Finanças', [Language.ES]: 'Finanzas' },
    icon: Wallet
  },
  self: {
    label: { [Language.EN]: 'Self', [Language.PT_PT]: 'Eu Próprio', [Language.PT_BR]: 'Eu Mesmo', [Language.ES]: 'Yo Mismo' },
    icon: User
  },
  other: {
    label: { [Language.EN]: 'Other', [Language.PT_PT]: 'Outro', [Language.PT_BR]: 'Outro', [Language.ES]: 'Otro' },
    icon: CircleDashed
  }
};

export const DATE_LOCALES = {
  [Language.EN]: 'en-US',
  [Language.PT_PT]: 'pt-PT',
  [Language.PT_BR]: 'pt-BR',
  [Language.ES]: 'es-ES',
};

export const EMOTION_LABELS = {
  [Language.EN]: {
    [EmotionType.HAPPY]: "Happy",
    [EmotionType.SAD]: "Sad",
    [EmotionType.STRESSED]: "Stressed",
    [EmotionType.ANXIOUS]: "Anxious",
    [EmotionType.ANGRY]: "Angry",
    [EmotionType.TIRED]: "Tired",
    [EmotionType.NEUTRAL]: "Neutral",
  },
  [Language.PT_PT]: {
    [EmotionType.HAPPY]: "Feliz",
    [EmotionType.SAD]: "Triste",
    [EmotionType.STRESSED]: "Stressado",
    [EmotionType.ANXIOUS]: "Ansioso",
    [EmotionType.ANGRY]: "Zangado",
    [EmotionType.TIRED]: "Cansado",
    [EmotionType.NEUTRAL]: "Normal",
  },
  [Language.PT_BR]: {
    [EmotionType.HAPPY]: "Feliz",
    [EmotionType.SAD]: "Triste",
    [EmotionType.STRESSED]: "Estressado",
    [EmotionType.ANXIOUS]: "Ansioso",
    [EmotionType.ANGRY]: "Com raiva",
    [EmotionType.TIRED]: "Cansado",
    [EmotionType.NEUTRAL]: "Neutro",
  },
  [Language.ES]: {
    [EmotionType.HAPPY]: "Feliz",
    [EmotionType.SAD]: "Triste",
    [EmotionType.STRESSED]: "Estresado",
    [EmotionType.ANXIOUS]: "Ansioso",
    [EmotionType.ANGRY]: "Enojado",
    [EmotionType.TIRED]: "Cansado",
    [EmotionType.NEUTRAL]: "Neutral",
  },
};

export const TAG_CONFIG: Record<EntryTag, { label: Record<Language, string>; icon: any; color: string }> = {
    clarity: { 
      label: { en: 'Clarity', 'pt-pt': 'Clareza', 'pt-br': 'Clareza', es: 'Claridad' }, 
      icon: Lightbulb, color: 'text-yellow-500 bg-yellow-50' 
    },
    victory: { 
      label: { en: 'Victory', 'pt-pt': 'Vitória', 'pt-br': 'Vitória', es: 'Victoria' }, 
      icon: Star, color: 'text-orange-500 bg-orange-50' 
    },
    deep_reflection: { 
      label: { en: 'Deep Reflection', 'pt-pt': 'Reflexão Profunda', 'pt-br': 'Reflexão Profunda', es: 'Reflexión Profunda' }, 
      icon: Feather, color: 'text-purple-500 bg-purple-50' 
    },
    important_vent: { 
      label: { en: 'Important Vent', 'pt-pt': 'Desabafo', 'pt-br': 'Desabafo', es: 'Desahogo' }, 
      icon: ShieldCheck, color: 'text-blue-500 bg-blue-50' 
    },
    calm_moment: { 
      label: { en: 'Calm Moment', 'pt-pt': 'Momento Calmo', 'pt-br': 'Momento de Calma', es: 'Momento de Calma' }, 
      icon: Anchor, color: 'text-teal-500 bg-teal-50' 
    },
    none: { 
      label: { en: '', 'pt-pt': '', 'pt-br': '', es: '' }, 
      icon: null, color: '' 
    },
};

export const LIMITS = {
  FREE_DAILY: 2,
  PRO_DAILY: 10,
  FREE_HISTORY: 5,
};

export const MICRO_ACTIONS = {
  [Language.EN]: {
    [EmotionType.HAPPY]: "Share this energy with someone you love.",
    [EmotionType.SAD]: "Take 2 minutes to breathe deeply 5 times.",
    [EmotionType.STRESSED]: "Walk for 1 minute. Even just 1.",
    [EmotionType.ANXIOUS]: "Name 3 things you can see right now.",
    [EmotionType.ANGRY]: "Drink a glass of water slowly.",
    [EmotionType.TIRED]: "Turn off notifications for 10 minutes.",
    [EmotionType.NEUTRAL]: "Stretch your arms up high.",
  },
  [Language.PT_PT]: {
    [EmotionType.HAPPY]: "Partilha essa energia com alguém que gostas.",
    [EmotionType.SAD]: "Tira 2 minutos e respira fundo 5 vezes.",
    [EmotionType.STRESSED]: "Anda 1 minuto. Mesmo só 1.",
    [EmotionType.ANXIOUS]: "Nomeia 3 coisas que consegues ver agora.",
    [EmotionType.ANGRY]: "Bebe um copo de água devagar.",
    [EmotionType.TIRED]: "Desliga notificações por 10 minutos.",
    [EmotionType.NEUTRAL]: "Espreguiça os braços bem alto.",
  },
  [Language.PT_BR]: {
    [EmotionType.HAPPY]: "Compartilhe essa energia com alguém que você gosta.",
    [EmotionType.SAD]: "Tire 2 minutos e respira fundo 5 vezes.",
    [EmotionType.STRESSED]: "Caminhe 1 minuto. Mesmo só 1.",
    [EmotionType.ANXIOUS]: "Nomeie 3 coisas que você consegue ver agora.",
    [EmotionType.ANGRY]: "Beba um copo de água devagar.",
    [EmotionType.TIRED]: "Desligue as notificações por 10 minutos.",
    [EmotionType.NEUTRAL]: "Espreguice os braços bem alto.",
  },
  [Language.ES]: {
    [EmotionType.HAPPY]: "Comparte esta energía con alguien a quien quieras.",
    [EmotionType.SAD]: "Tómate 2 minutos para respirar profundamente 5 veces.",
    [EmotionType.STRESSED]: "Camina 1 minuto. Aunque sea solo 1.",
    [EmotionType.ANXIOUS]: "Nombra 3 cosas que puedas ver ahora mismo.",
    [EmotionType.ANGRY]: "Bebe un vaso de agua lentamente.",
    [EmotionType.TIRED]: "Apaga las notificaciones durante 10 minutos.",
    [EmotionType.NEUTRAL]: "Estira los brazos hacia arriba.",
  }
};

// Based on previous day's emotion
export const INSPIRATIONAL_QUOTES: Record<Language, Record<EmotionType, string[]>> = {
  [Language.EN]: {
    [EmotionType.HAPPY]: [
      "Keep shining. The world needs your light.",
      "Happiness is not a destination, it's a way of life.",
      "Savor this moment. You earned it."
    ],
    [EmotionType.SAD]: [
      "Stars can't shine without darkness.",
      "This too shall pass. You are stronger than you know.",
      "Be gentle with yourself. You're doing the best you can."
    ],
    [EmotionType.STRESSED]: [
      "Calm is a superpower.",
      "One step at a time. You don't have to solve everything today.",
      "Breathe. It's just a bad day, not a bad life."
    ],
    [EmotionType.ANXIOUS]: [
      "You are safe. This feeling is temporary.",
      "Focus on your feet. Feel the ground. You are here.",
      "Don't believe everything you think. Breathe."
    ],
    [EmotionType.ANGRY]: [
      "Patience is the calm acceptance that things can happen in a different order than the one you have in mind.",
      "Your peace is more important than driving your point home.",
      "Take a deep breath. Respond, don't react."
    ],
    [EmotionType.TIRED]: [
      "Rest is not idleness. It's the key to better work.",
      "Listen to your body. It's okay to do nothing.",
      "You can't pour from an empty cup. Take care of yourself first."
    ],
    [EmotionType.NEUTRAL]: [
      "Make today count.",
      "Every day is a fresh start.",
      "Small steps every day add up to big results."
    ]
  },
  [Language.PT_PT]: {
    [EmotionType.HAPPY]: [
      "Continua a brilhar. O mundo precisa da tua luz.",
      "A felicidade não é um destino, é uma maneira de viajar.",
      "Saboreia este momento. Tu mereces."
    ],
    [EmotionType.SAD]: [
      "As estrelas não brilham sem escuridão.",
      "Isto também vai passar. És mais forte do que imaginas.",
      "Sê gentil contigo. Estás a fazer o melhor que podes."
    ],
    [EmotionType.STRESSED]: [
      "A calma é um superpoder.",
      "Um passo de cada vez. Não tens de resolver tudo hoje.",
      "Respira. É só um dia mau, não uma vida má."
    ],
    [EmotionType.ANXIOUS]: [
      "Estás seguro. Este sentimento é temporário.",
      "Foca-te nos teus pés. Sente o chão. Estás aqui.",
      "Não acredites em tudo o que pensas. Respira."
    ],
    [EmotionType.ANGRY]: [
      "A paciência é a chave que resolve muitos problemas.",
      "A tua paz é mais importante do que teres razão.",
      "Respira fundo. Responde, não reajas."
    ],
    [EmotionType.TIRED]: [
      "Descansar não é perder tempo. É recarregar.",
      "Ouve o teu corpo. Não faz mal parar um pouco.",
      "Não podes dar o que não tens. Cuida de ti primeiro."
    ],
    [EmotionType.NEUTRAL]: [
      "Faz o dia de hoje valer a pena.",
      "Cada dia é um novo começo.",
      "Pequenos passos todos os dias levam a grandes destinos."
    ]
  },
  [Language.PT_BR]: {
    [EmotionType.HAPPY]: [
      "Continue brilhando. O mundo precisa da sua luz.",
      "A felicidade não é um destino, é uma forma de viajar.",
      "Aproveite este momento. Você merece."
    ],
    [EmotionType.SAD]: [
      "As estrelas não brilham sem escuridão.",
      "Isso também vai passar. Você é mais forte do que imagina.",
      "Seja gentil com você. Você está fazendo o melhor que pode."
    ],
    [EmotionType.STRESSED]: [
      "A calma é um superpoder.",
      "Um passo de cada vez. Você não precisa resolver tudo hoje.",
      "Respire. É só um dia ruim, não uma vida ruim."
    ],
    [EmotionType.ANXIOUS]: [
      "Você está seguro. Esse sentimento é temporário.",
      "Foque nos seus pés. Sinta o chão. Você está aqui.",
      "Não acredite em tudo que você pensa. Respire."
    ],
    [EmotionType.ANGRY]: [
      "A paciência é a chave que resolve muitos problemas.",
      "Sua paz é mais importante do que ter razão.",
      "Respire fundo. Responda, não reaja."
    ],
    [EmotionType.TIRED]: [
      "Descansar não é perda de tempo. É recarregar.",
      "Escute seu corpo. Tudo bem parar um pouco.",
      "Você não pode dar o que não tem. Cuide de você primeiro."
    ],
    [EmotionType.NEUTRAL]: [
      "Faça o dia de hoje valer a pena.",
      "Cada dia é um novo começo.",
      "Pequenos passos todos os dias levam a grandes destinos."
    ]
  },
  [Language.ES]: {
    [EmotionType.HAPPY]: [
      "Sigue brillando. El mundo necesita tu luz.",
      "La felicidad no es un destino, es una forma de viajar.",
      "Saborea este momento. Te lo mereces."
    ],
    [EmotionType.SAD]: [
      "Las estrellas no pueden brillar sin oscuridad.",
      "Esto también pasará. Eres más fuerte de lo que crees.",
      "Sé amable contigo mismo. Haces lo mejor que puedes."
    ],
    [EmotionType.STRESSED]: [
      "La calma es un superpoder.",
      "Un paso a la vez. No tienes que resolverlo todo hoy.",
      "Respira. Es solo un mal día, no una mala vida."
    ],
    [EmotionType.ANXIOUS]: [
      "Estás a salvo. Este sentimiento es temporal.",
      "Concéntrate en tus pies. Siente el suelo. Estás aquí.",
      "No creas todo lo que piensas. Respira."
    ],
    [EmotionType.ANGRY]: [
      "La paciencia es la aceptación tranquila de que las cosas pueden suceder en un orden diferente.",
      "Tu paz es más importante que tener la razón.",
      "Respira hondo. Responde, no reacciones."
    ],
    [EmotionType.TIRED]: [
      "Descansar no es ociosidad. Es la clave para trabajar mejor.",
      "Escucha a tu cuerpo. Está bien no hacer nada.",
      "No puedes servir de una copa vacía. Cuídate primero."
    ],
    [EmotionType.NEUTRAL]: [
      "Haz que hoy cuente.",
      "Cada día es un nuevo comienzo.",
      "Pequeños pasos cada día suman grandes resultados."
    ]
  }
};

export const STREAK_MESSAGES = {
  [Language.EN]: {
    completed: "Day Completed",
    keepGoing: "Consistency builds strength.",
    courage: "You showed courage today.",
    progress: "Small steps, big progress."
  },
  [Language.PT_PT]: {
    completed: "Dia Completado",
    keepGoing: "Consistência cria força.",
    courage: "Hoje mostraste coragem.",
    progress: "Passos pequenos, progresso grande."
  },
  [Language.PT_BR]: {
    completed: "Dia Concluído",
    keepGoing: "Consistência cria força.",
    courage: "Hoje você mostrou coragem.",
    progress: "Pequenos passos, grande progresso."
  },
  [Language.ES]: {
    completed: "Día Completado",
    keepGoing: "La constancia crea fuerza.",
    courage: "Hoy mostraste valentía.",
    progress: "Pequeños pasos, gran progreso."
  }
};

export const MONTHLY_REVIEW_TEXTS = {
  [Language.EN]: {
    title1: "Your Month in Emotions",
    title2: "Advanced Analysis",
    title3: "Reflect on your month",
    summaryIntro: "This is your emotional summary for",
    dominantIntro: "Your dominant emotion was:",
    frequency: "It appeared",
    times: "times",
    percentage: "It represented",
    ofEntries: "of your emotional entries.",
    aiInsight: "Analyzing the connection between your emotions and life contexts...",
    prompt: "Why do you think this emotion shaped your month? Write freely.",
    save: "Save Reflection",
    next: "Next",
    close: "Close",
    analyzing: "Connecting the dots...",
    mostFrequentContext: "Most frequent context overall"
  },
  [Language.PT_PT]: {
    title1: "O teu mês em Emoções",
    title2: "Análise Avançada",
    title3: "Reflete sobre o teu mês",
    summaryIntro: "Este é o resumo emocional de",
    dominantIntro: "A tua emoção dominante foi:",
    frequency: "Apareceu",
    times: "vezes",
    percentage: "Representou",
    ofEntries: "dos teus registos emocionais.",
    aiInsight: "A analisar a ligação entre as tuas emoções e os contextos de vida...",
    prompt: "Porque achas que esta emoção marcou o teu mês? Escreve à vontade.",
    save: "Guardar Reflexão",
    next: "Seguinte",
    close: "Fechar",
    analyzing: "A ligar os pontos...",
    mostFrequentContext: "Contexto mais frequente no geral"
  },
  [Language.PT_BR]: {
    title1: "O seu mês em Emoções",
    title2: "Análise Avançada",
    title3: "Reflita sobre o seu mês",
    summaryIntro: "Este é o resumo emocional de",
    dominantIntro: "Sua emoção dominante foi:",
    frequency: "Apareceu",
    times: "vezes",
    percentage: "Representou",
    ofEntries: "dos seus registros emocionais.",
    aiInsight: "Analisando a conexão entre suas emoções e contextos de vida...",
    prompt: "Por que você acha que esta emoção marcou o seu mês? Escreva à vontade.",
    save: "Salvar Reflexão",
    next: "Seguinte",
    close: "Fechar",
    analyzing: "Ligando os pontos...",
    mostFrequentContext: "Contexto mais frequente no geral"
  },
  [Language.ES]: {
    title1: "Tu mes en Emociones",
    title2: "Análisis Avanzado",
    title3: "Reflexiona sobre tu mes",
    summaryIntro: "Este es tu resumen emocional de",
    dominantIntro: "Tu emoción dominante fue:",
    frequency: "Apareció",
    times: "veces",
    percentage: "Representó el",
    ofEntries: "de tus registros emocionales.",
    aiInsight: "Analizando la conexión entre tus emociones y contextos de vida...",
    prompt: "¿Por qué crees que esta emoción marcó tu mes? Escribe libremente.",
    save: "Guardar Reflexión",
    next: "Siguiente",
    close: "Cerrar",
    analyzing: "Uniendo los puntos...",
    mostFrequentContext: "Contexto más frecuente en general"
  }
};

export const WEEKLY_SUMMARY_TEXTS = {
    [Language.EN]: {
        title1: "Weekly Breakdown",
        title2: "Advanced Insights",
        title3: "Weekly Reflection",
        topEmotions: "Top 2 Emotions",
        contextCorrelation: "Context Connection",
        analyzing: "Analyzing correlation...",
        prompt: "Considering these insights, how was your week really?",
        save: "Save Weekly Reflection",
        next: "Next",
        close: "Close",
        noData: "Not enough data to analyze this week.",
        mostFrequentContext: "Most frequent context overall"
    },
    [Language.PT_PT]: {
        title1: "Resumo Semanal",
        title2: "Insights Avançados",
        title3: "Reflexão Semanal",
        topEmotions: "Top 2 Emoções",
        contextCorrelation: "Conexão de Contexto",
        analyzing: "A analisar correlação...",
        prompt: "Considerando estes dados, como foi realmente a tua semana?",
        save: "Guardar Reflexão Semanal",
        next: "Seguinte",
        close: "Fechar",
        noData: "Dados insuficientes para analisar esta semana.",
        mostFrequentContext: "Contexto mais frequente no geral"
    },
    [Language.PT_BR]: {
        title1: "Resumo Semanal",
        title2: "Insights Avançados",
        title3: "Reflexão Semanal",
        topEmotions: "Top 2 Emoções",
        contextCorrelation: "Conexão de Contexto",
        analyzing: "Analisando correlação...",
        prompt: "Considerando esses dados, como foi realmente a sua semana?",
        save: "Salvar Reflexão Semanal",
        next: "Seguinte",
        close: "Fechar",
        noData: "Dados insuficientes para analisar esta semana.",
        mostFrequentContext: "Contexto mais frequente no geral"
    },
    [Language.ES]: {
        title1: "Resumen Semanal",
        title2: "Insights Avanzados",
        title3: "Reflexión Semanal",
        topEmotions: "Top 2 Emociones",
        contextCorrelation: "Conexión de Contexto",
        analyzing: "Analizando correlación...",
        prompt: "Considerando estos datos, ¿cómo fue realmente tu semana?",
        save: "Guardar Reflexión Semanal",
        next: "Siguiente",
        close: "Cerrar",
        noData: "No hay suficientes datos para analizar esta semana.",
        mostFrequentContext: "Contexto más frecuente en general"
    }
};

export const TEXTS = {
  [Language.EN]: {
    howAreYou: "How are you feeling today?",
    placeholder: "Write what's on your mind...",
    getSupport: "Get Support",
    getSupportSubtitle: "Write and get AI response",
    saveEntry: "Save Entry",
    backHome: "Back to Home",
    dailyLimitReached: "You've reached your daily limit.",
    upgradeToPro: "Upgrade to Pro",
    restore: "Restore Subscription",
    journal: "Journal",
    stats: "Statistics",
    settings: "Settings",
    home: "Home",
    proBenefit: "Unlock unlimited support & history",
    statsLocked: "Statistics are available for Pro users.",
    noEntries: "No journal entries yet.",
    tryPro: "Try EmoLift Pro",
    features: ["No ads", "Deep Vent Mode", "Restart Day Feature", "10 AI supports per day", "Monthly Emotional Reflection", "Emotional Bookmarks"],
    privacy: "Privacy Policy",
    about: "About",
    selectLang: "Select Language",
    darkMode: "Dark Mode",
    notifications: "Daily Reminders",
    onboarding1: "Write your emotions.",
    onboarding2: "Receive support.",
    onboarding3: "Feel better.",
    start: "Get Started",
    remaining: "supports left today",
    promptBtn: "Give me a prompt",
    streak: "Day Streak",
    monthlyReflection: "Monthly Reflection",
    weeklyReflection: "Weekly Reflection",
    magicQuestionTitle: "Quote of the Day",
    microAction: "Suggestion",
    ventMode: "Emergency Vent",
    ventWarning: "Use only in moments of emotional urgency.",
    quickLog: "Quick Log",
    quickLogSubtitle: "Track just the emotion",
    restartDay: "Restart Day",
    selectTag: "Add a Bookmark (Optional)",
    quickLogSaved: "Emotion logged.",
    selectContext: "What is this about?",
    viewEntries: "View Entries",
    viewInJournal: "View in Journal",
  },
  [Language.PT_PT]: {
    howAreYou: "Como te sentes hoje?",
    placeholder: "Escreve o que te vai na alma...",
    getSupport: "Obter Apoio",
    getSupportSubtitle: "Escrever e receber resposta da IA",
    saveEntry: "Guardar Registo",
    backHome: "Voltar ao Início",
    dailyLimitReached: "Atingiste o teu limite diário.",
    upgradeToPro: "Melhorar para Pro",
    restore: "Restaurar Subscrição",
    journal: "Diário",
    stats: "Estatísticas",
    settings: "Definições",
    home: "Início",
    proBenefit: "Desbloqueia apoio ilimitado e histórico",
    statsLocked: "As estatísticas estão disponíveis para utilizadores Pro.",
    noEntries: "Ainda sem registos.",
    tryPro: "Experimenta EmoLift Pro",
    features: ["Sem anúncios", "Modo Desabafo", "Recomeçar o Dia", "10 apoios por dia", "Reflexão Mensal Emocional", "Bookmarks Emocionais"],
    privacy: "Política de Privacidade",
    about: "Sobre",
    selectLang: "Selecionar Idioma",
    darkMode: "Modo Escuro",
    notifications: "Lembretes Diários",
    onboarding1: "Escreve as tuas emoções.",
    onboarding2: "Recebe apoio.",
    onboarding3: "Sente-te melhor.",
    start: "Começar",
    remaining: "apoios restantes hoje",
    promptBtn: "Dá-me uma ideia",
    streak: "Dias Seguidos",
    monthlyReflection: "Reflexão Mensal",
    weeklyReflection: "Reflexão Semanal",
    magicQuestionTitle: "Frase do Dia",
    microAction: "Sugestão",
    ventMode: "Desabafo Urgente",
    ventWarning: "Utilizar apenas em momentos de urgência emocional.",
    quickLog: "Registo Rápido",
    quickLogSubtitle: "Guardar só a emoção de hoje",
    restartDay: "Recomeçar Dia",
    selectTag: "Adicionar Bookmark (Opcional)",
    quickLogSaved: "Emoção registada.",
    selectContext: "Sobre o que é?",
    viewEntries: "Ver Entradas",
    viewInJournal: "Ver no Diário",
  },
  [Language.PT_BR]: {
    howAreYou: "Como você se sente hoje?",
    placeholder: "Escreva o que está sentindo...",
    getSupport: "Obter Apoio",
    getSupportSubtitle: "Escrever e receber resposta da IA",
    saveEntry: "Salvar Registro",
    backHome: "Voltar ao Início",
    dailyLimitReached: "Você atingiu seu limite diário.",
    upgradeToPro: "Melhorar para Pro",
    restore: "Restaurar Assinatura",
    journal: "Diário",
    stats: "Estatísticas",
    settings: "Configurações",
    home: "Início",
    proBenefit: "Desbloqueie apoio ilimitado e histórico",
    statsLocked: "As estatísticas estão disponíveis para usuários Pro.",
    noEntries: "Ainda sem registros.",
    tryPro: "Experimente EmoLift Pro",
    features: ["Sem anúncios", "Modo Desabafo", "Recomeçar o Dia", "10 apoios por dia", "Reflexão Mensal Emocional", "Bookmarks Emocionais"],
    privacy: "Política de Privacidade",
    about: "Sobre",
    selectLang: "Selecionar Idioma",
    darkMode: "Modo Escuro",
    notifications: "Lembretes Diários",
    onboarding1: "Escreva suas emoções.",
    onboarding2: "Receba apoio.",
    onboarding3: "Sinta-se melhor.",
    start: "Começar",
    remaining: "apoios restantes hoje",
    promptBtn: "Me dê uma ideia",
    streak: "Dias Seguidos",
    monthlyReflection: "Reflexão Mensal",
    weeklyReflection: "Reflexão Semanal",
    magicQuestionTitle: "Frase do Dia",
    microAction: "Sugestão",
    ventMode: "Desabafo Urgente",
    ventWarning: "Use apenas em momentos de urgência emocional.",
    quickLog: "Registro Rápido",
    quickLogSubtitle: "Guardar só a emoção de hoje",
    restartDay: "Recomeçar Dia",
    selectTag: "Adicionar Bookmark (Opcional)",
    quickLogSaved: "Emoção registrada.",
    selectContext: "Sobre o que é?",
    viewEntries: "Ver Entradas",
    viewInJournal: "Ver no Diário",
  },
  [Language.ES]: {
    howAreYou: "¿Cómo te sientes hoy?",
    placeholder: "Escribe lo que sientes...",
    getSupport: "Obtener Apoyo",
    getSupportSubtitle: "Escribir y recibir respuesta de IA",
    saveEntry: "Guardar Entrada",
    backHome: "Volver al Inicio",
    dailyLimitReached: "Has alcanzado tu límite diario.",
    upgradeToPro: "Mejorar a Pro",
    restore: "Restaurar Suscripción",
    journal: "Diario",
    stats: "Estadísticas",
    settings: "Ajustes",
    home: "Inicio",
    proBenefit: "Desbloquea apoyo ilimitado e historial",
    statsLocked: "Las estadísticas están disponibles para usuarios Pro.",
    noEntries: "Todavía no hay entradas.",
    tryPro: "Prueba EmoLift Pro",
    features: ["Sin anuncios", "Modo Desahogo", "Reiniciar Día", "10 apoyos al día", "Reflexión Mensual Emocional", "Marcadores Emocionales"],
    privacy: "Política de Privacidad",
    about: "Acerca de",
    selectLang: "Seleccionar Idioma",
    darkMode: "Modo Oscuro",
    notifications: "Recordatorios Diarios",
    onboarding1: "Escribe tus emociones.",
    onboarding2: "Recibe apoyo.",
    onboarding3: "Siéntete mejor.",
    start: "Empezar",
    remaining: "apoyos restantes hoy",
    promptBtn: "Dame una idea",
    streak: "Días Seguidos",
    monthlyReflection: "Reflexión Mensual",
    weeklyReflection: "Reflexión Semanal",
    magicQuestionTitle: "Frase del Día",
    microAction: "Sugerencia",
    ventMode: "Desahogo Urgente",
    ventWarning: "Usar solo en momentos de urgencia emocional.",
    quickLog: "Registro Rápido",
    quickLogSubtitle: "Guardar solo la emoción de hoy",
    restartDay: "Reiniciar Día",
    selectTag: "Añadir Marcador (Opcional)",
    quickLogSaved: "Emoción registrada.",
    selectContext: "¿Sobre qué es?",
    viewEntries: "Ver Entradas",
    viewInJournal: "Ver en Diario",
  }
};
