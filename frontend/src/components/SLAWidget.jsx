import { useEffect, useState } from 'react';
import { Clock, AlertTriangle, CheckCircle, Timer } from 'lucide-react';

// SLA hours by priority
const SLA_RESPONSE_HOURS = { Critical: 1, High: 4, Medium: 8, Low: 24 };
const SLA_RESOLUTION_HOURS = { Critical: 4, High: 8, Medium: 24, Low: 72 };

function getTimeLeft(createdAt, hoursLimit) {
  const created = new Date(createdAt);
  const deadline = new Date(created.getTime() + hoursLimit * 3600 * 1000);
  const now = new Date();
  const diffMs = deadline - now;
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffMins = Math.floor(diffMs / (1000 * 60));
  return { diffMs, diffHours, diffMins, deadline };
}

function formatTimeLeft(diffMs) {
  if (diffMs <= 0) return 'Breached';
  const totalMins = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
}

function SLARow({ label, hoursLimit, createdAt, status }) {
  const { diffMs, diffHours, deadline } = getTimeLeft(createdAt, hoursLimit);
  const totalMs = hoursLimit * 3600 * 1000;
  const percent = Math.min(100, Math.max(0, ((totalMs - diffMs) / totalMs) * 100));
  const isResolved = ['Resolved', 'Closed'].includes(status);

  let statusLabel, statusClass, barColor, StatusIcon;
  if (isResolved) {
    statusLabel = 'Completed'; statusClass = 'text-emerald-600 bg-emerald-50 border-emerald-200';
    barColor = '#22C55E'; StatusIcon = CheckCircle;
  } else if (diffMs <= 0) {
    statusLabel = 'Breached'; statusClass = 'text-rose-600 bg-rose-50 border-rose-200';
    barColor = '#EF4444'; StatusIcon = AlertTriangle;
  } else if (diffHours <= 1) {
    statusLabel = formatTimeLeft(diffMs); statusClass = 'text-rose-600 bg-rose-50 border-rose-200';
    barColor = '#EF4444'; StatusIcon = AlertTriangle;
  } else if (diffHours <= hoursLimit * 0.25) {
    statusLabel = formatTimeLeft(diffMs); statusClass = 'text-amber-600 bg-amber-50 border-amber-200';
    barColor = '#F59E0B'; StatusIcon = Clock;
  } else {
    statusLabel = formatTimeLeft(diffMs); statusClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    barColor = '#22C55E'; StatusIcon = CheckCircle;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
          <Timer className="w-3 h-3 text-slate-400" />
          {label}
        </span>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusClass}`}>
          <StatusIcon className="w-3 h-3" />
          {statusLabel}
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${isResolved ? 100 : percent}%`, background: barColor }}
        />
      </div>
      {!isResolved && (
        <p className="text-[10px] text-slate-400">
          Deadline: {deadline.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  );
}

export default function SLAWidget({ ticket }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  if (!ticket) return null;
  const priority = ticket.priority || 'Medium';
  const createdAt = ticket.created_at;

  return (
    <div className="card border-slate-200/80 space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-100">
          <Clock className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">SLA Status</h3>
          <p className="text-[10px] text-slate-400">Service Level Agreement tracking</p>
        </div>
      </div>

      <SLARow
        label="Response SLA"
        hoursLimit={SLA_RESPONSE_HOURS[priority] || 8}
        createdAt={createdAt}
        status={ticket.status}
      />
      <SLARow
        label="Resolution SLA"
        hoursLimit={SLA_RESOLUTION_HOURS[priority] || 24}
        createdAt={createdAt}
        status={ticket.status}
      />

      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-400 font-medium">Priority Tier</span>
          <span className={`font-bold px-2 py-0.5 rounded ${
            priority === 'Critical' ? 'bg-rose-100 text-rose-700' :
            priority === 'High' ? 'bg-amber-100 text-amber-700' :
            priority === 'Medium' ? 'bg-blue-100 text-blue-700' :
            'bg-slate-100 text-slate-600'
          }`}>{priority}</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5">
          Response: {SLA_RESPONSE_HOURS[priority]}h · Resolution: {SLA_RESOLUTION_HOURS[priority]}h
        </p>
      </div>
    </div>
  );
}
