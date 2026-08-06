const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const buildPromptForReport = () => `
You will receive a file (PDF or image).

Read it carefully and return ONLY valid JSON (no extra text).

STRICT RULES:
- Return ONLY JSON (no markdown, no explanation)
- Do NOT truncate output
- Ensure all strings are properly closed
- Always include at least 2 recommendations

FORMAT:
{
  "report_type": "type of report",
  "date": "report date",

  "key_findings": ["important findings"],

  "vitals": [
    {
      "name": "",
      "value": "",
      "normal_range": "",
      "status": "low | normal | high",
      "interpretation": ""
    }
  ],

  "risk_flags": ["risks"],

  "recommendations": ["at least 2 actionable recommendations"],

  "summary": "short conclusion",

  "confidence": "low | medium | high"
}
`;

function safeParseJSON(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    return JSON.parse(match[0]);
  } catch (err) {
    console.warn("⚠️ Safe JSON Parse Failed:", err.message);
    return null;
  }
}

async function analyzeFileBase64(fileBase64, mimeType = "application/pdf") {
  try {
    const contents = [
      {
        role: "user",
        parts: [
          { text: buildPromptForReport() },
          { inlineData: { mimeType, data: fileBase64 } }
        ]
      }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      generationConfig: {
        maxOutputTokens: 2048
      }
    });

    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("🧾 Gemini Raw Response:", rawText.slice(0, 200));

    const parsed = safeParseJSON(rawText);

    return {
      ok: !!parsed,
      type: parsed ? "SUCCESS" : "FALLBACK",

      parsed: parsed
        ? normalize(parsed)
        : buildFallback(rawText),

      meta: {
        rawPreview: rawText?.slice(0, 150) || "",
        length: rawText?.length || 0,
      }
    };
  } catch (err) {
    console.error("❌ Gemini AI Error:", err.message);
    return {
      ok: false,
      parsed: {
        title: "Error",
        date: "",
        summary: "Error analyzing report.",
        explanation_en: err.message,
        explanation_ro: "",
        suggested_questions: []
      },
      rawText: ""
    };
  }
}

function buildFallback(rawText) {
  return {
    report_type: "Unstructured Report",
    date: "",

    key_findings: [],
    vitals: [],
    risk_flags: [],

    recommendations: [
      "Consult a healthcare professional for proper evaluation",
      "Maintain a healthy diet and regular exercise"
    ],

    summary: rawText
      ? "AI returned unstructured response. Please review manually."
      : "No readable data found",

    confidence: "low"
  };
}

function normalize(data) {
  return {
    report_type: data.report_type || "Unknown Report",
    date: data.date || "",

    key_findings: Array.isArray(data.key_findings)
      ? data.key_findings
      : [],

    vitals: Array.isArray(data.vitals)
      ? data.vitals.map(v => {
        const statusRaw = (v.status || "").toLowerCase();

        let finalStatus = "normal";

        if (statusRaw.includes("high") || statusRaw.includes("elevated")) {
          finalStatus = "high";
        } else if (statusRaw.includes("low")) {
          finalStatus = "low";
        } else if (statusRaw.includes("normal")) {
          finalStatus = "normal";
        }

        return {
          name: v.name || "",
          value: v.value || "",
          normal_range: v.normal_range || "",
          status: finalStatus,
          interpretation: v.interpretation || ""
        };
      })
      : [],

    risk_flags: Array.isArray(data.risk_flags)
      ? data.risk_flags
      : [],

    recommendations: Array.isArray(data.recommendations)
      ? data.recommendations
      : [],

    summary: data.summary || "No significant findings",

    confidence: ["low", "medium", "high"].includes(data.confidence)
      ? data.confidence
      : "low"
  };
}

module.exports = { analyzeFileBase64 };
