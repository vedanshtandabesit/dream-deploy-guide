import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { z } from "zod";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/upload")({
  head: () => ({ meta: [{ title: "Resume Upload — CareerPilot AI" }] }),
  component: UploadPage,
});

const resumeSchema = z.object({
  target_role: z.string().trim().min(2, "Enter your target role").max(120, "Keep it under 120 characters"),
  resume_text: z.string().trim().min(50, "Paste at least 50 characters of resume text").max(20000, "Resume text is too long (max 20,000 chars)"),
});

function UploadPage() {
  const navigate = useNavigate();
  const [targetRole, setTargetRole] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const parsed = resumeSchema.safeParse({ target_role: targetRole, resume_text: resumeText });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setSubmitting(true);
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData.user) {
        setError("You must be signed in to save your resume.");
        setSubmitting(false);
        return;
      }

      const { error: insertErr } = await supabase.from("resumes").insert({
        user_id: userData.user.id,
        target_role: parsed.data.target_role,
        resume_text: parsed.data.resume_text,
      });

      if (insertErr) {
        setError(insertErr.message);
        setSubmitting(false);
        return;
      }

      // Stash payload so /skills can call the analyze-resume edge function.
      try {
        sessionStorage.setItem(
          "careerpilot_pending_analysis",
          JSON.stringify({ resumeText: parsed.data.resume_text, targetRole: parsed.data.target_role }),
        );
      } catch {
        // sessionStorage unavailable — /skills will fall back to defaults.
      }

      setSuccess(true);
      navigate({ to: "/skills" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <PageShell eyebrow="Step 1 of 4" title="Resume Upload" description="Tell us the role you're targeting and paste your resume text. We'll save it securely to your account.">
      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="lg:col-span-2 card-surface p-6 space-y-5">
          <div>
            <label htmlFor="target_role" className="block text-sm font-medium mb-2">Target Career Role</label>
            <input
              id="target_role"
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              maxLength={120}
              className="w-full rounded-lg border border-border bg-background/40 px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="resume_text" className="block text-sm font-medium mb-2">Resume Text</label>
            <textarea
              id="resume_text"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your full resume here…"
              rows={14}
              maxLength={20000}
              className="w-full rounded-lg border border-border bg-background/40 px-4 py-3 text-sm outline-none focus:border-primary resize-y"
            />
            <p className="mt-1 text-xs text-muted-foreground">{resumeText.length.toLocaleString()} / 20,000 characters</p>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
          {success && (
            <div className="rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Resume saved.
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <>Save resume <ArrowRight className="h-4 w-4" /></>}
            </button>
            {success && (
              <button
                type="button"
                onClick={() => navigate({ to: "/skills" })}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold hover:bg-surface"
              >
                Analyze skills <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>

        <aside className="card-surface p-6">
          <h3 className="font-semibold">What we look for</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {[
              "Experience and impact statements",
              "Technical and soft skills",
              "Education and certifications",
              "Leadership and ownership signals",
              "Keyword match to target roles",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {t}
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-lg border border-border bg-background/40 p-4 text-xs text-muted-foreground">
            <FileText className="mb-2 h-4 w-4 text-primary" />
            Your resume stays private. Row-level security ensures only you can read your saved resumes.
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
