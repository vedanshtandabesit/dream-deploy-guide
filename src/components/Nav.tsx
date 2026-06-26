import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Compass, LogOut, LogIn } from "lucide-react";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { DEV_BYPASS_KEY } from "@/routes/_authenticated/route";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/upload", label: "Resume" },
  { to: "/skills", label: "Skills" },
  { to: "/roadmap", label: "Roadmap" },
  { to: "/interview", label: "Interview" },
  { to: "/assistant", label: "AI Coach" },
] as const;

export function Nav() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [isAuthed, setIsAuthed] = useState(false);
  const [bypass, setBypass] = useState(false);

  useEffect(() => {
    const sync = () => {
      setBypass(window.localStorage.getItem(DEV_BYPASS_KEY) === "1");
    };
    sync();
    supabase.auth.getSession().then(({ data }) => setIsAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsAuthed(!!session);
    });
    window.addEventListener("storage", sync);
    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener("storage", sync);
    };
  }, [pathname]);

  const signedIn = isAuthed || bypass;

  async function handleSignOut() {
    window.localStorage.removeItem(DEV_BYPASS_KEY);
    await supabase.auth.signOut();
    setBypass(false);
    navigate({ to: "/login", replace: true });
  }

  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Compass className="h-4 w-4" />
          </span>
          CareerPilot <span className="text-primary">AI</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "rounded-md px-3 py-1.5 text-sm bg-secondary text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {bypass && (
            <span className="hidden rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-500 sm:inline-flex">
              Dev mode
            </span>
          )}
          {signedIn ? (
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition hover:bg-secondary"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              <LogIn className="h-4 w-4" /> Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
