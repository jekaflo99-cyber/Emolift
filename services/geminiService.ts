
import { GoogleGenAI } from "@google/genai";
import { EmotionType, Language, ContextCategory } from "../types";
import { CONTEXT_CONFIG, EMOTION_LABELS } from "../constants";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

type SupportMode = 'standard' | 'vent' | 'restart';

export const generateSupportMessage = async (
  emotion: EmotionType,
  userText: string,
  language: Language,
  mode: SupportMode = 'standard',
  contexts: ContextCategory[] = []
): Promise<string> => {
  
  const langMap: Record<Language, string> = {
    [Language.EN]: "English",
    [Language.PT_PT]: "Portuguese (Portugal)",
    [Language.PT_BR]: "Portuguese (Brazil)",
    [Language.ES]: "Spanish",
  };
  
  const langName = langMap[language] || "English";
  
  // Format context for prompt
  const contextString = contexts.length > 0 
    ? `The user is feeling this way regarding: ${contexts.join(', ')}.`
    : '';

  let basePrompt = "";

  if (mode === 'vent') {
      basePrompt = `
        You are an advanced emotional support AI named EmoLift.
        The user activated the "Emergency Vent Mode", meant for emotionally intense moments.
        The user is feeling "${emotion}".
        ${contextString}
        The user wrote: "${userText}".

        Your job:
        - Respond with warmth, deep empathy, and emotional grounding.
        - Clearly validate the user’s emotional experience.
        - Help them feel understood and less alone.
        - Give one small grounding exercise (breathing, focus, body awareness, tiny action).
        - Provide a gentle, uplifting reframe of the situation.
        - Maximum length: 6 to 7 phrases.
        - Maintain a soft, comforting tone throughout.

        Safety Protocol:
        If the user expresses suicidal or dangerous intentions, respond with supportive language and encourage contacting emergency professionals immediately, without giving medical or diagnostic information.

        Language: Respond in ${langName}.
      `;
  } else if (mode === 'restart') {
      basePrompt = `
        You are an emotional support assistant named EmoLift.
        The user is feeling "${emotion}".
        ${contextString}
        The user wrote: "${userText}".
        
        Goal: The user had a bad day and wants to RESTART their day mentally.
        
        Structure your response:
        - Acknowledge that today wasn't perfect, but it's not over.
        - Provide 2 sentences to boost self-esteem.
        - Suggest one "Anchor" micro-action (a small kindness to themselves).
        - End with "Your future self thanks you."
        
        Constraints:
        - Length: 3-4 sentences.
        - Tone: Uplifting, energetic but gentle, hopeful.
        - Language: ${langName}.
        - Do not give medical advice.
      `;
  } else {
      // Standard Mode
      basePrompt = `
        You are an emotional support assistant named EmoLift.
        The user is feeling "${emotion}".
        ${contextString}
        The user wrote: "${userText}".
        
        Goal: Provide a short, warm, empathetic, and positive motivational response.
        Constraints: 
        - Max 3 sentences.
        - Language: ${langName}.
        - Do not give medical advice.
        - Be encouraging.
      `;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: basePrompt,
    });
    
    return response.text || "I'm here for you. Take a deep breath and keep going.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    const errorMessages = {
        [Language.EN]: "I'm having trouble connecting right now, but remember you are strong.",
        [Language.PT_PT]: "Estou a ter dificuldades em ligar-me agora, mas lembra-te que és forte.",
        [Language.PT_BR]: "Estou com dificuldades de conexão agora, mas lembre-se de que você é forte.",
        [Language.ES]: "Tengo problemas para conectarme ahora mismo, pero recuerda que eres fuerte."
    };
    return errorMessages[language] || errorMessages[Language.EN];
  }
};

export interface AnalysisData {
    topEmotion: EmotionType;
    topEmotionContext: ContextCategory | null;
    secondEmotion?: EmotionType | null;
    secondEmotionContext?: ContextCategory | null;
    generalTopContext: ContextCategory | null;
}

export const generateAnalysisInsight = async (
  data: AnalysisData,
  language: Language
): Promise<string> => {
    
    const langMap: Record<Language, string> = {
      [Language.EN]: "English",
      [Language.PT_PT]: "Portuguese (Portugal)",
      [Language.PT_BR]: "Portuguese (Brazil)",
      [Language.ES]: "Spanish",
    };
    
    const langName = langMap[language] || "English";
    
    const e1 = EMOTION_LABELS[language][data.topEmotion];
    const c1 = data.topEmotionContext ? CONTEXT_CONFIG[data.topEmotionContext].label[language] : "general life";
    
    const e2 = data.secondEmotion ? EMOTION_LABELS[language][data.secondEmotion] : null;
    const c2 = data.secondEmotionContext ? CONTEXT_CONFIG[data.secondEmotionContext].label[language] : "general life";
    
    const generalContext = data.generalTopContext ? CONTEXT_CONFIG[data.generalTopContext].label[language] : "varied areas";

    const prompt = `
      Data Provided:
      1. #1 Emotion: "${e1}" (Mostly associated with: "${c1}").
      2. #2 Emotion: "${e2 || 'None'}" (Mostly associated with: "${c2 || 'N/A'}").
      3. Most frequent context overall: "${generalContext}".

      Task:
      Write a warm, simple, and conversational observation (max 2 sentences) about these patterns.
      
      Guidelines:
      - Use natural, everyday language. Avoid academic or "therapeutic" jargon.
      - Be empathetic but objective. Like a friend noticing a pattern.
      - Don't use big words. Keep it simple.
      - Connect the top emotion to the context if relevant.
      - Example style: "It seems like anxiety was present often this week, especially related to work. However, you also had moments of calm."

      Language: ${langName}
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || "";
    } catch (e) {
      console.error(e);
      return "";
    }
};
