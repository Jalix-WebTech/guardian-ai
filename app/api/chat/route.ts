import { NextResponse } from "next/server";

type AIResponse = {
  level: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  condition: string;
  steps: string[];
};

/* SAFE JSON EXTRACTOR */
function extractJSON(text: string) {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
      return null;
    }

    const jsonString = text.slice(start, end + 1);

    return JSON.parse(jsonString);

  } catch {
    return null;
  }
}

function offlineEmergencyResponse(input: string): AIResponse {

  const text = input.toLowerCase();

  /* FIRE */
  if (
    text.includes("fire") ||
    text.includes("smoke") ||
    text.includes("burning")
  ) {
    return {
      level: "HIGH",
      condition: "Possible fire emergency detected",
      steps: [
        "Evacuate the area immediately",
        "Avoid smoke inhalation",
        "Call emergency services",
        "Do not use elevators",
      ],
    };
  }

  /* BLEEDING */
  if (
    text.includes("bleeding") ||
    text.includes("blood") ||
    text.includes("injury")
  ) {
    return {
      level: "HIGH",
      condition: "Possible severe bleeding detected",
      steps: [
        "Apply direct pressure to the wound",
        "Elevate injured area if possible",
        "Seek immediate medical assistance",
        "Keep the victim calm",
      ],
    };
  }

  /* DIZZINESS */
  if (
    text.includes("dizzy") ||
    text.includes("faint") ||
    text.includes("weak")
  ) {
    return {
      level: "MEDIUM",
      condition: "Possible dizziness or fainting episode",
      steps: [
        "Sit or lie down immediately",
        "Drink water slowly",
        "Rest in a cool environment",
        "Seek help if symptoms worsen",
      ],
    };
  }

  /* CHOKING */
  if (
    text.includes("choking") ||
    text.includes("can't breathe") ||
    text.includes("cannot breathe")
  ) {
    return {
      level: "HIGH",
      condition: "Possible choking emergency detected",
      steps: [
        "Encourage coughing if possible",
        "Perform abdominal thrusts if trained",
        "Call emergency services immediately",
        "Monitor breathing continuously",
      ],
    };
  }

  /* DEFAULT */
  return {
    level: "UNKNOWN",
    condition: "Emergency situation unclear",
    steps: [
      "Stay calm",
      "Move to a safe area",
      "Seek nearby assistance",
      "Provide more details if possible",
    ],
  };
}

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const message = body.message;

    if (!message) {
      return NextResponse.json(
        {
          error: "Message is required",
        },
        {
          status: 400,
        }
      );
    }

    console.log("USER MESSAGE:", message);

    /* ENVIRONMENT DEBUG */
    console.log("ENV CHECK:", {
      keyExists: !!process.env.OPENROUTER_API_KEY,
      keyPreview:
        process.env.OPENROUTER_API_KEY?.slice(0, 15),
    });

    /* OPENROUTER REQUEST */
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

No markdown.
No explanations.
No extra text.

Required format:

{
  "level": "LOW | MEDIUM | HIGH | UNKNOWN",
  "condition": "short description",
  "steps": ["step 1", "step 2", "step 3"]
}

Rules:
- Always return valid JSON
- steps must always be an array of strings
- level must always exist
- condition must always exist
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

    /* RESPONSE DEBUGGING */
    console.log("STATUS:", response.status);

    console.log("OK?:", response.ok);

    const data = await response.json();

    console.log(
      "OPENROUTER RESPONSE:",
      JSON.stringify(data, null, 2)
    );

    /* HANDLE OPENROUTER ERRORS */
    if (data?.error) {

      console.error(
        "OPENROUTER ERROR:",
        data.error
      );

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

    /* GET AI TEXT */
    const rawText =
      data?.choices?.[0]?.message?.content;

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

    /* SAFE JSON PARSING */
    let parsed: AIResponse | null =
      extractJSON(rawText);

    if (!parsed) {

      console.error(
        "INVALID AI OUTPUT:",
        rawText
      );

      parsed = {
        level: "UNKNOWN",

        condition:
          "Invalid AI response format",

        steps: [
          "Rephrase request",
          "Try again",
          "System recovery mode",
        ],
      };
    }

    /* SAFETY NORMALIZATION */
    parsed = {
      level: parsed.level || "UNKNOWN",

      condition:
        parsed.condition ||
        "No condition detected",

      steps: Array.isArray(parsed.steps)
        ? parsed.steps
        : [],
    };

    /* FINAL RESPONSE */
    return NextResponse.json({
      response: parsed,
    });

  } catch (error) {

    console.error("API ERROR:", error);

    return NextResponse.json(
      {
        response: {
          level: "UNKNOWN",

          condition:
            "System failure occurred",

          steps: [
            "Restart server",
            "Check logs",
            "Try again",
          ],
        },
      },
      {
        status: 500,
      }
    );
  }
}