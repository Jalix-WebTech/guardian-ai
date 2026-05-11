
console.log("ENV KEY:", process.env.OPENROUTER_API_KEY);

import { NextResponse } from "next/server";

type AIResponse = {
  level: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  condition: string;
  steps: string[];
};

// Safe JSON extractor (handles messy AI output)
function extractJSON(text: string) {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) return null;

    const jsonString = text.slice(start, end + 1);
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    console.log("USER MESSAGE:", message);

    console.log("API KEY EXISTS:", !!process.env.OPENROUTER_API_KEY);

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.1-8b-instruct",
          messages: [
            {
              role: "system",
              content: `
You are Guardian AI, an emergency response assistant.

You MUST return ONLY valid JSON.

No explanations. No markdown. No text outside JSON.

Required format:
{
  "level": "LOW | MEDIUM | HIGH | UNKNOWN",
  "condition": "short description",
  "steps": ["step 1", "step 2", "step 3"]
}

Rules:
- Always return valid JSON
- steps must always be an array of strings
- if unsure, still return best possible JSON
              `,
            },
            {
              role: "user",
              content: message,
            },
          ],
        }),
      }
    );

    // 🔥 DEBUG HTTP STATUS
    console.log("STATUS:", response.status);
    console.log("OK?:", response.ok);

    const data = await response.json();

    // 🔥 FULL DEBUG OUTPUT
    console.log(
      "OPENROUTER RESPONSE:",
      JSON.stringify(data, null, 2)
    );

    // ❌ HANDLE API ERROR
    if (data?.error) {
      console.error("OPENROUTER ERROR:", data.error);

      return NextResponse.json({
        response: {
          level: "UNKNOWN",
          condition: "AI request failed",
          steps: [
            "Check API key",
            "Check model availability",
            "Retry request",
          ],
        },
      });
    }

    const rawText = data?.choices?.[0]?.message?.content;

    if (!rawText) {
      return NextResponse.json({
        response: {
          level: "UNKNOWN",
          condition: "No response from AI model",
          steps: [
            "Try again",
            "Check model/API key",
            "Retry request",
          ],
        } as AIResponse,
      });
    }

    // 🔥 SAFE JSON PARSING
    let parsed: AIResponse | null = extractJSON(rawText);

    if (!parsed) {
      console.error("INVALID AI OUTPUT:", rawText);

      parsed = {
        level: "UNKNOWN",
        condition: "Invalid AI response format",
        steps: [
          "Rephrase request",
          "Try again",
          "System recovery mode",
        ],
      };
    }

    // 🔥 NORMALIZATION LAYER
    parsed = {
      level: parsed.level || "UNKNOWN",
      condition: parsed.condition || "No condition detected",
      steps: Array.isArray(parsed.steps) ? parsed.steps : [],
    };

    return NextResponse.json({
      response: parsed,
    });
  } catch (error) {
    console.error("API ERROR:", error);

    return NextResponse.json(
      {
        response: {
          level: "UNKNOWN",
          condition: "System failure occurred",
          steps: [
            "Restart server",
            "Check logs",
            "Try again",
          ],
        },
      },
      { status: 500 }
    );
  }
}

console.log("ENV CHECK:", {
  keyExists: !!process.env.OPENROUTER_API_KEY,
  keyPreview: process.env.OPENROUTER_API_KEY?.slice(0, 10),
});