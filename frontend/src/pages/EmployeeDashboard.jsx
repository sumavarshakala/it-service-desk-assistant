import { useEffect, useState } from 'react';
import { PlusCircle, Clock, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { dashboardAPI, ticketAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import SLAWidget from '../components/SLAWidget';

function getSLAUrgency(ticket) {
  if (['Resolved', 'Closed'].includes(ticket.status)) return null;
  const created = new Date(ticket.created_at);
  const hours = { Critical: 4, High: 8, Medium: 24, Low: 72 };
  const limit = hours[ticket.priority] || 24;
  const diff  = (new Date(created.getTime() + limit * 3600000) - new Date()) / 3600000;
  if (diff <= 0)     return 'breached';
  if (diff <= 1)     return 'critical';
  if (diff <= limit * 0.25) return 'warning';
  return 'ok';
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [data,    setData]    = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([dashboardAPI.user(), ticketAPI.list({ page: 1, page_size: 10 })])
      .then(([d, t]) => { setData(d.data); setTickets(t.data.tickets); })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout title="My Dashboard">
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[...Array(3)].map((_, i) => <div key={i} className="card p-4 h-20 animate-pulse"><div className="skeleton h-4 w-24 mb-2" /><div className="skeleton h-6 w-12" /></div>)}
        </div>
        <div className="card h-64 animate-pulse" />
      </Layout>
    );
  }

  const open        = tickets.filter(t => t.status === 'Open').length;
  const inProgress  = tickets.filter(t => ['In Progress', 'Assigned'].includes(t.status)).length;
  const resolved    = tickets.filter(t => t.status === 'Resolved').length;
  const urgent      = tickets.filter(t => ['Critical', 'High'].includes(t.priority) && !['Resolved', 'Closed'].includes(t.status));
  const firstOpen   = tickets.find(t => !['Resolved', 'Closed'].includes(t.status));

  return (
    <Layout
      title={`Welcome back, ${user?.name?.split(' ')[0]}`}
      subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      actions={
        <Link to="/tickets/create" className="btn-primary">
          <PlusCircle className="w-4 h-4" /> New Request
        </Link>
      }
    >
      {/* Urgent alert banner */}
      {urgent.length > 0 && (
        <div className="mb-4 flex items-center gap-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
          <span>
            <span className="font-semibold">{urgent.length} urgent ticket{urgent.length > 1 ? 's' : ''}</span>
            {' '}require your attention — {urgent.map(t => `#${t.id}`).join(', ')}
          </span>
          <Link to="/tickets" className="ml-auto text-red-700 font-medium underline text-xs">View tickets</Link>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Submitted',  value: tickets.length, icon: ExternalLink,  color: '#2563EB' },
          { label: 'Open',             value: open,           icon: Clock,          color: '#64748B' },
          { label: 'In Progress',      value: inProgress,     icon: AlertTriangle,  color: '#F59E0B' },
          { label: 'Resolved',         value: resolved,       icon: CheckCircle,    color: '#22C55E' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`card p-4 border-l-4`} style={{ borderLeftColor: color }}>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
              <Icon className="w-5 h-5 text-gray-300" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* My Tickets Table */}
        <div className="col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="section-title">My Tickets</h3>
            <Link to="/tickets" className="text-xs text-primary-600 hover:underline font-medium">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Title</th><th>Priority</th><th>Status</th><th>SLA</th><th>Created</th></tr>
              </thead>
              <tbody>
                {tickets.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">No tickets yet. <Link to="/tickets/create" className="text-primary-600 hover:underline">Submit your first request</Link></td></tr>
                )}
                {tickets.map(t => {
                  const sla = getSLAUrgency(t);
                  return (
                    <tr key={t.id}>
                      <td>
                        <Link to={`/tickets/${t.id}`} className="font-mono text-xs text-primary-600 hover:underline font-medium">#{String(t.id).padStart(4, '0')}</Link>
                      </td>
                      <td>
                        <Link to={`/tickets/${t.id}`} className="text-gray-900 hover:text-primary-600 font-medium max-w-xs block truncate">
                          {t.title}
                        </Link>
                        <span className="text-xs text-gray-400">{t.category}</span>
                      </td>
                      <td><PriorityBadge priority={t.priority} /></td>
                      <td><StatusBadge status={t.status} /></td>
                      <td>
                        {sla ? (
                          <span className={`text-xs font-medium ${sla === 'ok' ? 'text-green-600' : sla === 'warning' ? 'text-amber-600' : 'text-red-600'}`}>
                            {sla === 'ok' ? 'On Track' : sla === 'warning' ? 'Warning' : sla === 'breached' ? 'Breached' : 'Critical'}
                          </span>
                        ) : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      <td className="text-xs text-gray-400">
                        {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {firstOpen && (
            <div className="card p-4">
              <h3 className="section-title mb-3">SLA Status</h3>
              <SLAWidget ticket={firstOpen} />
            </div>
          )}

          {/* Quick actions */}
          <div className="card p-4">
            <h3 className="section-title mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Submit New Request', to: '/tickets/create', primary: true },
                { label: 'Browse Knowledge Base', to: '/kb' },
                { label: 'Take a Wellness Break', to: '/wellness' },
              ].map(({ label, to, primary }) => (
                <Link
                  key={to}
                  to={to}
                  className={`block text-sm px-3 py-2 rounded border transition-colors ${
                    primary
                      ? 'bg-primary-600 text-white border-primary-700 hover:bg-primary-700'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
