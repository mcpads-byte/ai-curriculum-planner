import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Run as an Edge Function to avoid the standard 10-second timeout limit
export const runtime = 'edge';

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
    
    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing on server configuration." }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const { subject, grade } = await request.json();

    // FIXED: Using the standard production model string for 2026
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash', 
      contents: `Create a comprehensive, structured 4-week learning plan and curriculum map for the subject "${subject}" tailored for Grade ${grade}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: CurriculumSchema,
      }
    });

    const rawText = response.text || '{}';
    const data = JSON.parse(rawText);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error generating curriculum:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}