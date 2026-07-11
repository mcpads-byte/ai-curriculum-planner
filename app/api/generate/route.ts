import { GoogleGenAI } from '@google/genai';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing API Key configuration" }), { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const body = await request.json();
    
    const { subject, grade, competencies, topics, contentStandard, performanceStandard, coreValues } = body;

    // We remove responseSchema entirely to let the model start talking immediately without internal buffering
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: `You are an expert curriculum design engine working under strict UbD guidelines.
      
      Teacher Global Inputs:
      - Subject Name: "${subject}"
      - Grade Level: "${grade}"
      - Global Content Standard: "${contentStandard}"
      - Global Performance Standard: "${performanceStandard}"
      - Target Topics: "${topics}"
      - Selected Core Institutional Values: "${coreValues}"
      
      The teacher has provided these raw learning competencies:
      "${competencies}"
      
      TASK:
      1. Classify all provided competencies into their correct category: Acquisition, Make Meaning, or Transfer.
      2. For each category block, generate targeted Assessments, Activities, and Resources.
      3. Seamlessly weave the institutional core values into the activities.
      
      CRITICAL RULE: You must output your entire response as a single, valid JSON object following the format below. Do not include markdown blocks like \`\`\`json. Just start with the opening curly brace.

      Format template:
      {
        "acquisition": {
          "competencies": "string listing the categorized competencies",
          "assessments": "detailed text list of assessment tasks",
          "activities": "detailed text list of classroom activities",
          "resources": "text list of tools and materials"
        },
        "makeMeaning": {
          "competencies": "string listing the categorized competencies",
          "assessments": "detailed text list of assessment tasks",
          "activities": "detailed text list of classroom activities",
          "resources": "text list of tools and materials"
        },
        "transfer": {
          "competencies": "string listing the categorized competencies",
          "assessments": "detailed text list of assessment tasks",
          "activities": "detailed text list of classroom activities",
          "resources": "text list of tools and materials"
        }
      }`,
    });

    // Immediately return the stream so the browser catches data chunks within milliseconds
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of responseStream) {
            if (chunk.text) {
              controller.enqueue(encoder.encode(chunk.text));
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error: any) {
    console.error("Stream initialization error:", error);
    return new Response(JSON.stringify({ error: "Failed to open stream connection" }), { status: 500 });
  }
}