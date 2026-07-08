import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingUp, Target, BookOpen, Award, ArrowUpRight, CalendarPlus, CalendarDays, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
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

// Dashboard state — missing skills that will feed the scheduler.
const DASHBOARD_MISSING_SKILLS = [
  { name: "Design Systems", priority: "high" },
  { name: "TypeScript Advanced Patterns", priority: "high" },
  { name: "System Design", priority: "medium" },
  { name: "Product Analytics (SQL)", priority: "medium" },
  { name: "User Research Methods", priority: "low" },
];

const DAY_OPTIONS = [
  { v: 1, l: "Mon" },
  { v: 2, l: "Tue" },
  { v: 3, l: "Wed" },
  { v: 4, l: "Thu" },
  { v: 5, l: "Fri" },
  { v: 6, l: "Sat" },
  { v: 0, l: "Sun" },
];

type StudySlot = {
  date: string;
  dayName: string;
  start: string;
  end: string;
  durationMin: number;
  skill: string;
  priority: string;
};

function fmt12(t: string) {
  const [h, m] = t.split(":").map(Number);
  const p = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, "0")} ${p}`;
}

function toGCalDate(date: string, time: string) {
  // Local time -> "YYYYMMDDTHHMMSS" (floating time, no Z)
  return `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;
}

function googleCalendarUrl(slot: StudySlot) {
  const title = `Upskill: ${slot.skill}`;
  const details = `Dedicated study session for ${slot.skill}. Scheduled by CareerPilot AI Smart Scheduler.`;
  const dates = `${toGCalDate(slot.date, slot.start)}/${toGCalDate(slot.date, slot.end)}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    details,
    dates,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function priorityBadge(p: string) {
  if (p === "high") return "border-red-500/30 bg-red-500/10 text-red-500";
  if (p === "medium") return "border-amber-500/30 bg-amber-500/10 text-amber-500";
  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-500";
}

function SmartScheduler() {
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("16:00");
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState<StudySlot[] | null>(null);

  function toggleDay(d: number) {
    setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d].sort()));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (days.length === 0) {
      toast.error("Pick at least one busy day.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("smart-schedule", {
        body: {
          busySlots: [{ days, start, end }],
          missingSkills: DASHBOARD_MISSING_SKILLS,
          daysAhead: 7,
        },
      });
      if (error) throw error;
      setSlots((data?.studySlots ?? []) as StudySlot[]);
      toast.success("Weekly study plan generated.");
    } catch (err) {
      console.error(err);
      toast.error("Could not generate schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Group slots by date for the calendar view
  const grouped = (slots ?? []).reduce<Record<string, StudySlot[]>>((acc, s) => {
    (acc[s.date] ||= []).push(s);
    return acc;
  }, {});

  return (
    <div className="card-surface p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Smart Scheduler</h2>
        </div>
        <span className="text-xs text-muted-foreground">
          Turns your class hours into a personalized upskilling plan.
        </span>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-background/40 p-4">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Busy college days
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {DAY_OPTIONS.map((d) => {
            const on = days.includes(d.v);
            return (
              <button
                type="button"
                key={d.v}
                onClick={() => toggleDay(d.v)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  on
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface text-muted-foreground hover:text-foreground"
                }`}
              >
                {d.l}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto]">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Class start
            </label>
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="hidden items-end pb-2 text-muted-foreground sm:flex">→</div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Class end
            </label>
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Planning…" : "Generate plan"}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Weekly Study Plan</h3>
        {!slots ? (
          <div className="grid place-items-center rounded-lg border border-dashed border-border py-12 text-center">
            <CalendarDays className="mb-2 h-7 w-7 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Save your busy slots to see a 7-day study calendar.
            </p>
          </div>
        ) : slots.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No free windows found this week — try shrinking your busy block.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Object.entries(grouped).map(([date, list]) => {
              const d = new Date(`${date}T00:00:00`);
              return (
                <div key={date} className="rounded-lg border border-border bg-background/40 p-4">
                  <div className="flex items-baseline justify-between">
                    <div className="font-semibold">{list[0].dayName}</div>
                    <div className="text-xs text-muted-foreground">
                      {d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </div>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {list.map((s) => (
                      <li
                        key={s.date + s.start + s.skill}
                        className="rounded-md border border-border bg-surface p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">{s.skill}</div>
                            <div className="text-xs text-muted-foreground">
                              {fmt12(s.start)} – {fmt12(s.end)} · {Math.round(s.durationMin / 60 * 10) / 10}h
                            </div>
                          </div>
                          <span
                            className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase ${priorityBadge(s.priority)}`}
                          >
                            {s.priority}
                          </span>
                        </div>
                        <a
                          href={googleCalendarUrl(s)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/20"
                        >
                          <CalendarPlus className="h-3.5 w-3.5" /> Add to Google Calendar
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

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

      <div className="mt-8">
        <SmartScheduler />
      </div>
    </PageShell>
  );
}
