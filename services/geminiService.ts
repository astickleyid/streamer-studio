
import { GoogleGenAI, Type } from "@google/genai";
import { AIToolResponse } from '../types';

export const generateStreamAssistance = async (
  currentTitle: string,
  category: string,
  chatContext: string[]
): Promise<AIToolResponse> => {
  try {
    // Initializing GoogleGenAI inside the function to ensure the current API key is always used
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      You are an expert streaming assistant for a live streamer. 
      The stream title is "${currentTitle}" and category is "${category}".
      Recent chat messages: ${JSON.stringify(chatContext.slice(-5))}

      Provide a JSON object with:
      1. 'suggestion': A short talking point or engagement idea to keep the stream lively.
      2. 'pollQuestion': A relevant poll question based on the context.
      3. 'pollOptions': An array of 3 short options for the poll.

      Keep the tone casual, energetic, and helpful.
    `;

    // Using responseSchema for structured JSON output as recommended in Google GenAI coding guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestion: {
              type: Type.STRING,
              description: 'A short talking point or engagement idea to keep the stream lively.',
            },
            pollQuestion: {
              type: Type.STRING,
              description: 'A relevant poll question based on the context.',
            },
            pollOptions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'An array of 3 short options for the poll.',
            },
          },
          required: ['suggestion', 'pollQuestion', 'pollOptions'],
        },
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIToolResponse;
    }
    return { suggestion: "Stay hydrated and thank your new followers!" };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { suggestion: "Error connecting to AI Assistant. Just be yourself!" };
  }
};

export const generateStreamTitle = async (category: string, vibe: string): Promise<string> => {
   try {
    // Initializing GoogleGenAI inside the function to ensure the current API key is always used
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a catchy, short, and viral stream title for a "${category}" stream. The vibe is "${vibe}". Return only the title text, no quotes.`,
    });
    return response.text?.trim() || "Chilling and Gaming";
   } catch (error) {
     return "Late Night Stream";
   }
};
