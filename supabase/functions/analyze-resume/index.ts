// Analyze a resume against a target role using Lovable AI Gateway.
// Returns { currentSkills, missingSkills, roadmap, matchScore }.

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are a senior career coach. Given a resume and a target role, respond with STRICT JSON only (no markdown, no prose) matching this TypeScript type:

{
  "matchScore": number,          // 0-100 overall fit
  "currentSkills": { "name": string, "score": number }[], // 5-8 items, score 0-100
  "missingSkills": { "name": string, "priority": "High" | "Medium" | "Low", "reason": string }[], // 4-6 items
  "roadmap": {
    "month": string,             // e.g. "Month 1"
    "focus": string,             // short theme
    "items": string[]            // 3-4 concrete actions
  }[]                            // exactly 3 months
}

Be specific to the target role. Do not include any text outside the JSON.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const { resumeText, targetRole } = await req.json();

    if (typeof resumeText !== "string" || typeof targetRole !== "string" || resumeText.trim().length < 20 || targetRole.trim().length < 2) {
      return new Response(JSON.stringify({ error: "Invalid input: resumeText and targetRole required." }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI gateway not configured." }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Target role: ${targetRole}\n\nResume:\n${resumeText.slice(0, 12000)}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI gateway error", aiRes.status, errText);
      return new Response(JSON.stringify({ error: "AI request failed", status: aiRes.status }), {
        status: 502,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const content: string = aiJson?.choices?.[0]?.message?.content ?? "{}";

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("analyze-resume error", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
