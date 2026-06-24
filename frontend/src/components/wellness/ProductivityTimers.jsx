import { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock, Brain, Coffee } from 'lucide-react';
import { wellnessAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ProductivityTimers({ onSessionComplete }) {
  const [activeTimer, setActiveTimer] = useState(null); // 'pomodoro' | 'deepwork'
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus' | 'break' for Pomodoro
  const [initialTime, setInitialTime] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (isRunning && timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    toast.success('Timer Complete!', { icon: '⏰' });
    
    if (activeTimer) {
      wellnessAPI.recordSession(
        activeTimer === 'pomodoro' ? `Pomodoro (${mode})` : `Deep Work`, 
        initialTime / 60
      ).then(() => {
        onSessionComplete();
      });
    }

    if (activeTimer === 'pomodoro' && mode === 'focus') {
      setMode('break');
      setTimeLeft(5 * 60);
      setInitialTime(5 * 60);
    } else {
      setActiveTimer(null);
    }
  };

  const startPomodoro = () => {
    setActiveTimer('pomodoro');
    setMode('focus');
    setTimeLeft(25 * 60);
    setInitialTime(25 * 60);
    setIsRunning(true);
  };

  const startDeepWork = (minutes) => {
    setActiveTimer('deepwork');
    setTimeLeft(minutes * 60);
    setInitialTime(minutes * 60);
    setIsRunning(true);
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  const stopTimer = () => {
    setIsRunning(false);
    setActiveTimer(null);
    setTimeLeft(0);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Progress for circle
  const progress = initialTime > 0 ? ((initialTime - timeLeft) / initialTime) * 100 : 0;

  return (
    <div className="bg-white border border-slate-200/70 rounded-xl p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-blue" />
          Focus & Productivity
        </h3>
        {activeTimer && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            mode === 'break' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-blue-50 text-blue-600 border-blue-200'
          } uppercase tracking-wider`}>
            {activeTimer === 'pomodoro' ? (mode === 'focus' ? '🍅 Pomodoro Focus' : '☕ Pomodoro Break') : '🧠 Deep Work'}
          </span>
        )}
      </div>

      {activeTimer ? (
        <div className="flex flex-col items-center py-6">
          <div className="relative w-48 h-48 flex items-center justify-center mb-8">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="88" className="stroke-slate-100" strokeWidth="8" fill="none" />
              <circle 
                cx="96" cy="96" r="88" 
                className={`transition-all duration-1000 ${mode === 'break' ? 'stroke-orange-400' : 'stroke-brand-blue'}`} 
                strokeWidth="8" 
                fill="none" 
                strokeDasharray="552" 
                strokeDashoffset={552 - (552 * progress) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="text-center">
              <p className="text-5xl font-extrabold tracking-tight text-slate-800 font-mono">
                {formatTime(timeLeft)}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={toggleTimer} 
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md transition-transform hover:scale-105 active:scale-95 ${mode === 'break' ? 'bg-orange-500' : 'bg-brand-blue'}`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
            </button>
            <button 
              onClick={stopTimer} 
              className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <Square className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-slate-200 rounded-xl p-5 hover:border-brand-blue/30 transition-colors group cursor-pointer" onClick={startPomodoro}>
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              🍅
            </div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">Pomodoro Timer</h4>
            <p className="text-xs text-slate-500 mb-4">25 min focus, 5 min break. Ideal for standard tasks.</p>
            <button className="text-xs font-bold text-brand-blue group-hover:text-brand-blue-dark">Start Session &rarr;</button>
          </div>

          <div className="border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Deep Work Timer</h4>
                <p className="text-[10px] text-slate-400">Custom focus sessions</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              {[15, 30, 45, 60].map(min => (
                <button 
                  key={min}
                  onClick={() => startDeepWork(min)}
                  className="py-1.5 px-3 rounded-md bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-colors"
                >
                  {min} min
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
