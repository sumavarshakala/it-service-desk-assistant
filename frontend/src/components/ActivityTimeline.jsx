import { Clock, MessageSquare, PlusCircle, CheckCircle, UserPlus, AlertCircle } from 'lucide-react';

export default function ActivityTimeline({ events = [], loading = false }) {
  if (loading) {
    return (
      <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
        Generating timeline activities...
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-400">
        No recent updates or activity recorded.
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {events.map((event, eventIdx) => {
          const Icon = event.icon || Clock;
          return (
            <li key={event.id || eventIdx}>
              <div className="relative pb-8">
                {eventIdx !== events.length - 1 ? (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-100"
                    aria-hidden="true"
                    style={{ zIndex: 1 }}
                  />
                ) : null}
                <div className="relative flex space-x-3" style={{ zIndex: 2 }}>
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white ${
                      event.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                      event.color === 'green' ? 'bg-emerald-50 text-emerald-600' :
                      event.color === 'purple' ? 'bg-indigo-50 text-indigo-600' :
                      event.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                      event.color === 'red' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-800 leading-snug">
                        {event.title}{' '}
                        {event.user && (
                          <span className="font-bold text-brand-blue-dark">by {event.user}</span>
                        )}
                      </p>
                      {event.description && (
                        <p className="text-[11px] text-slate-500 mt-1 bg-slate-50 border border-slate-100 rounded-md p-2 leading-relaxed">
                          {event.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-[10px] whitespace-nowrap text-slate-400 font-semibold self-start">
                      {event.time}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
