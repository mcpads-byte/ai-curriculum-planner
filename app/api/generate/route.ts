import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize the free SDK using your secret key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// This defines the exact structure we want Gemini to return
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
    const { subject, grade } = await request.json();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Create a comprehensive, structured 4-week learning plan and curriculum map for the subject "${subject}" tailored for Grade ${grade}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: CurriculumSchema,
      }
    });

    // Safe parsing that satisfies TypeScript strict mode rules
    const rawText = response.text || '{}';
    const data = JSON.parse(rawText);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error generating curriculum:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}