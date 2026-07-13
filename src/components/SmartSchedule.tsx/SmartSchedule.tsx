import React, { useState } from 'react';

export default function SmartSchedule() {
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<any>(null);

  const generateSchedule = async () => {
    setLoading(true);
    try {
      // Direct call to your live Supabase project
      const response = await fetch(`https://rmoeakwmqkhlnmvbgyec.supabase.co/functions/v1/smart-schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timetable: { "9AM-12PM": "College Classes", "2PM-4PM": "Lab" },
          skills: ["React Development", "Supabase Backend Integration"]
        })
      });
      const data = await response.json();
      setSchedule(data);
    } catch (error) {
      console.error("Failed to fetch AI schedule", error);
    } 
    setLoading(false);
  };

  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl border border-slate-800 shadow-xl mt-6">
      <h3 className="text-xl font-bold mb-2 text-purple-400">📅 AI Timetable Assistant</h3>
      <p className="text-sm text-slate-400 mb-4">Optimizes your daily academic schedule to fit in high-priority upskilling.</p>
      
      {!schedule && (
        <button 
          onClick={generateSchedule}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
        >
          {loading ? "AI is optimizing calendar..." : "Generate AI Smart Schedule"}
        </button>
      )}

      {schedule && (
        <div className="space-y-3 bg-slate-950 p-4 rounded-lg border border-purple-900/40">
          <h4 className="font-semibold text-purple-300">Your Optimized Day:</h4>
          <p className="text-sm italic text-slate-300">"{schedule.message?.content || JSON.stringify(schedule)}"</p>
        </div>
      )}
    </div>
  );
}