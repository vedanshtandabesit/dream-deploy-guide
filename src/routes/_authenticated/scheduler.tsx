import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bell, CalendarDays, Clock, Sparkles } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/scheduler")({
  head: () => ({ meta: [{ title: "Smart Scheduler — CareerPilot AI" }] }),
  component: Scheduler,
});

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
type Day = (typeof DAYS)[number];

const MISSING_SKILLS = [
  { name: "Design Systems", duration: 2 },
  { name: "TypeScript Advanced Patterns", duration: 1 },
  { name: "System Design", duration: 2 },
  { name: "Product Analytics (SQL)", duration: 1 },
  { name: "User Research Methods", duration: 1 },
];

type DaySchedule = { enabled: boolean; start: string; end: string };

const DEFAULT_SCHEDULE: Record<Day, DaySchedule> = {
  Monday: { enabled: true, start: "09:00", end: "16:00" },
  Tuesday: { enabled: true, start: "09:00", end: "16:00" },
  Wednesday: { enabled: true, start: "09:00", end: "16:00" },
  Thursday: { enabled: true, start: "09:00", end: "16:00" },
  Friday: { enabled: true, start: "09:00", end: "16:00" },
  Saturday: { enabled: false, start: "10:00", end: "14:00" },
  Sunday: { enabled: false, start: "10:00", end: "14:00" },
};

function addHours(time: string, hours: number) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + hours * 60;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

function fmt(time: string) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, "0")} ${period}`;
}

function Scheduler() {
  const [schedule, setSchedule] = useState<Record<Day, DaySchedule>>(DEFAULT_SCHEDULE);
  const [savedSchedule, setSavedSchedule] = useState<Record<Day, DaySchedule> | null>(null);

  const studyPlan = useMemo(() => {
    if (!savedSchedule) return null;
    const plan: Record<Day, { skill: string; start: string; end: string; duration: number }[]> = {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [],
    };
    let skillIdx = 0;
    DAYS.forEach((day) => {
      const d = savedSchedule[day];
      if (!d.enabled) return;
      // Study starts 30 min after classes end
      const studyStart = addHours(d.end, 0.5);
      const skill = MISSING_SKILLS[skillIdx % MISSING_SKILLS.length];
      skillIdx++;
      plan[day].push({
        skill: skill.name,
        start: studyStart,
        end: addHours(studyStart, skill.duration),
        duration: skill.duration,
      });
      // Weekends get 2 sessions
      if (day === "Saturday" || day === "Sunday") {
        const s2 = MISSING_SKILLS[skillIdx % MISSING_SKILLS.length];
        skillIdx++;
        const start2 = addHours(studyStart, skill.duration + 1);
        plan[day].push({
          skill: s2.name,
          start: start2,
          end: addHours(start2, s2.duration),
          duration: s2.duration,
        });
      }
    });
    return plan;
  }, [savedSchedule]);

  function updateDay(day: Day, patch: Partial<DaySchedule>) {
    setSchedule((s) => ({ ...s, [day]: { ...s[day], ...patch } }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSavedSchedule(schedule);
    toast.success("Timetable saved — your weekly study plan is ready.");
  }

  function setReminder(day: Day, skill: string, start: string) {
    toast.success(`Reminder set for ${skill}`, {
      description: `${day} at ${fmt(start)}`,
    });
  }

  return (
    <PageShell
      eyebrow="Smart Scheduler"
      title="Plan study around your classes"
      description="Enter your college timetable and we'll build a weekly study plan targeting the missing skills from your roadmap."
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <form onSubmit={handleSave} className="card-surface p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Class timings</h2>
          </div>
          <div className="space-y-3">
            {DAYS.map((day) => {
              const d = schedule[day];
              return (
                <div key={day} className="rounded-lg border border-border bg-background/40 p-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={d.enabled}
                        onChange={(e) => updateDay(day, { enabled: e.target.checked })}
                        className="h-4 w-4 rounded border-border accent-primary"
                      />
                      {day}
                    </label>
                    {!d.enabled && <span className="text-xs text-muted-foreground">No classes</span>}
                  </div>
                  {d.enabled && (
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <input
                        type="time"
                        value={d.start}
                        onChange={(e) => updateDay(day, { start: e.target.value })}
                        className="flex-1 rounded-md border border-border bg-background px-2 py-1.5"
                      />
                      <span className="text-muted-foreground">to</span>
                      <input
                        type="time"
                        value={d.end}
                        onChange={(e) => updateDay(day, { end: e.target.value })}
                        className="flex-1 rounded-md border border-border bg-background px-2 py-1.5"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <button
            type="submit"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <Sparkles className="h-4 w-4" /> Generate Study Plan
          </button>
        </form>

        <div className="lg:col-span-3">
          <div className="card-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Weekly Study Plan</h2>
              </div>
              {studyPlan && (
                <span className="text-xs text-muted-foreground">Skills from your roadmap</span>
              )}
            </div>

            {!studyPlan ? (
              <div className="grid place-items-center rounded-lg border border-dashed border-border py-16 text-center">
                <CalendarDays className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Save your timetable to see recommended study slots.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {DAYS.map((day) => {
                  const slots = studyPlan[day];
                  const cls = savedSchedule![day];
                  return (
                    <div key={day} className="rounded-lg border border-border bg-background/40 p-4">
                      <div className="flex items-baseline justify-between">
                        <h3 className="font-semibold">{day}</h3>
                        {cls.enabled ? (
                          <span className="text-xs text-muted-foreground">
                            Class {fmt(cls.start)}–{fmt(cls.end)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Free day</span>
                        )}
                      </div>
                      {slots.length === 0 ? (
                        <p className="mt-3 text-xs text-muted-foreground">Rest day — no scheduled study.</p>
                      ) : (
                        <ul className="mt-3 space-y-2">
                          {slots.map((s) => (
                            <li
                              key={s.skill + s.start}
                              className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-2"
                            >
                              <div className="min-w-0">
                                <div className="truncate text-sm font-medium">{s.skill}</div>
                                <div className="text-xs text-muted-foreground">
                                  {fmt(s.start)} – {fmt(s.end)} · {s.duration}h
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setReminder(day, s.skill, s.start)}
                                className="inline-flex shrink-0 items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/20"
                              >
                                <Bell className="h-3.5 w-3.5" /> Set Reminder
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
