// StatusBadge.jsx — flat enterprise-style badges
const STATUS_MAP = {
  'Open':        { label: 'Open',        cls: 'badge-blue' },
  'In Progress': { label: 'In Progress', cls: 'badge-amber' },
  'Assigned':    { label: 'Assigned',    cls: 'badge-purple' },
  'Resolved':    { label: 'Resolved',    cls: 'badge-green' },
  'Closed':      { label: 'Closed',      cls: 'badge-gray' },
  'Pending':     { label: 'Pending',     cls: 'badge-amber' },
};

const PRIORITY_MAP = {
  'Critical': { label: 'Critical', cls: 'badge-red' },
  'High':     { label: 'High',     cls: 'badge-amber' },
  'Medium':   { label: 'Medium',   cls: 'badge-blue' },
  'Low':      { label: 'Low',      cls: 'badge-gray' },
};

export function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] || { label: status, cls: 'badge-gray' };
  return <span className={cfg.cls}>{cfg.label}</span>;
}

export function PriorityBadge({ priority }) {
  const cfg = PRIORITY_MAP[priority] || { label: priority, cls: 'badge-gray' };
  return <span className={cfg.cls}>{cfg.label}</span>;
}

export default StatusBadge;
