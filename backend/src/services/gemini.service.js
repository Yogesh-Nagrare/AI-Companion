// backend/services/gemini.service.js
// STRICTLY uses const { GoogleGenAI } = require("@google/genai") as required

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

/**
 * analyzeHealthText
 * @param {string} pdfText - Extracted text from pdf-parse
 * @param {string} reportName - For context in the prompt
 * @returns {Promise<Object>} Structured JSON analysis
 */
const analyzeHealthText = async (pdfText, reportName = "Health Report") => {
  // Truncate to avoid token overflow — gemini-2.5-flash handles ~1M tokens
  // but we keep prompts tight for faster, cheaper responses
  const truncated = pdfText.slice(0, 12000);

  const prompt = `
Document: "${reportName}"

--- HEALTH DOCUMENT ---
${truncated}
--- END DOCUMENT ---

Analyze the above and respond ONLY with a valid JSON object.
`.trim();

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: `
You are VitaAI, an expert medical document analysis AI. Analyze health documents including lab reports, diabetes reports, and medical notes.

Respond ONLY with a valid JSON object — no markdown, no code fences, no preamble, no explanation.

Return exactly this structure:

{
  "summary": "2-3 sentence professional overview of the document's main findings",
  "keyFindings": [
    {
      "marker": "Test or marker name (e.g. HbA1c, Fasting Glucose, Blood Pressure)",
      "value": "Actual value from the document (e.g. 7.2%)",
      "normalRange": "Reference range (e.g. Below 5.7%)",
      "status": "Normal | Borderline | High | Low | Critical",
      "interpretation": "One plain sentence explaining this result"
    }
  ],
  "riskFactors": [
    "Specific risk identified in the document"
  ],
  "recommendations": [
    "Specific, actionable recommendation prioritized by importance"
  ],
  "severityLevel": "Low | Moderate | High | Critical",
  "warningSigns": [
    "Warning symptom to watch for and when to seek care"
  ],
  "simpleExplanation": "3-4 sentences in plain English for a non-medical person. No jargon. Focus on what this means for daily life.",
  "disclaimer": "This AI analysis is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional."
}

STRICT RULES:
- JSON only. Absolutely no extra text.
- keyFindings: 3–8 entries max, most clinically significant first
- For diabetes: prioritize HbA1c, fasting glucose, postprandial glucose, kidney markers
- severityLevel reflects overall health picture, not just one marker
- If a field's data isn't in the document, use null
- recommendations must be specific, not generic ("consult a doctor" is not enough)
`.trim(),
      temperature: 0.2,
      maxOutputTokens: 1500,
    },
  });

  // Strip any accidental markdown fences despite instructions
  const rawText = response.text.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("Gemini returned a non-JSON response. Please retry.");
  }

  // Validate required top-level fields
  const required = ["summary", "keyFindings", "riskFactors", "recommendations", "severityLevel"];
  for (const field of required) {
    if (!(field in parsed)) {
      throw new Error(`AI response missing required field: "${field}"`);
    }
  }

  return parsed;
};

module.exports = { analyzeHealthText };