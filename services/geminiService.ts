import { GoogleGenAI } from "@google/genai";
import { Facility, RoomType } from '../types';

let client: GoogleGenAI | null = null;

// Safe initialization that won't crash if ENV is missing, but will fail gracefully on call
const getClient = () => {
  if (!client && process.env.API_KEY) {
    client = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return client;
};

export const getConciergeResponse = async (
  userMessage: string, 
  facilities: Facility[], 
  rooms: RoomType[]
): Promise<string> => {
  const ai = getClient();
  if (!ai) {
    return "I'm sorry, I'm currently offline (API Key missing). Please contact reception.";
  }

  const facilitiesList = facilities.map(f => f.name).join(', ');
  const roomsList = rooms.map(r => `${r.name} (NPR ${r.pricePerNight}, sleeps ${r.capacity})`).join('; ');

  const systemInstruction = `
    You are a helpful Hotel Concierge for 'HotelEase'.
    
    Hotel Data:
    - Facilities: ${facilitiesList}
    - Room Types: ${roomsList}
    
    Answer the guest's question politely and briefly.
    If they ask about rooms, suggest the best fit from the list.
    If they ask about amenities, check the facilities list.
    If you don't know, say "Please check with the front desk."
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction,
      }
    });

    return response.text || "I didn't catch that. Could you rephrase?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble connecting to the network right now.";
  }
};