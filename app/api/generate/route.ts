import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'edge';

// Schema 1: Arching Curriculum Map Layout
const CurriculumMapSchema = {
  type: "object",
  properties: {
    term: { type: "string" },
    contentStandard: { type: "string" },
    performanceStandard: { type: "string" },
    resources: { type: "string" },
    coreValuesIntegration: { type: "string" },
    acquisition: { type: "object", properties: { competencies: { type: "string" }, assessments: { type: "string" }, activities: { type: "string" } }, required: ["competencies", "assessments", "activities"] },
    makeMeaning: { type: "object", properties: { competencies: { type: "string" }, assessments: { type: "string" }, activities: { type: "string" } }, required: ["competencies", "assessments", "activities"] },
    transfer: { type: "object", properties: { competencies: { type: "string" }, assessments: { type: "string" }, activities: { type: "string" } }, required: ["competencies", "assessments", "activities"] }
  },
  required: ["term", "contentStandard", "performanceStandard", "resources", "coreValuesIntegration", "acquisition", "makeMeaning", "transfer"]
};

// Schema 2: Ultra-detailed Weekly Plan Worksheet Layout
const WeeklyPlanSchema = {
  type: "object",
  properties: {
    weekTitle: { type: "string" },
    explore: {
      type: "object",
      properties: {
        topic: { type: "string" },
        contentStandard: { type: "string" },
        performanceStandard: { type: "string" },
        overview: { type: "string" },
        thisUnitIsAbout: { type: "string" },
        youWillLearnTo: { type: "string" },
        essentialQuestion: { type: "string" },
        conceptualChangeActivity: { type: "string" }
      },
      required: ["topic", "contentStandard", "performanceStandard", "overview", "thisUnitIsAbout", "youWillLearnTo", "essentialQuestion", "conceptualChangeActivity"]
    },
    acquisition: {
      type: "object",
      properties: {
        competency: { type: "string" },
        targets: { type: "string" }, // Must start with "I can..."
        criteria: { type: "string" }, // Must start with "I am able to..."
        lookFors: { type: "string" },
        activityIntro: { type: "string" },
        activitySteps: { type: "string" },
        activityQuestions: { type: "string" },
        resourcesLinks: { type: "string" },
        sampleWorksheet: { type: "string" },
        modularActivity: { type: "string" },
        asynchronousActivity: { type: "string" },
        assessmentItems: { type: "string" } // 10-15 items
      },
      required: ["competency", "targets", "criteria", "lookFors", "activityIntro", "activitySteps", "activityQuestions", "resourcesLinks", "sampleWorksheet", "modularActivity", "asynchronousActivity", "assessmentItems"]
    },
    makeMeaning: {
      type: "object",
      properties: {
        competency: { type: "string" },
        targets: { type: "string" },
        criteria: { type: "string" },
        lookFors: { type: "string" },
        cerActivityIntro: { type: "string" },
        cerActivitySteps: { type: "string" },
        cerWorksheetQuestions: { type: "string" }, // Divided into Claim, Evidence, Reasoning
        cerResources: { type: "string" },
        cerSampleCompletedWorksheet: { type: "string" },
        modularActivity: { type: "string" },
        asynchronousActivity: { type: "string" },
        assessmentItems: { type: "string" } // 10-15 items
      },
      required: ["competency", "targets", "criteria", "lookFors", "cerActivityIntro", "cerActivitySteps", "cerWorksheetQuestions", "cerResources", "cerSampleCompletedWorksheet", "modularActivity", "asynchronousActivity", "assessmentItems"]
    },
    transfer: {
      type: "object",
      properties: {
        performanceStandard: { type: "string" },
        competency: { type: "string" },
        valuesIntro: { type: "string" }, // 5-10 sentences
        valuesSteps: { type: "string" },
        valuesResources: { type: "string" },
        valuesEnrichmentActivity: { type: "string" },
        valuesEnrichmentExplanation: { type: "string" },
        modularActivity: { type: "string" },
        asynchronousActivity: { type: "string" },
        assessmentItems: { type: "string" } // 10-15 items
      },
      required: ["performanceStandard", "competency", "valuesIntro", "valuesSteps", "valuesResources", "valuesEnrichmentActivity", "valuesEnrichmentExplanation", "modularActivity", "asynchronousActivity", "assessmentItems"]
    }
  },
  required: ["weekTitle", "explore", "acquisition", "makeMeaning", "transfer"]
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "API Key missing" }, { status: 500 });

    const ai = new GoogleGenAI({ apiKey });
    const body = await request.json();
    const { type, subject, grade, competenciesInput, selectedWeek, topicsInput } = body;

    if (type === 'curriculum') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Act as an expert curriculum developer. Create an official Curriculum Map for Subject: "${subject}", ${grade}.
        Unclassified Raw Competencies Provided by Teacher:
        "${competenciesInput}"
        Topics Provided: "${topicsInput || 'Auto-align to curriculum standard steps'}"
        
        Task:
        1. Classify every competency into Acquisition, Make Meaning, or Transfer (AMT).
        2. Align relevant assessments, activities, and specific resource outlines.
        3. Intentionally inject these precise Institutional Core Values throughout: God Fearing, Respectfulness, Initiative, Love of Nature, and Leadership.`,
        config: { responseMimeType: "application/json", responseSchema: CurriculumMapSchema }
      });
      return NextResponse.json(JSON.parse(response.text || '{}'));
    } else {
      // Handle the massive single-week layout engine
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Generate a comprehensive, fully articulated Weekly Learning Plan for ${selectedWeek || 'Week 1'} of "${subject}" tailored for ${grade}.
        Target Week Competencies: "${competenciesInput}"
        
        CRITICAL RULES:
        1. Ensure every section has comprehensive data. Do not leave fields blank.
        2. All Learning Targets must start with "I can...".
        3. All Success Criteria must start with "I am able to...".
        4. The Make Meaning section MUST include a complete Claim-Evidence-Reasoning (CER) activity with a complete sample answer key worksheet.
        5. Assessments must have 10 to 15 robust test items listed out cleanly.
        6. Interweave these values seamlessly into the instructions: God Fearing, Respectfulness, Initiative, Love of Nature, and Leadership.`,
        config: { responseMimeType: "application/json", responseSchema: WeeklyPlanSchema }
      });
      return NextResponse.json(JSON.parse(response.text || '{}'));
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}