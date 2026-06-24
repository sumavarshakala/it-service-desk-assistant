import { useEffect, useState } from 'react';
import { Ticket, AlertTriangle, CheckCircle, Clock, Download, RefreshCw,
  TrendingUp, TrendingDown, BarChart2, Users, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { dashboardAPI, ticketAPI, analyticsAPI } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { CategoryChart, PriorityChart, TrendChart, DepartmentChart } from '../charts/DashboardCharts';

function KpiTile({ label, value, icon: Icon, trend, pct, borderColor }) {
  const isUp = trend === 'up';
  return (
    <div className={`card p-4 border-l-4`} style={{ borderLeftColor: borderColor }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        </div>
        <Icon className="w-5 h-5 text-gray-400 mt-0.5" />
      </div>
      <div className="flex items-center gap-1 mt-2">
        {isUp ? <TrendingUp className="w-3 h-3 text-green-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
        <span className={`text-xs font-medium ${isUp ? 'text-green-600' : 'text-red-600'}`}>{pct}%</span>
        <span className="text-xs text-gray-400">vs last period</span>
      </div>
    </div>
  );
}

function RecentTicketsTable({ tickets }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="section-title">Recent Tickets</h3>
        <Link to="/tickets" className="text-xs text-primary-600 hover:underline font-medium">View all →</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th><th>Title</th><th>Category</th><th>Priority</th><th>Status</th><th>Created</th>
            </tr>
          </thead>
          <tbody>
            {tickets.slice(0, 8).map(t => (
              <tr key={t.id}>
                <td>
                  <Link to={`/tickets/${t.id}`} className="font-mono text-primary-600 hover:underline text-xs font-medium">
                    #{String(t.id).padStart(4, '0')}
                  </Link>
                </td>
                <td>
                  <Link to={`/tickets/${t.id}`} className="text-gray-900 hover:text-primary-600 font-medium line-clamp-1 max-w-xs block">
                    {t.title}
                  </Link>
                </td>
                <td className="text-gray-500 text-xs">{t.category}</td>
                <td><PriorityBadge priority={t.priority} /></td>
                <td><StatusBadge status={t.status} /></td>
                <td className="text-gray-400 text-xs">
                  {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">No tickets found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [dashData, setDashData] = useState(null);
  const [analData, setAnalData] = useState(null);
  const [tickets,  setTickets]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const [d, a, t] = await Promise.all([
        dashboardAPI.admin(),
        analyticsAPI.get(),
        ticketAPI.list({ page: 1, page_size: 8 }),
      ]);
      setDashData(d.data);
      setAnalData(a.data);
      setTickets(t.data.tickets);
    } catch {
      toast.error('Failed to load dashboard');
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleExport = async (fmt) => {
    try {
      const res = fmt === 'csv' ? await ticketAPI.exportCSV() : await ticketAPI.exportExcel();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `tickets.${fmt === 'csv' ? 'csv' : 'xlsx'}`;
      a.click();
      toast.success(`Exported as ${fmt.toUpperCase()}`);
    } catch { toast.error('Export failed'); }
  };

  if (loading) {
    return (
      <Layout title="System Overview">
        <div className="grid grid-cols-5 gap-4 mb-5">
          {[...Array(5)].map((_, i) => <div key={i} className="card p-4 h-24 animate-pulse"><div className="skeleton h-4 w-24 mb-2" /><div className="skeleton h-7 w-16" /></div>)}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="card p-4 h-64 animate-pulse"><div className="skeleton h-full w-full" /></div>)}
        </div>
      </Layout>
    );
  }

  const statusDist  = analData?.status_distribution || {};
  const open        = statusDist['Open'] || 0;
  const inProgress  = (statusDist['In Progress'] || 0) + (statusDist['Assigned'] || 0);
  const resolved    = statusDist['Resolved'] || 0;
  const critical    = dashData?.critical_tickets || 0;
  const total       = dashData?.total_tickets || 0;
  const resRate     = dashData?.resolution_rate || 0;
  const avgRes      = dashData?.avg_resolution_hours || 0;

  const KPIs = [
    { label: 'Total Tickets',    value: total,      icon: Ticket,        trend: 'up',   pct: 8,  borderColor: '#2563EB' },
    { label: 'Open',             value: open,       icon: Clock,         trend: 'down', pct: 4,  borderColor: '#64748B' },
    { label: 'In Progress',      value: inProgress, icon: Activity,      trend: 'up',   pct: 12, borderColor: '#F59E0B' },
    { label: 'Resolved',         value: resolved,   icon: CheckCircle,   trend: 'up',   pct: 15, borderColor: '#22C55E' },
    { label: 'Critical',         value: critical,   icon: AlertTriangle, trend: 'down', pct: 22, borderColor: '#EF4444' },
  ];

  const TOP_CATS = [
    { label: 'Network Issues',   pct: 28 },
    { label: 'Email Problems',   pct: 22 },
    { label: 'Password Reset',   pct: 18 },
    { label: 'Hardware Issues',  pct: 16 },
    { label: 'Software Install', pct: 12 },
  ];

  return (
    <Layout
      title="System Overview"
      subtitle={`${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
      actions={
        <div className="flex items-center gap-2">
          <button onClick={() => fetchData(true)} disabled={refreshing} className="btn-ghost">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button onClick={() => handleExport('csv')} className="btn-secondary">
            <Download className="w-4 h-4" /> CSV
          </button>
          <button onClick={() => handleExport('excel')} className="btn-primary">
            <Download className="w-4 h-4" /> Excel
          </button>
        </div>
      }
    >
      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-5">
        {KPIs.map(k => <KpiTile key={k.label} {...k} />)}
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Avg Resolution Time', value: `${avgRes} hrs`,   icon: Clock },
          { label: 'SLA Resolution Rate', value: `${resRate}%`,     icon: TrendingUp },
          { label: 'Active Categories',   value: Object.keys(dashData.tickets_by_category || {}).length, icon: BarChart2 },
          { label: 'Active Departments',  value: Object.keys(dashData.department_distribution || {}).length, icon: Users },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-3 flex items-center gap-3">
            <Icon className="w-5 h-5 text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-base font-semibold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts + Recent Activity */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="card p-4 col-span-2">
          <h3 className="section-title mb-3">Ticket Volume Trend</h3>
          <TrendChart data={dashData.monthly_trends} />
        </div>
        <div className="card p-4">
          <h3 className="section-title mb-3">Top Issue Categories</h3>
          <div className="space-y-3">
            {TOP_CATS.map((c, i) => (
              <div key={c.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 font-medium">{c.label}</span>
                  <span className="text-gray-900 font-semibold">{c.pct}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill bg-primary-600" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second charts row */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="card p-4">
          <h3 className="section-title mb-3">Category Distribution</h3>
          <CategoryChart data={dashData.tickets_by_category} />
        </div>
        <div className="card p-4">
          <h3 className="section-title mb-3">Priority Breakdown</h3>
          <PriorityChart data={dashData.tickets_by_priority} />
        </div>
      </div>

      {/* Recent Tickets Table */}
      <RecentTicketsTable tickets={tickets} />

      {/* Activity stream */}
      {dashData.recent_activity?.length > 0 && (
        <div className="card mt-4 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="section-title">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-56 overflow-y-auto">
            {dashData.recent_activity.map((log, i) => (
              <div key={log.id || i} className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                  {log.user_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{log.action}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {log.user_name} · {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
