import { GoogleGenAI } from "@google/genai";
import { Club, Event } from "../types";

const API_KEY = process.env.API_KEY || ''; 

// Helper to check if key exists
export const hasApiKey = () => !!API_KEY;

export const generateClubDescription = async (clubName: string, category: string, keywords: string) => {
  if (!API_KEY) return "AI services are unavailable. Please configure API Key.";
  
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a compelling, short (max 50 words) description for a university club named "${clubName}". 
      Category: ${category}. 
      Keywords/Vibe: ${keywords}.
      Tone: Exciting and inviting for students.`
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate description.";
  }
};

export const askUniversityAssistant = async (
  query: string, 
  contextData: { clubs: Club[], events: Event[] }
) => {
  if (!API_KEY) return "I can't access my brain right now. (Missing API Key)";

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Prepare context
  const clubContext = contextData.clubs.map(c => 
    `${c.name} (ID: ${c.id}, Status: ${c.status}): ${c.description} [Category: ${c.category}]`
  ).join('\n');
  
  const eventContext = contextData.events.map(e => 
    `Event: ${e.title} by Club ${e.clubId} on ${new Date(e.date).toDateString()} at ${e.location}. ${e.description}`
  ).join('\n');

  const systemInstruction = `You are "UniBot", a helpful assistant for the UniClubs platform.
  Answer user questions based strictly on the following data.
  
  CLUBS DATA:
  ${clubContext}

  EVENTS DATA:
  ${eventContext}

  If the answer is not in the data, politely say you don't know.
  Keep answers concise and friendly.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Sorry, I encountered an error processing your request.";
  }
};
