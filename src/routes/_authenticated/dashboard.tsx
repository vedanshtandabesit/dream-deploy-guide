import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingUp, Target, BookOpen, Award, ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CareerPilot AI" }] }),
  component: Dashboard,
});

const stats = [
  { label: "Career score", value: "82", delta: "+6", icon: Award },
  { label: "Skill match", value: "74%", delta: "+12%", icon: Target },
  { label: "Roadmap progress", value: "38%", delta: "+5%", icon: TrendingUp },
  { label: "Lessons done", value: "14", delta: "+3", icon: BookOpen },
];

const activity = [
  { t: "Resume analyzed", d: "Senior Product Designer match: 88%", time: "2h ago" },
  { t: "Skill gap detected", d: "Add 'Design Systems' for +9% match", time: "1d ago" },
  { t: "Lesson completed", d: "Intro to Figma Variables", time: "2d ago" },
  { t: "Mock interview", d: "Behavioral round — score 7.4/10", time: "4d ago" },
];

function Dashboard() {
  return (
    <PageShell eyebrow="Welcome back, Alex" title="Your career dashboard" description="Track your growth, gaps, and next best actions.">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card-surface p-5">
            <div className="flex items-center justify-between">
              <s.icon className="h-5 w-5 text-primary" />
              <span className="text-xs text-primary">{s.delta}</span>
            </div>
            <div className="mt-4 font-display text-3xl font-semibold">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="card-surface p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent activity</h2>
            <Link to="/roadmap" className="text-sm text-primary inline-flex items-center gap-1">View roadmap <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </div>
          <ul className="mt-4 divide-y divide-border">
            {activity.map((a) => (
              <li key={a.t} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">{a.t}</div>
                  <div className="text-sm text-muted-foreground">{a.d}</div>
                </div>
                <span className="text-xs text-muted-foreground">{a.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-surface p-6">
          <h2 className="text-lg font-semibold">Next best actions</h2>
          <div className="mt-4 space-y-3">
            {[
              { to: "/upload", label: "Re-upload resume for fresh scoring" },
              { to: "/skills", label: "Close 3 skill gaps this week" },
              { to: "/interview", label: "Practice product sense round" },
            ].map((a) => (
              <Link key={a.to} to={a.to} className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-3 text-sm transition hover:border-primary/50">
                {a.label}
                <ArrowUpRight className="h-4 w-4 text-primary" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
