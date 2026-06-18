import { TrendingUp, TrendingDown } from 'lucide-react';

export default function DashboardCard({ label, value, icon: Icon, trend, percentage, color, onClick }) {
  const isPositive = trend === 'up';
  
  return (
    <div 
      onClick={onClick}
      className={`kpi-card relative overflow-hidden bg-white border border-slate-200/80 rounded-xl p-5 hover:border-slate-300 hover:shadow-md transition-all duration-300 cursor-pointer ${
        onClick ? 'active:scale-95' : ''
      }`}
    >
      {/* Top section: Label and Icon */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        <div className={`p-2 rounded-lg ${color} bg-opacity-10 shrink-0`}>
          <Icon className={`w-5 h-5`} />
        </div>
      </div>
      
      {/* Value */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
        {percentage && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-full ${
            isPositive 
              ? 'bg-emerald-50 text-emerald-700' 
              : 'bg-rose-50 text-rose-700'
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {percentage}%
          </span>
        )}
      </div>

      {/* Decorative left accent border based on category color */}
      <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${
        label.toLowerCase().includes('critical') ? 'bg-rose-500' :
        label.toLowerCase().includes('open') ? 'bg-blue-500' :
        label.toLowerCase().includes('in progress') ? 'bg-amber-500' :
        label.toLowerCase().includes('resolved') ? 'bg-emerald-500' : 'bg-slate-400'
      }`} />
    </div>
  );
}
