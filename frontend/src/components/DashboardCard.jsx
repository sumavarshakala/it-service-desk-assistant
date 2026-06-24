import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function DashboardCard({ label, value, icon: Icon, trend, percentage, color, subtitle }) {
  const isUp = trend === 'up';
  const isDown = trend === 'down';
  const isFlat = !isUp && !isDown;

  const colorMap = {
    'text-brand-blue bg-brand-blue': { bg: 'bg-blue-50', border: 'border-blue-100', icon: 'text-brand-blue', accent: '#2563EB' },
    'text-blue-500 bg-blue-500': { bg: 'bg-blue-50', border: 'border-blue-100', icon: 'text-blue-500', accent: '#3B82F6' },
    'text-amber-500 bg-amber-500': { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'text-amber-500', accent: '#F59E0B' },
    'text-emerald-500 bg-emerald-500': { bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'text-emerald-500', accent: '#22C55E' },
    'text-rose-500 bg-rose-500': { bg: 'bg-rose-50', border: 'border-rose-100', icon: 'text-rose-500', accent: '#EF4444' },
    'text-indigo-500 bg-indigo-500': { bg: 'bg-indigo-50', border: 'border-indigo-100', icon: 'text-indigo-500', accent: '#6366F1' },
    'text-teal-500 bg-teal-500': { bg: 'bg-teal-50', border: 'border-teal-100', icon: 'text-teal-500', accent: '#14B8A6' },
  };

  const cfg = colorMap[color] || colorMap['text-brand-blue bg-brand-blue'];

  return (
    <div className="bg-white border border-slate-200/70 rounded-xl p-5 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200 group relative overflow-hidden">
      {/* Subtle accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl opacity-60" style={{ background: cfg.accent }} />

      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl border ${cfg.bg} ${cfg.border}`}>
          <Icon className={`w-5 h-5 ${cfg.icon}`} />
        </div>
        {percentage !== undefined && (
          <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
            isUp ? 'bg-emerald-50 text-emerald-600' :
            isDown ? 'bg-rose-50 text-rose-600' :
            'bg-slate-100 text-slate-500'
          }`}>
            {isUp ? <TrendingUp className="w-3 h-3" /> : isDown ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {percentage}%
          </div>
        )}
      </div>

      <div>
        <div className="text-2xl font-extrabold text-slate-900 tracking-tight animate-count-up">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <p className="text-xs font-semibold text-slate-500 mt-1">{label}</p>
        {subtitle && <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      {/* Trend label */}
      {percentage !== undefined && (
        <p className={`text-[10px] font-medium mt-2 ${isUp ? 'text-emerald-600' : isDown ? 'text-rose-500' : 'text-slate-400'}`}>
          {isUp ? '↑' : isDown ? '↓' : '→'} {percentage}% vs last month
        </p>
      )}
    </div>
  );
}
