import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, Clock, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/_authenticated/roadmap")({
  head: () => ({ meta: [{ title: "Roadmap — CareerPilot AI" }] }),
  component: Roadmap,
});

const milestones = [
  {
    week: "Weeks 1–2", title: "Master Design Systems", status: "done" as const,
    items: ["Atomic design principles", "Build a token-based theme", "Audit existing component library"],
  },
  {
    week: "Weeks 3–4", title: "Advanced Prototyping", status: "active" as const,
    items: ["Smart animate & variables in Figma", "Interactive prototypes for usability tests", "Handoff with motion specs"],
  },
  {
    week: "Weeks 5–6", title: "Accessibility deep-dive", status: "todo" as const,
    items: ["WCAG 2.2 essentials", "Color contrast & semantic markup", "Screen reader testing"],
  },
  {
    week: "Weeks 7–8", title: "Portfolio + Interview prep", status: "todo" as const,
    items: ["Refresh 2 case studies", "Mock interviews × 4", "Salary negotiation playbook"],
  },
];

const statusStyle = {
  done: { icon: CheckCircle2, ring: "border-primary bg-primary/10 text-primary", label: "Complete" },
  active: { icon: Clock, ring: "border-accent bg-accent/10 text-accent", label: "In progress" },
  todo: { icon: Circle, ring: "border-border bg-surface text-muted-foreground", label: "Upcoming" },
};

function Roadmap() {
  return (
    <PageShell eyebrow="Step 3 of 4" title="Your 8-week roadmap" description="A personalized plan to close your gaps and reach a 86% match.">
      <div className="relative">
        <div className="absolute left-5 top-2 bottom-2 w-px bg-border md:left-6" />
        <div className="space-y-6">
          {milestones.map((m) => {
            const s = statusStyle[m.status];
            return (
              <div key={m.title} className="relative pl-14 md:pl-16">
                <div className={`absolute left-0 top-1 grid h-10 w-10 place-items-center rounded-full border ${s.ring} md:h-12 md:w-12`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="card-surface p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">{m.week}</div>
                      <h3 className="mt-1 text-xl font-semibold">{m.title}</h3>
                    </div>
                    <span className="rounded-full bg-background/60 px-3 py-1 text-xs text-muted-foreground">{s.label}</span>
                  </div>
                  <ul className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                    {m.items.map((i) => (
                      <li key={i} className="rounded-lg border border-border bg-background/40 p-3">{i}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Link to="/interview" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
        Practice interviews <ArrowRight className="h-4 w-4" />
      </Link>
    </PageShell>
  );
}
