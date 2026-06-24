import { useEffect, useState } from 'react';
import {
  Activity, Ticket, Download, Search, Filter, X,
  PlusCircle, MessageCircle, CheckCircle, Settings, Shield,
  RefreshCw, LogIn, AlertTriangle
} from 'lucide-react';
import Layout from '../components/Layout';
import { analyticsAPI, ticketAPI } from '../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ACTION_CONFIG = {
  'ticket_created': { icon: PlusCircle, color: 'bg-blue-100 text-blue-600', badge: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Created' },
  'ticket_updated': { icon: Settings, color: 'bg-amber-100 text-amber-600', badge: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Updated' },
  'comment_added': { icon: MessageCircle, color: 'bg-purple-100 text-purple-600', badge: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Comment' },
  'ticket_resolved': { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Resolved' },
  'ticket_closed': { icon: CheckCircle, color: 'bg-slate-100 text-slate-600', badge: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Closed' },
  'user_login': { icon: LogIn, color: 'bg-teal-100 text-teal-600', badge: 'bg-teal-50 text-teal-700 border-teal-200', label: 'Login' },
  'priority_changed': { icon: AlertTriangle, color: 'bg-rose-100 text-rose-600', badge: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Priority' },
  'admin_action': { icon: Shield, color: 'bg-indigo-100 text-indigo-600', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Admin' },
  'default': { icon: Activity, color: 'bg-slate-100 text-slate-600', badge: 'bg-slate-100 text-slate-600 border-slate-200', label: 'System' },
};

function getActionConfig(action) {
  const lower = action?.toLowerCase() || '';
  if (lower.includes('created') || lower.includes('submitted')) return ACTION_CONFIG.ticket_created;
  if (lower.includes('resolved')) return ACTION_CONFIG.ticket_resolved;
  if (lower.includes('closed')) return ACTION_CONFIG.ticket_closed;
  if (lower.includes('comment')) return ACTION_CONFIG.comment_added;
  if (lower.includes('priority')) return ACTION_CONFIG.priority_changed;
  if (lower.includes('updated') || lower.includes('assigned') || lower.includes('status')) return ACTION_CONFIG.ticket_updated;
  if (lower.includes('login') || lower.includes('signin')) return ACTION_CONFIG.user_login;
  if (lower.includes('admin')) return ACTION_CONFIG.admin_action;
  return ACTION_CONFIG.default;
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    analyticsAPI.activityLogs()
      .then(res => setLogs(res.data))
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleExport = () => {
    const csv = ['Action,User,Ticket,Timestamp', ...filtered.map(l =>
      `"${l.action}","${l.user_name}","${l.ticket_id || ''}","${new Date(l.timestamp).toLocaleString()}"`
    )].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Activity logs exported');
  };

  const filtered = logs.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return l.action?.toLowerCase().includes(q) || l.user_name?.toLowerCase().includes(q) || String(l.ticket_id).includes(q);
  });

  // Group logs by date
  const grouped = filtered.reduce((acc, log) => {
    const date = new Date(log.timestamp).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  return (
    <Layout
      title="Activity Logs"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchLogs(true)}
            disabled={refreshing}
            className="btn-ghost"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={handleExport} className="btn-secondary">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      }
    >
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Actions', value: logs.length, color: 'text-brand-blue' },
          { label: 'Tickets Created', value: logs.filter(l => l.action?.toLowerCase().includes('created')).length, color: 'text-blue-600' },
          { label: 'Resolved', value: logs.filter(l => l.action?.toLowerCase().includes('resolved')).length, color: 'text-emerald-600' },
          { label: 'Comments', value: logs.filter(l => l.action?.toLowerCase().includes('comment')).length, color: 'text-purple-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-slate-200/70 rounded-xl p-3.5 text-center shadow-card">
            <p className={`text-xl font-extrabold ${color}`}>{value}</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200/70 rounded-xl p-3.5 shadow-card mb-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by action, user, or ticket ID..."
            className="input-field pl-10"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200/70 rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold text-slate-700">Audit Trail</span>
          </div>
          <span className="text-[11px] text-slate-400 font-semibold">{filtered.length} entries</span>
        </div>

        {loading ? (
          <div className="divide-y divide-slate-50">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex gap-4 px-5 py-4 animate-pulse">
                <div className="skeleton w-8 h-8 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-2/3" />
                  <div className="skeleton h-2.5 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Activity className="w-14 h-14 text-slate-200 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-500">No activity logs found</p>
            <p className="text-xs text-slate-400 mt-1">{search ? 'Try clearing your search query' : 'Activity will appear here as users interact with the system'}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
            {Object.entries(grouped).map(([date, dateLogs]) => (
              <div key={date}>
                <div className="sticky top-0 px-5 py-2.5 bg-slate-50/90 backdrop-blur-sm border-b border-slate-100 z-10">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{date}</p>
                </div>
                {dateLogs.map((log, idx) => {
                  const cfg = getActionConfig(log.action);
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50/70 transition-colors animate-fade-in group"
                      style={{ animationDelay: `${idx * 40}ms`, opacity: 0 }}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${cfg.badge}`}>{cfg.label}</span>
                            <p className="text-xs font-semibold text-slate-800">{log.action}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold whitespace-nowrap shrink-0">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="w-5 h-5 rounded-full bg-brand-blue/10 border border-brand-blue/15 text-brand-blue text-[9px] font-bold flex items-center justify-center">
                            {log.user_name?.charAt(0)}
                          </div>
                          <span className="text-[11px] text-slate-600 font-semibold">{log.user_name}</span>
                          {log.ticket_id && (
                            <>
                              <span className="text-slate-300">·</span>
                              <Link
                                to={`/tickets/${log.ticket_id}`}
                                className="inline-flex items-center gap-1 text-[11px] text-brand-blue hover:text-brand-blue-dark font-semibold hover:underline"
                                onClick={e => e.stopPropagation()}
                              >
                                <Ticket className="w-3 h-3" /> #{log.ticket_id}
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-400 font-medium">
            Showing {filtered.length} of {logs.length} audit entries
          </div>
        )}
      </div>
    </Layout>
  );
}
