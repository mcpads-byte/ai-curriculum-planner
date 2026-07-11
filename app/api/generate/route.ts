import { GoogleGenAI } from '@google/genai';

export const runtime = 'edge';

const OfficialMapSchema = {
  type: "object",
  properties: {
    acquisition: {
      type: "object",
      properties: {
        competencies: { type: "string", description: "The competencies from the teacher's list that fall under Acquisition (A)." },
        assessments: { type: "string", description: "Aligned assessment items or tasks for acquisition." },
        activities: { type: "string", description: "Aligned classroom activities for acquisition." },
        resources: { type: "string", description: "Learning resources and tools for acquisition." }
      },
      required: ["competencies", "assessments", "activities", "resources"]
    },
    makeMeaning: {
      type: "object",
      properties: {
        competencies: { type: "string", description: "The competencies from the teacher's list that fall under Make Meaning (M)." },
        assessments: { type: "string", description: "Aligned assessment tasks or CER elements for meaning-making." },
        activities: { type: "string", description: "Aligned classroom activities for meaning-making." },
        resources: { type: "string", description: "Learning resources and tools for meaning-making." }
      },
      required: ["competencies", "assessments", "activities", "resources"]
    },
    transfer: {
      type: "object",
      properties: {
        competencies: { type: "string", description: "The competencies from the teacher's list that fall under Transfer (T)." },
        assessments: { type: "string", description: "Aligned performance tasks or transfer checks." },
        activities: { type: "string", description: "Aligned classroom activities for transfer." },
        resources: { type: "string", description: "Learning resources and tools for transfer." }
      },
      required: ["competencies", "assessments", "activities", "resources"]
    }
  },
  required: ["acquisition", "makeMeaning", "transfer"]
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: "Missing API Key" }), { status: 500 });

    const ai = new GoogleGenAI({ apiKey });
    const body = await request.json();
    
    const { subject, grade, competencies, topics, contentStandard, performanceStandard, coreValues } = body;

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: `You are an expert curriculum engine mapping a unit for Subject: "${subject}", ${grade}.
      
      Teacher's Core Configurations:
      - Content Standard: "${contentStandard}"
      - Performance Standard: "${performanceStandard}"
      - Topics: "${topics}"
      - Core Institutional Values: "${coreValues}"
      - Raw Competencies to Classify: "${competencies}"
      
      TASK:
      1. Classify all provided competencies into their correct category: Acquisition, Make Meaning, or Transfer.
      2. For each category block, generate perfectly aligned Assessments, Activities, and Resources.
      3. Seamlessly weave the institutional core values into the activities.
      
      Return your entire response as a single valid JSON object matching the requested schema layout. No extra text markdown wrappers outside the json structure.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: OfficialMapSchema
      }
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of responseStream) {
          if (chunk.text) controller.enqueue(encoder.encode(chunk.text));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked' },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}