import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

const SYSTEM_PROMPT = `You are CareerPilot AI, a friendly career coach for students and early-career professionals.
You help with: resume feedback, skill-gap analysis, learning roadmaps, interview prep, and career direction.
Be concise, encouraging, and concrete. Use short markdown lists when listing steps or tips.
When asked about the student's data, you can reference these sample stats:
- Career score: 82 (+6)
- Skill match: 74% (target role: Senior Product Designer, 88% match)
- Top strengths: Visual Design (92), Prototyping (88), User Research (80)
- Skill gaps: Design Systems (54 → 80), Motion Design (40 → 70), SQL for Product (35 → 65)
- Roadmap: 8 weeks, currently week 3 (Design Systems foundations)
- Last mock interview: behavioral round 7.4/10`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: UIMessage[] };
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
