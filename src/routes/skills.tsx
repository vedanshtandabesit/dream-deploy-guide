import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, TrendingUp, AlertCircle } from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/skills")({
  head: () => ({ meta: [{ title: "Skill Analysis — CareerPilot AI" }] }),
  component: Skills,
});

const strengths = [
  { name: "Product Strategy", score: 92 },
  { name: "User Research", score: 88 },
  { name: "Figma", score: 85 },
  { name: "Stakeholder Comms", score: 81 },
];

const gaps = [
  { name: "Design Systems", score: 42, target: 80 },
  { name: "Motion & Prototyping", score: 35, target: 70 },
  { name: "Accessibility (WCAG)", score: 28, target: 75 },
];

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-background/60">
      <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  );
}

function Skills() {
  return (
    <PageShell eyebrow="Step 2 of 4" title="Your skill analysis" description="Benchmarked against 12,400 Senior Product Designer profiles.">
      <div className="mb-8 card-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Overall match for target role</div>
            <div className="mt-1 font-display text-4xl font-semibold">74<span className="text-primary">%</span></div>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary">
            <TrendingUp className="h-4 w-4" /> +12% potential with roadmap
          </div>
        </div>
        <div className="mt-4"><Bar value={74} color="bg-primary" /></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-6">
          <h2 className="text-lg font-semibold">Your strengths</h2>
          <div className="mt-4 space-y-4">
            {strengths.map((s) => (
              <div key={s.name}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span>{s.name}</span>
                  <span className="text-primary">{s.score}</span>
                </div>
                <Bar value={s.score} color="bg-primary" />
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <AlertCircle className="h-5 w-5 text-accent" /> Skill gaps
          </h2>
          <div className="mt-4 space-y-4">
            {gaps.map((s) => (
              <div key={s.name}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span>{s.name}</span>
                  <span className="text-muted-foreground">{s.score} → <span className="text-foreground">{s.target}</span></span>
                </div>
                <Bar value={s.score} color="bg-accent" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <Link to="/roadmap" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
        Build my roadmap <ArrowRight className="h-4 w-4" />
      </Link>
    </PageShell>
  );
}
