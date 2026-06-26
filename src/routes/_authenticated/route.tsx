import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const DEV_BYPASS_KEY = "careerpilot_dev_bypass";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (typeof window !== "undefined" && window.localStorage.getItem(DEV_BYPASS_KEY) === "1") {
      return { user: null, devBypass: true as const };
    }
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" });
    return { user: data.user, devBypass: false as const };
  },
  component: () => <Outlet />,
});
