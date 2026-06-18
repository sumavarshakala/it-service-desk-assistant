export default function ChartWidget({ title, subtitle, children, infoValue, infoLabel, className = '' }) {
  return (
    <div className={`card bg-white border border-slate-200/80 rounded-xl p-5 shadow-card hover:shadow-md transition-all flex flex-col ${className}`}>
      {/* Title & Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-800 tracking-wide">{title}</h4>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        
        {infoValue && (
          <div className="text-right">
            <span className="text-lg font-extrabold text-slate-900 leading-none block">{infoValue}</span>
            {infoLabel && <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{infoLabel}</span>}
          </div>
        )}
      </div>

      {/* Chart container */}
      <div className="flex-1 relative min-h-[240px] flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
