import { useEffect, useState } from 'react';
import { BarChart2, Download, RefreshCw, Clock, TrendingUp, Target, Users, Award } from 'lucide-react';
import Layout from '../components/Layout';
import { CategoryChart, PriorityChart, TrendChart, DepartmentChart, ResolutionChart } from '../charts/DashboardCharts';
import { analyticsAPI, ticketAPI } from '../services/api';
import toast from 'react-hot-toast';

const TEAM = [
  { name: 'Sarah Chen',  role: 'Senior IT Analyst',  resolved: 28, avgTime: '3.2h', sat: 96, status: 'online' },
  { name: 'Admin User',  role: 'IT Administrator',    resolved: 21, avgTime: '4.1h', sat: 91, status: 'online' },
  { name: 'Priya Nair',  role: 'IT Specialist',       resolved: 16, avgTime: '5.5h', sat: 88, status: 'away'   },
  { name: 'Marcus Lee',  role: 'IT Support',          resolved: 12, avgTime: '6.8h', sat: 83, status: 'offline'},
];

export default function Analytics() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [period,  setPeriod]  = useState('30');

  const load = () => {
    setLoading(true);
    analyticsAPI.get().then(r => setData(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [period]);

  const exportData = async (fmt) => {
    try {
      const res = fmt === 'csv' ? await ticketAPI.exportCSV() : await ticketAPI.exportExcel();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a   = document.createElement('a'); a.href = url;
      a.download = `analytics.${fmt === 'csv' ? 'csv' : 'xlsx'}`; a.click();
      toast.success(`Exported as ${fmt.toUpperCase()}`);
    } catch { toast.error('Export failed'); }
  };

  if (loading) return (
    <Layout title="Reports & Analytics">
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[...Array(4)].map((_, i) => <div key={i} className="card p-4 h-20 animate-pulse"><div className="skeleton h-full" /></div>)}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="card p-4 h-64 animate-pulse"><div className="skeleton h-full" /></div>)}
      </div>
    </Layout>
  );

  const total       = Object.values(data?.status_distribution || {}).reduce((a, b) => a + b, 0);
  const resolved    = data?.status_distribution?.Resolved || 0;
  const resRate     = total ? Math.round((resolved / total) * 100) : 0;

  const METRICS = [
    { label: 'Total Tickets',    value: total,          icon: BarChart2,  color: '#2563EB' },
    { label: 'Resolved',         value: resolved,       icon: Target,     color: '#22C55E' },
    { label: 'SLA Compliance',   value: `${resRate}%`,  icon: TrendingUp, color: '#6366F1' },
    { label: 'Active Agents',    value: TEAM.length,    icon: Users,      color: '#F59E0B' },
  ];

  const STATUS_COLORS = { online: '#22C55E', away: '#F59E0B', offline: '#94A3B8' };

  return (
    <Layout
      title="Reports & Analytics"
      subtitle="System-wide performance and ticket intelligence"
      actions={
        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex border border-gray-300 rounded overflow-hidden">
            {['7', '30', '90'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${period === p ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                {p}d
              </button>
            ))}
          </div>
          <button onClick={load} className="btn-ghost"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => exportData('csv')}   className="btn-secondary"><Download className="w-4 h-4" /> CSV</button>
          <button onClick={() => exportData('excel')} className="btn-primary"><Download className="w-4 h-4" /> Excel</button>
        </div>
      }
    >
      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {METRICS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 border-l-4" style={{ borderLeftColor: color }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
              </div>
              <Icon className="w-5 h-5 text-gray-300" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="card p-4">
          <h3 className="section-title mb-3">Volume Trend</h3>
          <TrendChart data={data.monthly_trends} />
        </div>
        <div className="card p-4">
          <h3 className="section-title mb-3">SLA Compliance</h3>
          <ResolutionChart rate={resRate} />
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="card p-4">
          <h3 className="section-title mb-3">Category Distribution</h3>
          <CategoryChart data={data.tickets_by_category} />
        </div>
        <div className="card p-4">
          <h3 className="section-title mb-3">Priority Breakdown</h3>
          <PriorityChart data={data.tickets_by_priority} />
        </div>
      </div>

      {/* Department chart */}
      <div className="card p-4 mb-4">
        <h3 className="section-title mb-3">Department Load</h3>
        <DepartmentChart data={data.department_distribution} />
      </div>

      {/* Agent Performance Table */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200">
          <Award className="w-4 h-4 text-amber-500" />
          <h3 className="section-title">Agent Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-12">Rank</th>
                <th>Agent</th>
                <th>Role</th>
                <th>Tickets Resolved</th>
                <th>Avg Resolution</th>
                <th>Satisfaction</th>
                <th className="w-20">Status</th>
              </tr>
            </thead>
            <tbody>
              {TEAM.map((a, i) => (
                <tr key={a.name}>
                  <td>
                    <span className="font-semibold text-gray-500 text-sm">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold flex items-center justify-center shrink-0">
                        {a.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-gray-900">{a.name}</span>
                    </div>
                  </td>
                  <td className="text-gray-500">{a.role}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-20 progress-track">
                        <div className="progress-fill bg-primary-600" style={{ width: `${(a.resolved / 30) * 100}%` }} />
                      </div>
                      <span className="font-semibold">{a.resolved}</span>
                    </div>
                  </td>
                  <td className="text-gray-600">
                    <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gray-400" /> {a.avgTime}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-semibold ${a.sat >= 90 ? 'text-green-600' : a.sat >= 80 ? 'text-amber-600' : 'text-red-600'}`}>{a.sat}%</span>
                      <div className="w-12 progress-track">
                        <div className={`progress-fill ${a.sat >= 90 ? 'bg-green-500' : a.sat >= 80 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${a.sat}%` }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: STATUS_COLORS[a.status] }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[a.status] }} />
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
