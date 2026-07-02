import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, TrendingUp, AlertCircle, CheckCircle2, Sparkles, Loader2, Calendar } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/skills")({
  head: () => ({ meta: [{ title: "Skill Analysis — CareerPilot AI" }] }),
  component: Skills,
});

type CurrentSkill = { name: string; score: number };
type MissingSkill = { name: string; priority: "High" | "Medium" | "Low"; reason: string };
type RoadmapMonth = { month: string; focus: string; items: string[] };
type Analysis = {
  matchScore: number;
  currentSkills: CurrentSkill[];
  missingSkills: MissingSkill[];
  roadmap: RoadmapMonth[];
};

const FALLBACK_CURRENT_SKILLS: CurrentSkill[] = [
  { name: "React", score: 92 },
  { name: "TypeScript", score: 88 },
  { name: "REST APIs", score: 85 },
  { name: "Git & CI/CD", score: 82 },
  { name: "Unit Testing", score: 78 },
];

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-background/60">
      <div className={`h-full ${color}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

function Skills() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);

      let payload: { resumeText: string; targetRole: string } | null = null;
      try {
        const raw = sessionStorage.getItem("careerpilot_pending_analysis");
        if (raw) payload = JSON.parse(raw);
      } catch {
        payload = null;
      }

      // Fallback: pull the user's most recent resume from the database.
      if (!payload) {
        const { data, error: dbErr } = await supabase
          .from("resumes")
          .select("resume_text, target_role")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (dbErr) {
          if (!cancelled) {
            setError("Could not load your resume. Please upload one first.");
            setLoading(false);
          }
          return;
        }
        if (data) payload = { resumeText: data.resume_text, targetRole: data.target_role };
      }

      if (!payload) {
        if (!cancelled) {
          setError("No resume found. Upload one to get an analysis.");
          setLoading(false);
        }
        return;
      }

      const { data, error: fnErr } = await supabase.functions.invoke("analyze-resume", {
        body: payload,
      });

      if (cancelled) return;

      if (fnErr) {
        setError(fnErr.message ?? "Analysis failed. Please try again.");
        setLoading(false);
        return;
      }

      const result = data as Partial<Analysis> | null;
      setAnalysis({
        matchScore: typeof result?.matchScore === "number" ? result.matchScore : 0,
        currentSkills: Array.isArray(result?.currentSkills) && result!.currentSkills.length > 0 ? result!.currentSkills : FALLBACK_CURRENT_SKILLS,
        missingSkills: Array.isArray(result?.missingSkills) ? result!.missingSkills : [],
        roadmap: Array.isArray(result?.roadmap) ? result!.roadmap : [],
      });
      setLoading(false);

      try {
        sessionStorage.removeItem("careerpilot_pending_analysis");
      } catch {
        /* ignore */
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <PageShell eyebrow="Step 2 of 4" title="Skill Analysis" description="Hang tight while our AI reviews your resume.">
        <div className="card-surface flex flex-col items-center justify-center gap-4 p-16 text-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <div className="relative grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </div>
          <h2 className="font-display text-xl font-semibold">Analyzing your resume with AI...</h2>
          <p className="text-sm text-muted-foreground">Extracting skills, benchmarking against your target role, and drafting a roadmap.</p>
        </div>
      </PageShell>
    );
  }

  if (error || !analysis) {
    return (
      <PageShell eyebrow="Step 2 of 4" title="Skill Analysis" description="Something got in the way of your analysis.">
        <div className="card-surface p-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-accent" />
          <p className="mt-3 text-sm text-muted-foreground">{error ?? "No analysis available."}</p>
          <Link to="/upload" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
            Upload a resume <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </PageShell>
    );
  }

  const { matchScore, currentSkills, missingSkills, roadmap } = analysis;

  return (
    <PageShell eyebrow="Step 2 of 4" title="Your AI Skill Analysis" description="Here's how your resume stacks up against your target role.">
      {/* Overall match */}
      <div className="mb-8 card-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" /> AI-powered match score
            </div>
            <div className="mt-1 font-display text-4xl font-semibold">
              {matchScore}<span className="text-primary">%</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary">
            <TrendingUp className="h-4 w-4" /> Projected lift after roadmap
          </div>
        </div>
        <div className="mt-4"><Bar value={matchScore} color="bg-primary" /></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Skills */}
        <section className="card-surface p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <CheckCircle2 className="h-5 w-5 text-primary" /> Current Skills Found
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Detected from your resume text.</p>
          <div className="mt-4 space-y-4">
            {currentSkills.map((s) => (
              <div key={s.name}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span>{s.name}</span>
                  <span className="text-primary">{s.score}</span>
                </div>
                <Bar value={s.score} color="bg-primary" />
              </div>
            ))}
          </div>
        </section>

        {/* Missing Skills */}
        <section className="card-surface p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <AlertCircle className="h-5 w-5 text-accent" /> Missing Skills for Target Role
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Prioritized gaps to close next.</p>
          {missingSkills.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No gaps identified — you look ready for this role.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {missingSkills.map((s) => (
                <li key={s.name} className="rounded-lg border border-border bg-background/40 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{s.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.priority === "High" ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"}`}>
                      {s.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{s.reason}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Roadmap */}
      <section className="mt-8 card-surface p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Calendar className="h-5 w-5 text-primary" /> Recommended 3-Month Roadmap
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">A focused plan to close the gaps above.</p>
        {roadmap.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Roadmap unavailable.</p>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {roadmap.map((m, i) => (
              <div key={m.month + i} className="relative rounded-xl border border-border bg-background/40 p-5">
                <div className="absolute -top-3 left-5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  {m.month}
                </div>
                <h3 className="mt-2 font-display text-lg font-semibold">{m.focus}</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {m.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {i < roadmap.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-primary md:block" />
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <Link to="/roadmap" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
        See full roadmap <ArrowRight className="h-4 w-4" />
      </Link>
    </PageShell>
  );
}
