import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'edge';

// Defining your exact custom curriculum map structure for the AI
const CurriculumSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    term: { type: "string" },
    contentStandard: { type: "string" },
    performanceStandard: { type: "string" },
    resources: { type: "string" },
    coreValues: { type: "string" },
    acquisition: {
      type: "object",
      properties: {
        competencies: { type: "string" },
        assessments: { type: "string" },
        activities: { type: "string" }
      },
      required: ["competencies", "assessments", "activities"]
    },
    makeMeaning: {
      type: "object",
      properties: {
        competencies: { type: "string" },
        assessments: { type: "string" },
        activities: { type: "string" }
      },
      required: ["competencies", "assessments", "activities"]
    },
    transfer: {
      type: "object",
      properties: {
        competencies: { type: "string" },
        assessments: { type: "string" },
        activities: { type: "string" }
      },
      required: ["competencies", "assessments", "activities"]
    }
  },
  required: ["title", "term", "contentStandard", "performanceStandard", "resources", "coreValues", "acquisition", "makeMeaning", "transfer"]
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "API Key missing" }, { status: 500 });

    const ai = new GoogleGenAI({ apiKey });
    const { subject, grade } = await request.json();

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash', 
      contents: `Generate a complete, professional 1st Quarter curriculum map for the subject "${subject}" tailored for ${grade}. 
      Break down the content into the three UbD stages: Acquisition (foundational facts/skills), Make Meaning (conceptual understanding/big ideas), and Transfer (real-world application). Ensure you provide relevant resources and integrate common institutional core values (e.g., Excellence, Integrity, Service).`,
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