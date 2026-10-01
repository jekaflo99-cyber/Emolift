
import { JournalEntry, EmotionType, EntryTag, ContextCategory } from '../types';
import { TAG_CONFIG, CONTEXT_CONFIG } from '../constants';

// Definição de Cenários para garantir coerência (Texto vs Emoção)
const SCENARIOS = [
  {
    text: "Hoje foi um dia incrível! Consegui acabar tudo o que queria.",
    allowedEmotions: [EmotionType.HAPPY],
    allowedContexts: ['work', 'self'] as ContextCategory[]
  },
  {
    text: "Sinto-me super cansado, parece que não dormi nada...",
    allowedEmotions: [EmotionType.TIRED],
    allowedContexts: ['health', 'self'] as ContextCategory[]
  },
  {
    text: "O trânsito estava horrível e cheguei atrasado à reunião. Que stress!",
    allowedEmotions: [EmotionType.STRESSED, EmotionType.ANGRY],
    allowedContexts: ['work', 'other'] as ContextCategory[]
  },
  {
    text: "Discuti com a minha namorada por causa de dinheiro. Não sei o que fazer.",
    allowedEmotions: [EmotionType.SAD, EmotionType.ANXIOUS],
    allowedContexts: ['relationships', 'finance'] as ContextCategory[]
  },
  {
    text: "", // Caso de texto vazio (Simula Quick Log)
    allowedEmotions: [EmotionType.NEUTRAL, EmotionType.HAPPY, EmotionType.SAD], 
    allowedContexts: ['other'] as ContextCategory[] 
  },
  {
    text: "Hoje decidi focar-me em mim. Fui correr, li um livro e desliguei o telemóvel. Foi a melhor coisa que podia ter feito para a minha ansiedade. Amanhã é um novo dia e espero manter este ritmo.",
    allowedEmotions: [EmotionType.HAPPY, EmotionType.NEUTRAL],
    allowedContexts: ['health', 'self'] as ContextCategory[]
  }
];

// Respostas simuladas para não gastar API
const MOCK_AI_RESPONSES = [
    "Essa é uma perspectiva interessante. Continua a observar o que sentes.",
    "Obrigado por partilhares. Lidar com isto passo a passo é o caminho.",
    "Lembra-te de respirar fundo. Estás a fazer o melhor que podes.",
    "Registo guardado com sucesso. A consistência é chave.",
    "Fico feliz por teres registado este momento.",
    "Amanhã é um novo dia com novas oportunidades."
];

// Utilitários Seguros
const getRandomItem = <T>(arr: T[]): T => {
    if (!arr || arr.length === 0) return arr?.[0]; // Fallback if empty, though shouldn't happen with our constants
    return arr[Math.floor(Math.random() * arr.length)];
};

const getRandomItems = <T>(arr: T[], count: number): T[] => {
    if (!arr || arr.length === 0) return [];
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

export const generateMockEntries = (daysToGenerate: number = 30): JournalEntry[] => {
  const entries: JournalEntry[] = [];
  const now = new Date();
  
  // Garantir que temos tags disponíveis
  const allTags = (Object.keys(TAG_CONFIG) as EntryTag[]).filter(t => t !== 'none');
  const allContexts = (Object.keys(CONTEXT_CONFIG) as ContextCategory[]);

  // Iterar de hoje para trás (0 até 29 dias atrás)
  for (let i = 0; i < daysToGenerate; i++) {
    const dateBase = new Date(now);
    dateBase.setDate(dateBase.getDate() - i);
    
    // Decidir quantos registos para este dia
    const rand = Math.random();
    let entriesCount = 0;
    if (rand > 0.85) entriesCount = 0; // 15% chance de 0
    else if (rand > 0.5) entriesCount = 1;
    else if (rand > 0.2) entriesCount = 2;
    else entriesCount = 3;

    for (let j = 0; j < entriesCount; j++) {
      // Escolher hora aleatória
      const entryDate = new Date(dateBase);
      entryDate.setHours(8 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 60));

      const scenario = getRandomItem(SCENARIOS);
      if (!scenario) continue;

      const emotion = getRandomItem(scenario.allowedEmotions) || EmotionType.NEUTRAL;
      
      const numContexts = Math.floor(Math.random() * 2) + 1;
      const contexts = getRandomItems(scenario.allowedContexts.length > 0 ? scenario.allowedContexts : allContexts, numContexts);

      let tags: EntryTag[] = [];
      if (Math.random() < 0.7 && allTags.length > 0) {
         tags.push(getRandomItem(allTags));
      }

      const userText = scenario.text === "" ? "Registo Rápido" : scenario.text;
      const aiReply = getRandomItem(MOCK_AI_RESPONSES);

      const newEntry: JournalEntry = {
        id: `mock-${entryDate.getTime()}-${Math.random().toString(36).substr(2, 6)}`,
        date: entryDate.toISOString(),
        emotion: emotion,
        userText: userText,
        aiReply: aiReply,
        type: 'daily',
        tags: tags,
        contextTags: contexts
      };

      entries.push(newEntry);
    }
  }

  // Ordenar: mais recente primeiro
  return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
