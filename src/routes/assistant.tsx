import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Bot, User } from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/assistant")({
  head: () => ({ meta: [{ title: "AI Assistant — CareerPilot AI" }] }),
  component: Assistant,
});

const SUGGESTIONS = [
  "Review my skill gaps and suggest a 2-week focus plan",
  "Give me 3 STAR-format answers for product sense questions",
  "How do I tailor my resume for a Senior Product Designer role?",
  "What should I learn next based on my roadmap?",
];

const WELCOME: UIMessage = {
  id: "welcome",
  role: "assistant",
  parts: [
    {
      type: "text",
      text: "Hi Alex! I'm your CareerPilot AI coach. Ask me about your resume, skill gaps, roadmap, or interview prep — I'll tailor advice to your profile.",
    },
  ],
};

function Assistant() {
  const [input, setInput] = useState("");
  const transport = useRef(new DefaultChatTransport({ api: "/api/chat" })).current;
  const { messages, sendMessage, status } = useChat({
    id: "careerpilot-assistant",
    messages: [WELCOME],
    transport,
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const handleSend = async (text: string) => {
    const value = text.trim();
    if (!value || isLoading) return;
    setInput("");
    await sendMessage({ text: value });
  };

  return (
    <PageShell
      eyebrow="AI coach"
      title="Chat with CareerPilot AI"
      description="A career assistant that knows your profile, gaps, and roadmap — ask anything."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="card-surface flex h-[640px] flex-col overflow-hidden">
          <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-6">
            {messages.map((m) => {
              const text = m.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");
              const isUser = m.role === "user";
              return (
                <div key={m.id} className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                      isUser ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div
                    className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-background/60 border border-border text-foreground"
                    }`}
                  >
                    {text || (isLoading ? "…" : "")}
                  </div>
                </div>
              );
            })}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground">
                  Thinking…
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="border-t border-border bg-background/40 p-4"
          >
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(input);
                  }
                }}
                rows={1}
                placeholder="Ask about your career, skills, interviews…"
                className="min-h-[44px] flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="grid h-11 w-11 place-items-center rounded-lg bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>

        <aside className="space-y-3">
          <div className="card-surface p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-primary" /> Try asking
            </div>
            <div className="space-y-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-border bg-background/40 p-3 text-left text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="card-surface p-5 text-xs text-muted-foreground">
            <div className="mb-2 font-semibold text-foreground">Profile context</div>
            <ul className="space-y-1">
              <li>• Career score: 82</li>
              <li>• Skill match: 74%</li>
              <li>• Target: Senior Product Designer</li>
              <li>• Roadmap week: 3 / 8</li>
            </ul>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
