import { useState, useEffect } from 'react';
import { Wind, Coffee, RefreshCw } from 'lucide-react';

const TIPS = [
  "Take a short walk and look at something 20 feet away.",
  "Stretch your shoulders and roll your neck.",
  "Drink a glass of water right now.",
  "Organize your workspace for 2 minutes.",
  "Close your eyes and take 3 deep breaths."
];

const QUOTES = [
  "Small progress is still progress.",
  "Consistency beats intensity.",
  "Your mind is like a muscle; it needs rest to grow stronger.",
  "Don't count the days, make the days count."
];

export default function MindfulnessZone() {
  const [tipIndex, setTipIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale'); // Inhale, Hold, Exhale

  useEffect(() => {
    // Rotate tip and quote every 10 seconds
    const tipInterval = setInterval(() => {
      setTipIndex(i => (i + 1) % TIPS.length);
      setQuoteIndex(i => (i + 1) % QUOTES.length);
    }, 10000);
    return () => clearInterval(tipInterval);
  }, []);

  useEffect(() => {
    let breathInterval;
    if (isBreathing) {
      breathInterval = setInterval(() => {
        setBreathPhase(prev => {
          if (prev === 'Inhale') return 'Hold';
          if (prev === 'Hold') return 'Exhale';
          return 'Inhale';
        });
      }, 4000); // 4 seconds per phase
    } else {
      setBreathPhase('Inhale');
    }
    return () => clearInterval(breathInterval);
  }, [isBreathing]);

  return (
    <div className="bg-white border border-slate-200/70 rounded-xl p-6 shadow-card space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Wind className="w-5 h-5 text-emerald-500" />
        <h3 className="font-extrabold text-slate-800 text-lg">Mindfulness Zone</h3>
      </div>

      {/* Breathing Exercise */}
      <div className="bg-emerald-50 rounded-xl p-6 text-center border border-emerald-100 relative overflow-hidden">
        <h4 className="font-bold text-emerald-800 text-sm mb-4">Breathing Exercise</h4>
        <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-emerald-200 rounded-full opacity-50"
            style={{
              transform: `scale(${!isBreathing ? 1 : (breathPhase === 'Inhale' ? 1.5 : breathPhase === 'Hold' ? 1.5 : 1)})`,
              transition: 'transform 4s ease-in-out'
            }}
          />
          <div className="relative z-10 w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold shadow-md cursor-pointer" onClick={() => setIsBreathing(!isBreathing)}>
            {isBreathing ? breathPhase : 'Start'}
          </div>
        </div>
      </div>

      {/* Stress Relief Tip */}
      <div className="card bg-slate-50 border-slate-200 p-4 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Coffee className="w-3 h-3" /> Quick Tip
          </h4>
          <button onClick={() => setTipIndex(i => (i + 1) % TIPS.length)} className="text-slate-400 hover:text-brand-blue">
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
        <p className="text-sm font-semibold text-slate-700 animate-fade-in key={tipIndex}">
          {TIPS[tipIndex]}
        </p>
      </div>

      {/* Daily Motivation */}
      <div className="text-center p-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Quote of the Day</p>
        <p className="text-sm italic font-medium text-slate-600 animate-fade-in key={quoteIndex}">
          "{QUOTES[quoteIndex]}"
        </p>
      </div>
    </div>
  );
}
