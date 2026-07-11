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
      
      CRITICAL FORMATTING RULE: You must output your response as plain text using the exact headers below. Do not wrap the text in markdown code blocks, and do not use JSON. Just write the marker name and put the content directly under it.

      ===ACQ_COMP===
      (List categorized acquisition competencies here)

      ===ACQ_ASST===
      (List assessments for acquisition here)

      ===ACQ_ACT===
      (List activities for acquisition here)

      ===ACQ_RES===
      (List resources for acquisition here)

      ===MM_COMP===
      (List categorized make meaning competencies here)

      ===MM_ASST===
      (List assessments for make meaning here)

      ===MM_ACT===
      (List activities for make meaning here)

      ===MM_RES===
      (List resources for make meaning here)

      ===TRANS_COMP===
      (List categorized transfer competencies here)

      ===TRANS_ASST===
      (List assessments for transfer here)

      ===TRANS_ACT===
      (List activities for transfer here)

      ===TRANS_RES===
      (List resources for transfer here)`,
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