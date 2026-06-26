import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/upload")({
  head: () => ({ meta: [{ title: "Upload Resume — CareerPilot AI" }] }),
  component: UploadPage,
});

function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <PageShell eyebrow="Step 1 of 4" title="Upload your resume" description="Drop a PDF or DOCX. Our AI will extract experience, skills, and impact in seconds.">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <label
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault(); setDragging(false);
              const f = e.dataTransfer.files?.[0]; if (f) setFile(f);
            }}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-16 text-center transition ${dragging ? "border-primary bg-primary/5" : "border-border bg-surface"}`}
          >
            <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{file ? file.name : "Drop your resume here"}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{file ? `${(file.size / 1024).toFixed(1)} KB · ready to analyze` : "PDF or DOCX, up to 10MB"}</p>
            {!file && (
              <span className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">Choose file</span>
            )}
          </label>

          {file && (
            <Link to="/skills" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
              Analyze skills <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

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
            Your resume stays private. We never share it with employers or third parties.
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
