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

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: `You are an expert curriculum engine mapping a unit for Subject: "${subject}", Grade Level: "${grade}".
      
      Teacher's Configurations:
      - Content Standard: "${contentStandard}"
      - Performance Standard: "${performanceStandard}"
      - Topics: "${topics}"
      - Core Institutional Values: "${coreValues}"
      - Learning Competencies to process: "${competencies}"
      
      TASK:
      1. Classify all provided competencies into their correct row category: ACQUISITION, MAKE MEANING, or TRANSFER.
      2. For each category block, generate targeted Assessments, Activities, and Resources.
      3. Weave the institutional core values into the activities.
      
      CRITICAL FORMATTING RULE: You must output your entire response as a single, valid JSON object matching the exact structure below. Do not wrap it in markdown block quotes. Use a clean string format where list items are separated by a space or a semicolon, NOT a raw multi-line linebreak, so JSON.parse does not break.
      {
        "acqComp": "classified acquisition competencies",
        "acqAsst": "assessments for acquisition",
        "acqAct": "activities for acquisition",
        "acqRes": "resources for acquisition",
        "mmComp": "classified make meaning competencies",
        "mmAsst": "assessments for make meaning",
        "mmAct": "activities for make meaning",
        "mmRes": "resources for make meaning",
        "transComp": "classified transfer competencies",
        "transAsst": "assessments for transfer",
        "transAct": "activities for transfer",
        "transRes": "resources for transfer"
      }`,
    });

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
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}