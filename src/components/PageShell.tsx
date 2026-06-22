import type { ReactNode } from "react";

export function PageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10 max-w-3xl">
        {eyebrow && (
          <div className="mb-3 inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-primary">
            {eyebrow}
          </div>
        )}
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
        {description && (
          <p className="mt-4 text-base text-muted-foreground md:text-lg">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
