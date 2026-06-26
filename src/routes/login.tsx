import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Compass, Loader2, ShieldAlert } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEV_BYPASS_KEY } from "./_authenticated/route";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const fn =
        mode === "signin"
          ? supabase.auth.signInWithPassword({ email, password })
          : supabase.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: `${window.location.origin}/dashboard` },
            });
      const { error: err } = await fn;
      if (err) throw err;
      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  function handleDevBypass() {
    window.localStorage.setItem(DEV_BYPASS_KEY, "1");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-6 py-12">
      <Link to="/" className="mb-6 flex items-center gap-2 font-display text-lg font-semibold">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Compass className="h-4 w-4" />
        </span>
        CareerPilot <span className="text-primary">AI</span>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to access your personalized career roadmap.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value={mode}>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@school.edu"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {mode === "signin" ? "Sign in" : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-2 text-xs uppercase tracking-wider text-muted-foreground">
                Hackathon judges
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-500">
              <ShieldAlert className="h-4 w-4" />
              Dev-only bypass
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              Skip authentication to preview the app. Disable this before going to production.
            </p>
            <Button variant="outline" className="w-full" onClick={handleDevBypass}>
              Skip Login (Dev Only)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
