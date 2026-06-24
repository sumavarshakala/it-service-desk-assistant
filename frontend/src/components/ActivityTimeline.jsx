import { PlusCircle, MessageCircle, CheckCircle, AlertTriangle, ArrowRight, Shield, Clock, Tag } from 'lucide-react';

const EVENT_CONFIG = {
  blue: { ring: 'ring-2 ring-blue-200', bg: 'bg-blue-100', text: 'text-blue-600', line: 'border-blue-200' },
  purple: { ring: 'ring-2 ring-purple-200', bg: 'bg-purple-100', text: 'text-purple-600', line: 'border-purple-200' },
  green: { ring: 'ring-2 ring-emerald-200', bg: 'bg-emerald-100', text: 'text-emerald-600', line: 'border-emerald-200' },
  amber: { ring: 'ring-2 ring-amber-200', bg: 'bg-amber-100', text: 'text-amber-600', line: 'border-amber-200' },
  rose: { ring: 'ring-2 ring-rose-200', bg: 'bg-rose-100', text: 'text-rose-600', line: 'border-rose-200' },
  slate: { ring: 'ring-2 ring-slate-200', bg: 'bg-slate-100', text: 'text-slate-500', line: 'border-slate-200' },
};

export default function ActivityTimeline({ events = [] }) {
  if (events.length === 0) {
    return (
      <div className="py-10 text-center">
        <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p className="text-xs text-slate-400 font-medium">No activity recorded yet</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-1">
      {events.map((event, i) => {
        const cfg = EVENT_CONFIG[event.color] || EVENT_CONFIG.slate;
        const Icon = event.icon || Clock;
        const isLast = i === events.length - 1;

        return (
          <div key={event.id} className="flex gap-4 animate-fade-in" style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}>
            {/* Timeline spine */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.ring}`}>
                <Icon className={`w-3.5 h-3.5 ${cfg.text}`} />
              </div>
              {!isLast && (
                <div className={`w-px flex-1 mt-1 mb-1 border-l-2 border-dashed min-h-[24px] ${cfg.line} opacity-40`} />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 min-w-0 ${isLast ? '' : 'pb-5'}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-slate-800">{event.title}</p>
                  {event.user && (
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      by <span className="font-semibold text-slate-700">{event.user}</span>
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-medium shrink-0 mt-0.5">{event.time}</span>
              </div>
              {event.description && (
                <div className={`mt-2 p-2.5 rounded-lg text-[11px] text-slate-600 leading-relaxed ${cfg.bg} border border-opacity-40 ${cfg.line}`}>
                  {event.description}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
