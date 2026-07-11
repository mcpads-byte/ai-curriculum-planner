import { GoogleGenAI } from '@google/genai';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing API Key" }), { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const body = await request.json();
    
    const { subject, grade, competencies, topics, contentStandard, performanceStandard, coreValues } = body;

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: `You are an expert curriculum design engine running under strict UbD guidelines.
      
      Teacher Global Inputs:
      - Subject Name: "${subject}"
      - Grade Level: "${grade}"
      - Content Standard: "${contentStandard}"
      - Performance Standard: "${performanceStandard}"
      - Target Topics: "${topics}"
      - Selected Core Institutional Values: "${coreValues}"
      
      Raw Learning Competencies to process:
      "${competencies}"
      
      TASK:
      1. Classify all provided competencies into their correct category: Acquisition, Make Meaning, or Transfer.
      2. For each category block, generate targeted Assessments, Activities, and Resources.
      3. Seamlessly weave the institutional core values into the activities.
      
      CRITICAL FORMATTING RULE:
      You must format your entire response using the exact text tags below to separate fields. Do not write any conversational text or markdown outside these tags.
      
      [ACQUISITION_COMPETENCIES]
      (List the competencies classified under Acquisition here)
      
      [ACQUISITION_ASSESSMENTS]
      (List the generated assessments for Acquisition here)
      
      [ACQUISITION_ACTIVITIES]
      (List the generated activities for Acquisition here)
      
      [ACQUISITION_RESOURCES]
      (List the generated resources for Acquisition here)
      
      [MEANING_COMPETENCIES]
      (List the competencies classified under Make Meaning here)
      
      [MEANING_ASSESSMENTS]
      (List the generated assessments for Make Meaning here)
      
      [MEANING_ACTIVITIES]
      (List the generated activities for Make Meaning here)
      
      [MEANING_RESOURCES]
      (List the generated resources for Make Meaning here)
      
      [TRANSFER_COMPETENCIES]
      (List the competencies classified under Transfer here)
      
      [TRANSFER_ASSESSMENTS]
      (List the generated assessments for Transfer here)
      
      [TRANSFER_ACTIVITIES]
      (List the generated activities for Transfer here)
      
      [TRANSFER_RESOURCES]
      (List the generated resources for Transfer here)`,
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