
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Clock, Zap, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const Analytics: React.FC = () => {
  const [insight, setInsight] = useState<string>('Analyzing stream patterns...');
  const [isLoading, setIsLoading] = useState(false);
  
  const stats = [
    { label: 'Total Views', value: '42.8k', change: '+12%', color: 'text-indigo-400' },
    { label: 'Avg Viewers', value: '1,240', change: '+5%', color: 'text-yellow-400' },
    { label: 'Retention', value: '78%', change: '+2%', color: 'text-green-400' },
    { label: 'Sub Growth', value: '450', change: '+18%', color: 'text-purple-400' },
  ];

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      // Use process.env.API_KEY directly for initialization as per coding guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Based on these stats: 42k views, 78% retention, and 1.2k avg viewers, give me a professional 'Streamer Strategy Insight' in 2 sentences. Focus on high growth.",
      });
      setInsight(response.text || "Your retention is elite. Focus on early-stream engagement to maximize the 78% baseline.");
    } catch (e) {
      setInsight("Retention is your strongest metric. Double down on community Q&A segments during your mid-stream peak.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="flex-1 p-8 md:p-12 bg-black overflow-y-auto scrollbar-hide">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-yellow-400" size={16} />
              <span className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.4em]">Performance Lab</span>
            </div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">Metrics Engine</h1>
          </div>
          <button 
            onClick={fetchInsights}
            disabled={isLoading}
            className="px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:border-yellow-400 transition-all text-zinc-400 hover:text-white"
          >
            {isLoading ? <RefreshCw className="animate-spin" size={16}/> : <Zap size={16}/>}
            Recalculate Insight
          </button>
        </header>

        {/* AI Insight Card */}
        <div className="bg-gradient-to-br from-indigo-950/40 to-black border border-indigo-500/20 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-4xl">
          <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
            <Sparkles size={64} className="text-indigo-400" />
          </div>
          <div className="relative z-10 space-y-4">
             <div className="flex items-center gap-3 text-indigo-400">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Gemini Analysis Active</span>
             </div>
             <p className="text-xl md:text-2xl font-bold text-zinc-100 leading-tight italic">
               "{insight}"
             </p>
          </div>
        </div>

        {/* Grid Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] space-y-4 hover:border-zinc-700 transition-all shadow-2xl">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">{s.label}</span>
              <div className="flex items-end justify-between">
                <span className={`text-3xl font-black italic tracking-tighter ${s.color}`}>{s.value}</span>
                <span className="text-[10px] font-black text-green-500 flex items-center gap-1">
                  <TrendingUp size={12}/> {s.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Technical Note */}
        <div className="p-8 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800 flex items-start gap-5">
          <AlertCircle className="text-zinc-700 shrink-0" />
          <div>
            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Technical Status: Simulated Data</h4>
            <p className="text-[11px] text-zinc-600 font-bold leading-relaxed uppercase">
              Live data mining requires a connection to the nXcor Cloud Gateway. Currently showing simulated platform performance logs for demonstration of the Metrics UI and Gemini Insight integration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
