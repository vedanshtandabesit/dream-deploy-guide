import React, { useState } from 'react';

export default function SmartSchedule() {
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<any>(null);

  const generateSchedule = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://rmoeakwmqkhlnmvbgyec.supabase.co/functions/v1/smart-schedule`, {
        method: 'POST',
       headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer sb_publishable_xRCOsVb9LEtuVAPTsylU-A_OhApG9sX`,
          'apikey': `sb_publishable_xRCOsVb9LEtuVAPTsylU-A_OhApG9sX`
        },
        body: JSON.stringify({
          timetable: { "9AM-12PM": "College Classes", "2PM-4PM": "Lab" },
          skills: ["React Development", "Supabase Backend Integration"]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSchedule(data);
    } catch (error) {
      console.error("Failed to fetch AI schedule", error);
      setSchedule({ message: { content: "Error connecting to AI coach. Please try again." } });
    } 
    setLoading(false);
  };

  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl border border-slate-800 shadow-xl mt-6 max-w-2xl mx-auto text-left">
      <h3 className="text-xl font-bold mb-2 text-purple-400">📅 AI Timetable Assistant</h3>
      <p className="text-sm text-slate-400 mb-4">Dynamically cross-references your academic calendar with your targeted upskilling roadmap.</p>
      
      {!schedule && (
        <button 
          onClick={generateSchedule}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800/50 text-white font-semibold py-2.5 px-5 rounded-lg transition-all"
        >
          {loading ? "⏳ AI Coach is optimizing your calendar..." : "Generate AI Smart Schedule"}
        </button>
      )}

      {schedule && (
        <div className="space-y-3 bg-slate-950 p-5 rounded-lg border border-purple-900/40">
          <h4 className="font-bold text-purple-300 border-b border-slate-800 pb-2 mb-2">Your Optimized Personal Schedule:</h4>
          <div className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
            {schedule.message?.content || JSON.stringify(schedule)}
          </div>
        </div>
      )}
    </div>
  );
}