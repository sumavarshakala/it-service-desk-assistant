const priorityColors = {
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200/60',
  High: 'bg-orange-50 text-orange-700 border-orange-200/60',
  Critical: 'bg-rose-50 text-rose-700 border-rose-200/60',
};

const statusColors = {
  Open: 'bg-blue-50 text-blue-700 border-blue-200/60',
  'In Progress': 'bg-amber-50 text-amber-700 border-amber-200/60',
  Assigned: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
  Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  Closed: 'bg-slate-100 text-slate-600 border-slate-200/60',
};

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[status] || statusColors.Open}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'Open' ? 'bg-blue-500' :
        status === 'In Progress' ? 'bg-amber-500' :
        status === 'Assigned' ? 'bg-indigo-500' :
        status === 'Resolved' ? 'bg-emerald-500' : 'bg-slate-400'
      }`} />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${priorityColors[priority] || priorityColors.Medium}`}>
      {priority}
    </span>
  );
}
