import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'edge';

// Schema designed to return an array of rows—one for each competency
const CurriculumMapSchema = {
  type: "object",
  properties: {
    rows: {
      type: "array",
      description: "A list of curriculum rows, generating exactly one item per input learning competency.",
      items: {
        type: "object",
        properties: {
          competency: { type: "string", description: "The specific individual learning competency being addressed in this row." },
          alignedActivities: { type: "string", description: "Engaging classroom activities tailored to this competency and integrating the specified core values." },
          alignedAssessments: { type: "string", description: "10-15 targeted evaluation items or tasks checking mastery of this specific competency." },
          alignedResources: { type: "string", description: "Textbook pages, handout references, or interactive tools for this competency." }
        },
        required: ["competency", "alignedActivities", "alignedAssessments", "alignedResources"]
      }
    }
  },
  required: ["rows"]
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "API Key missing" }, { status: 500 });

    const ai = new GoogleGenAI({ apiKey });
    const body = await request.json();
    
    const { subject, grade, competencies, topics, contentStandard, performanceStandard, coreValues } = body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `You are an expert curriculum design engine working under strict UbD guidelines.
      
      Teacher Global Inputs:
      - Subject Name: "${subject}"
      - Grade Level: "${grade}"
      - Global Content Standard: "${contentStandard}"
      - Global Performance Standard: "${performanceStandard}"
      - Target Topics: "${topics}"
      - Selected Core Institutional Values: "${coreValues}"
      
      The teacher has provided the following raw learning competencies:
      "${competencies}"
      
      TASK:
      1. Parse out and separate each distinct learning competency found in the text.
      2. For EVERY individual competency, generate a corresponding object in the 'rows' array containing custom-aligned Activities, Assessments, and Resources.
      3. Ensure the classroom activities actively reflect and weave in the institutional core values provided.`,
      config: { 
        responseMimeType: "application/json", 
        responseSchema: CurriculumMapSchema 
      }
    });

    return NextResponse.json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error("Mapping Error:", error);
    return NextResponse.json({ error: "Generation pipeline failed" }, { status: 500 });
  }
}