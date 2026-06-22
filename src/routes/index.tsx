import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Brain, FileText, Map, MessagesSquare, Sparkles, Target } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareerPilot AI — Navigate your career with AI" },
      { name: "description", content: "Upload your resume, uncover skill gaps, and follow a personalized roadmap to your next role." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: FileText, title: "Resume intelligence", desc: "Parse and score your resume against your dream role in seconds." },
  { icon: Brain, title: "Skill analysis", desc: "Surface strengths and skill gaps benchmarked against the market." },
  { icon: Map, title: "Personal roadmap", desc: "Get a week-by-week learning plan tailored to your goals." },
  { icon: MessagesSquare, title: "Interview prep", desc: "Practice with role-specific questions and instant feedback." },
];

function Landing() {
  return (
    <main>
      <section className="glow relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-20 md:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Powered by Lovable AI
            </div>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight md:text-7xl">
              Your AI copilot for the <span className="text-primary">career you want</span>.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              CareerPilot AI reads your resume, analyzes your skills, and builds a personalized roadmap — complete with interview prep — to land your next role.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/upload" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
                Upload resume <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-6 py-3 text-sm font-semibold transition hover:bg-secondary">
                View demo dashboard
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-20 grid max-w-5xl gap-4 md:grid-cols-4">
            {[
              ["120k+", "Resumes analyzed"],
              ["94%", "Match accuracy"],
              ["3.2x", "Faster job offers"],
              ["50+", "Career paths"],
            ].map(([v, l]) => (
              <div key={l} className="card-surface p-6 text-center">
                <div className="font-display text-3xl font-semibold text-primary">{v}</div>
                <div className="mt-1 text-sm text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 max-w-2xl">
          <div className="text-sm font-medium text-primary">Everything you need</div>
          <h2 className="mt-2 text-3xl font-semibold md:text-4xl">A complete career operating system</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="card-surface p-6 transition hover:border-primary/40">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="card-surface relative overflow-hidden p-10 text-center md:p-16">
          <div className="absolute inset-0 glow" />
          <div className="relative">
            <Target className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 text-3xl font-semibold md:text-4xl">Ready to find your next role?</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Start with a free resume analysis and see your career trajectory in minutes.</p>
            <Link to="/upload" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
