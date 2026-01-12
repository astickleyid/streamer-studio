import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Mic, Sliders, Activity, Zap, ShieldCheck } from 'lucide-react';

const AudioLab: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      setIsActive(true);
      draw();
    } catch (err) {
      console.error("Audio Lab Error", err);
    }
  };

  const draw = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const renderFrame = () => {
      animationFrameRef.current = requestAnimationFrame(renderFrame);
      analyserRef.current!.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 1.5;
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#4f46e5');
        gradient.addColorStop(1, '#facc15');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    renderFrame();
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sliders className="text-blue-400" size={16} />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Signal Processing</span>
          </div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Audio Lab v4</h2>
        </div>
        <button 
          onClick={isActive ? () => {} : startVisualizer}
          className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-3xl ${isActive ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-indigo-600 text-white hover:bg-white hover:text-black'}`}
        >
          {isActive ? 'SIGNAL LOCKED' : 'CONNECT INPUT'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 shadow-3xl overflow-hidden relative">
          <div className="absolute top-8 left-8 flex items-center gap-3 z-10">
            <Activity className="text-yellow-400 animate-pulse" size={16} />
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Real-time Spectrum</span>
          </div>
          <canvas ref={canvasRef} width={800} height={300} className="w-full h-64 mt-8 rounded-2xl" />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 flex flex-col justify-between shadow-3xl">
           <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="text-indigo-400" size={16} />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Virtual VST Rack</span>
              </div>
              {['Noise Gate', 'Compressor', 'EQ-3 Band'].map((fx, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-zinc-800">
                  <span className="text-xs font-black text-zinc-400 uppercase">{fx}</span>
                  <div className="w-10 h-5 bg-indigo-600 rounded-full flex items-center px-1">
                    <div className="w-3 h-3 bg-white rounded-full ml-auto shadow-lg"></div>
                  </div>
                </div>
              ))}
           </div>
           <div className="pt-8 border-t border-zinc-800">
             <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Master Gain</span>
                <span className="text-xl font-mono text-white">0.0dB</span>
             </div>
             <div className="h-2 bg-zinc-800 rounded-full mt-4 overflow-hidden">
               <div className="h-full bg-yellow-400 w-3/4"></div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AudioLab;