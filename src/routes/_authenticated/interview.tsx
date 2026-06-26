import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessagesSquare, ChevronDown, Sparkles } from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/_authenticated/interview")({
  head: () => ({ meta: [{ title: "Interview Questions — CareerPilot AI" }] }),
  component: Interview,
});

const categories = ["Behavioral", "Product Sense", "Design Critique", "System Design"] as const;

const questions = [
  { cat: "Behavioral", q: "Tell me about a time you had to influence without authority.", tip: "Use STAR. Highlight stakeholder mapping and the trade-off you negotiated." },
  { cat: "Behavioral", q: "Describe a project that failed. What did you learn?", tip: "Own the failure, share concrete learnings, then show how you applied them." },
  { cat: "Product Sense", q: "How would you redesign airport check-in for accessibility?", tip: "Clarify users, list pain points, then 2–3 prioritized solutions with metrics." },
  { cat: "Product Sense", q: "Pick a product you love. What would you change and why?", tip: "Identify a clear user job-to-be-done and tie changes to that JTBD." },
  { cat: "Design Critique", q: "Walk us through your portfolio's strongest case study.", tip: "Problem → constraints → process → impact. Quantify outcomes wherever possible." },
  { cat: "System Design", q: "Design a notification system for a multi-tenant SaaS app.", tip: "Cover channels, preferences, throttling, observability, and failure modes." },
];

function Interview() {
  const [active, setActive] = useState<typeof categories[number]>("Behavioral");
  const [open, setOpen] = useState<string | null>(null);
  const filtered = questions.filter((q) => q.cat === active);

  return (
    <PageShell eyebrow="Step 4 of 4" title="Interview prep" description="AI-curated questions for your target role with tactical answer frameworks.">
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`rounded-full border px-4 py-2 text-sm transition ${active === c ? "border-primary bg-primary/10 text-primary" : "border-border bg-surface text-muted-foreground hover:text-foreground"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((q) => {
          const isOpen = open === q.q;
          return (
            <div key={q.q} className="card-surface overflow-hidden">
              <button onClick={() => setOpen(isOpen ? null : q.q)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
                <div className="flex items-start gap-3">
                  <MessagesSquare className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="font-medium">{q.q}</span>
                </div>
                <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="border-t border-border bg-background/40 p-5">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium text-primary">
                    <Sparkles className="h-3.5 w-3.5" /> AI coaching tip
                  </div>
                  <p className="text-sm text-muted-foreground">{q.tip}</p>
                  <button className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90">
                    Practice with AI
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
