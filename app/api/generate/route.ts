import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Define the precise JSON structure we want Gemini to return
const CurriculumSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    weeks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          weekNumber: { type: "string" },
          topic: { type: "string" },
          objectives: { type: "string" },
          activities: { type: "string" }
        },
        required: ["weekNumber", "topic", "objectives", "activities"]
      }
    }
  },
  required: ["title", "weeks"]
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Safety check to ensure the key is correctly initialized on the host server
    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing on server configuration." }, { status: 500 });
    }

    // Initialize the SDK directly inside the handler
    const ai = new GoogleGenAI({ apiKey });
    const { subject, grade } = await request.json();

    // Calling the updated model name
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: `Create a comprehensive, structured 4-week learning plan and curriculum map for the subject "${subject}" tailored for Grade ${grade}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: CurriculumSchema,
      }
    });

    // Safe string handling to fulfill TypeScript strict rules
    const rawText = response.text || '{}';
    const data = JSON.parse(rawText);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error generating curriculum:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}