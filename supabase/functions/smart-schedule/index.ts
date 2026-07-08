// Smart Scheduler edge function
// Takes busy slots (weekly recurring class times) + missing skills,
// returns recommended study slots for the upcoming 7 days.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type BusySlot = {
  days: number[]; // 0=Sun ... 6=Sat
  start: string; // "HH:MM"
  end: string; // "HH:MM"
};

type Skill = { name: string; priority?: "high" | "medium" | "low" };

function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function pad(n: number) {
  return String(n).padStart(2, "0");
}
function fmtTime(mins: number) {
  return `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { busySlots = [], missingSkills = [], daysAhead = 7 } = (await req.json()) as {
      busySlots: BusySlot[];
      missingSkills: (Skill | string)[];
      daysAhead?: number;
    };

    const skills: Skill[] = missingSkills.map((s) =>
      typeof s === "string" ? { name: s } : s,
    );
    if (skills.length === 0) {
      return new Response(
        JSON.stringify({ studySlots: [], message: "No missing skills provided." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Preferred study window
    const DAY_START = toMinutes("07:00");
    const DAY_END = toMinutes("22:00");
    const BUFFER = 30; // minutes around busy blocks
    const MIN_SESSION = 60; // 1h
    const PREFERRED_SESSION = 120; // 2h when possible

    const studySlots: Array<{
      date: string; // YYYY-MM-DD
      dayName: string;
      start: string;
      end: string;
      durationMin: number;
      skill: string;
      priority: string;
    }> = [];

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let skillIdx = 0;

    for (let i = 0; i < daysAhead; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dow = date.getDay();

      // Compute free windows for this day
      const busyToday = busySlots
        .filter((b) => b.days.includes(dow))
        .map((b) => ({
          start: Math.max(DAY_START, toMinutes(b.start) - BUFFER),
          end: Math.min(DAY_END, toMinutes(b.end) + BUFFER),
        }))
        .sort((a, b) => a.start - b.start);

      const free: Array<{ start: number; end: number }> = [];
      let cursor = DAY_START;
      for (const b of busyToday) {
        if (b.start > cursor) free.push({ start: cursor, end: b.start });
        cursor = Math.max(cursor, b.end);
      }
      if (cursor < DAY_END) free.push({ start: cursor, end: DAY_END });

      // Take up to 2 study slots per day from largest free windows
      const windows = free
        .filter((w) => w.end - w.start >= MIN_SESSION)
        .sort((a, b) => b.end - b.start - (a.end - a.start))
        .slice(0, 2);

      for (const w of windows) {
        const dur = Math.min(PREFERRED_SESSION, w.end - w.start);
        const skill = skills[skillIdx % skills.length];
        skillIdx++;
        studySlots.push({
          date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
          dayName: dayNames[dow],
          start: fmtTime(w.start),
          end: fmtTime(w.start + dur),
          durationMin: dur,
          skill: skill.name,
          priority: skill.priority ?? "medium",
        });
      }
    }

    return new Response(JSON.stringify({ studySlots }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("smart-schedule error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
