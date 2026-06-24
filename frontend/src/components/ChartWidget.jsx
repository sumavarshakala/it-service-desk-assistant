export default function ChartWidget({ title, subtitle, children, className = '', actions }) {
  return (
    <div className={`bg-white border border-slate-200/70 rounded-xl shadow-card overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}
