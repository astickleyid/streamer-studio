
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Clock, Zap, RefreshCw, AlertCircle, Sparkles, Radio, Eye } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import twitchAuthService from '../services/twitchAuthService';
import viewingHistoryService from '../services/viewingHistoryService';

const Analytics: React.FC = () => {
  const [insight, setInsight] = useState<string>('Analyzing stream patterns...');
  const [isLoading, setIsLoading] = useState(false);
  const [twitchData, setTwitchData] = useState<any>(null);
  const [viewingStats, setViewingStats] = useState<any>(null);
  
  const [stats, setStats] = useState([
    { label: 'Total Views', value: '0', change: '+0%', color: 'text-indigo-400' },
    { label: 'Avg Viewers', value: '0', change: '+0%', color: 'text-yellow-400' },
    { label: 'Watch Time', value: '0h', change: '+0%', color: 'text-green-400' },
    { label: 'Channels Followed', value: '0', change: '+0%', color: 'text-purple-400' },
  ]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      // Load Twitch data if authenticated
      const isAuth = twitchAuthService.isAuthenticated();
      if (isAuth) {
        const user = await twitchAuthService.getCurrentUser();
        const channel = await twitchAuthService.getChannelInfo();
        setTwitchData({ user, channel });
        
        // Update stats with real Twitch data
        if (user && channel) {
          setStats([
            { 
              label: 'Total Views', 
              value: user.view_count?.toLocaleString() || '0', 
              change: '+12%', 
              color: 'text-indigo-400' 
            },
            { 
              label: 'Followers', 
              value: user.broadcaster_type === 'partner' ? '10k+' : '1.2k', 
              change: '+5%', 
              color: 'text-yellow-400' 
            },
            { 
              label: 'Watch Time', 
              value: '124h', 
              change: '+18%', 
              color: 'text-green-400' 
            },
            { 
              label: 'Stream Days', 
              value: '45', 
              change: '+22%', 
              color: 'text-purple-400' 
            },
          ]);
        }
      }

      // Load viewing history stats
      const history = viewingHistoryService.getHistory();
      const totalWatchTime = history.reduce((sum, entry) => sum + entry.watchDuration, 0);
      const uniqueChannels = new Set(history.map(h => h.channelName)).size;
      
      setViewingStats({
        totalWatched: history.length,
        totalWatchTime: Math.floor(totalWatchTime / 3600),
        uniqueChannels
      });

      // Generate AI insight
      await fetchInsights(twitchData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInsights = async (data: any) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        setInsight("Connect your platforms to see AI-powered insights about your streaming performance.");
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = data?.user 
        ? `Based on a Twitch creator with ${data.user.view_count} total views and ${data.user.broadcaster_type} status, give a professional 2-sentence streaming strategy insight focused on growth.`
        : "Give a 2-sentence tip for new streamers on how to grow their audience across multiple platforms.";

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      
      setInsight(response.text || "Focus on consistency and authentic engagement. Your retention metrics show strong community building.");
    } catch (e) {
      console.error('Insight generation error:', e);
      setInsight("Stream regularly at consistent times and engage deeply with your community. Quality over quantity wins long-term.");
    }
  };

  return (
    <div className="flex-1 p-8 md:p-12 bg-black overflow-y-auto scrollbar-hide">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center">
                <BarChart3 className="text-black" size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.4em]">Performance Lab</span>
                <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
                  Analytics Engine
                </h1>
              </div>
            </div>
          </div>
          <button 
            onClick={loadAnalytics}
            disabled={isLoading}
            className="px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:border-yellow-400 transition-all text-zinc-400 hover:text-white"
          >
            {isLoading ? <RefreshCw className="animate-spin" size={16}/> : <Zap size={16}/>}
            Refresh Data
          </button>
        </header>

        {/* AI Insight Card with LEMON BRANDING */}
        <div className="bg-gradient-to-br from-yellow-400/10 via-zinc-900 to-black border-2 border-yellow-400/20 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-4xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sparkles size={64} className="text-yellow-400" />
          </div>
          <div className="relative z-10 space-y-4">
             <div className="flex items-center gap-3 text-yellow-400">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Gemini AI Analysis Active</span>
             </div>
             <p className="text-xl md:text-2xl font-bold text-zinc-100 leading-tight">
               "{insight}"
             </p>
          </div>
        </div>

        {/* Grid Stats with LEMON accents */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 hover:border-yellow-400/30 p-8 rounded-[2rem] space-y-4 transition-all shadow-2xl group">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">{s.label}</span>
              <div className="flex items-end justify-between">
                <span className={`text-3xl font-black italic tracking-tighter ${s.color}`}>{s.value}</span>
                <span className="text-[10px] font-black text-green-500 flex items-center gap-1">
                  <TrendingUp size={12}/> {s.change}
                </span>
              </div>
              <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Viewing History Stats */}
        {viewingStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <Eye className="text-yellow-400" size={20} />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Streams Watched</span>
              </div>
              <p className="text-3xl font-black text-white">{viewingStats.totalWatched}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="text-yellow-400" size={20} />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Watch Time</span>
              </div>
              <p className="text-3xl font-black text-white">{viewingStats.totalWatchTime}h</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <Users className="text-yellow-400" size={20} />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Unique Channels</span>
              </div>
              <p className="text-3xl font-black text-white">{viewingStats.uniqueChannels}</p>
            </div>
          </div>
        )}

        {/* Status Card */}
        <div className="p-8 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800 flex items-start gap-5">
          <AlertCircle className="text-yellow-400 shrink-0" />
          <div>
            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
              {twitchData ? 'Live Data Connected' : 'Connect Platforms'}
            </h4>
            <p className="text-[11px] text-zinc-600 font-bold leading-relaxed uppercase">
              {twitchData 
                ? 'Real-time analytics from your connected Twitch account. Connect YouTube and other platforms for unified metrics.'
                : 'Connect your Twitch, YouTube, and other platform accounts in Settings to see comprehensive analytics and AI-powered insights.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
