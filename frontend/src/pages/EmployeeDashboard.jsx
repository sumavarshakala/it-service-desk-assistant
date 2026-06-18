import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ticket, Clock, CheckCircle, AlertCircle, PlusCircle, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import DashboardCard from '../components/DashboardCard';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EmployeeDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    dashboardAPI.user().then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout title="My Dashboard">
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <div className="animate-spin w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full" />
          <p className="text-sm text-slate-400 font-semibold">Loading your workspace...</p>
        </div>
      </Layout>
    );
  }

  const kpis = [
    { label: 'Total Tickets', value: data.total_tickets, icon: Ticket, trend: 'up', percentage: 5, color: 'text-brand-blue bg-brand-blue' },
    { label: 'Open Tickets', value: data.open_tickets, icon: AlertCircle, trend: 'down', percentage: 3, color: 'text-blue-500 bg-blue-500' },
    { label: 'In Progress', value: data.in_progress_tickets, icon: Clock, trend: 'up', percentage: 10, color: 'text-amber-500 bg-amber-500' },
    { label: 'Resolved Tickets', value: data.resolved_tickets, icon: CheckCircle, trend: 'up', percentage: 18, color: 'text-emerald-500 bg-emerald-500' },
  ];

  return (
    <Layout
      title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'} 👋`}
      actions={
        <Link to="/tickets/create" className="btn-primary">
          <PlusCircle className="w-4 h-4" /> New Ticket
        </Link>
      }
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((card, idx) => (
          <DashboardCard
            key={idx}
            label={card.label}
            value={card.value}
            icon={card.icon}
            trend={card.trend}
            percentage={card.percentage}
            color={card.color}
          />
        ))}
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Link
          to="/tickets/create"
          className="card bg-gradient-to-br from-brand-blue-dark to-brand-blue text-white p-5 flex items-center justify-between rounded-xl hover:opacity-90 transition-opacity shadow-md"
        >
          <div>
            <h4 className="text-sm font-bold">Submit a New Request</h4>
            <p className="text-blue-200 text-xs mt-1">AI-powered classification included</p>
          </div>
          <ArrowRight className="w-5 h-5 text-blue-200" />
        </Link>

        <Link
          to="/kb"
          className="card bg-white border border-slate-200 p-5 flex items-center justify-between rounded-xl hover:border-brand-teal/30 hover:shadow-md transition-all"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-800">Knowledge Base</h4>
            <p className="text-slate-400 text-xs mt-1">Self-service IT guides & FAQs</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-300" />
        </Link>

        <Link
          to="/tickets"
          className="card bg-white border border-slate-200 p-5 flex items-center justify-between rounded-xl hover:border-brand-blue/30 hover:shadow-md transition-all"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-800">View All My Tickets</h4>
            <p className="text-slate-400 text-xs mt-1">Track status and updates</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-300" />
        </Link>
      </div>

      {/* Recent Tickets Table */}
      <div className="card border-slate-200/80">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">Recent Activity</h3>
          <Link to="/tickets" className="text-xs text-brand-blue hover:text-brand-blue-dark font-bold flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data.recent_tickets?.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              <Ticket className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 text-sm font-semibold">No tickets found yet</p>
            <p className="text-slate-400 text-xs">Click "New Ticket" to report an issue and our AI will assist you instantly.</p>
            <Link to="/tickets/create" className="btn-primary mt-2">
              <PlusCircle className="w-4 h-4" /> Create First Ticket
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-2.5 pr-4">ID</th>
                  <th className="pb-2.5 pr-4">Title</th>
                  <th className="pb-2.5 pr-4">Category</th>
                  <th className="pb-2.5 pr-4">Priority</th>
                  <th className="pb-2.5 pr-4">Status</th>
                  <th className="pb-2.5">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.recent_tickets?.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="py-3 pr-4">
                      <Link to={`/tickets/${t.id}`} className="text-brand-blue hover:text-brand-blue-dark font-bold group-hover:underline">
                        #{t.id}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-slate-800 font-semibold max-w-xs truncate">{t.title}</td>
                    <td className="py-3 pr-4 text-slate-500">{t.category}</td>
                    <td className="py-3 pr-4"><PriorityBadge priority={t.priority} /></td>
                    <td className="py-3 pr-4"><StatusBadge status={t.status} /></td>
                    <td className="py-3 text-slate-400 font-semibold">{new Date(t.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
