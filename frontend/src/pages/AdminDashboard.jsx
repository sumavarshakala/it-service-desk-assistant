import { useEffect, useState } from 'react';
import { Ticket, AlertTriangle, CheckCircle, Clock, Download, Play, BarChart3, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { CategoryChart, PriorityChart, TrendChart, DepartmentChart, ResolutionChart } from '../charts/DashboardCharts';
import { dashboardAPI, ticketAPI, analyticsAPI } from '../services/api';
import DashboardCard from '../components/DashboardCard';
import ChartWidget from '../components/ChartWidget';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [dashRes, analRes] = await Promise.all([
        dashboardAPI.admin(),
        analyticsAPI.get()
      ]);
      setDashboardData(dashRes.data);
      setAnalyticsData(analRes.data);
    } catch (err) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleExport = async (format) => {
    try {
      const res = format === 'csv' ? await ticketAPI.exportCSV() : await ticketAPI.exportExcel();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `tickets_report_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`;
      a.click();
      toast.success(`${format.toUpperCase()} report exported`);
    } catch {
      toast.error('Export failed');
    }
  };

  if (loading) {
    return (
      <Layout title="Admin Dashboard">
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <div className="animate-spin w-8 h-8 border-3 border-brand-blue border-t-transparent rounded-full" />
          <p className="text-sm text-slate-400 font-semibold">Preparing executive dashboard analytics...</p>
        </div>
      </Layout>
    );
  }

  // Compile exact metrics from analyticsData status distribution
  const statusDist = analyticsData?.status_distribution || {};
  
  const openCount = statusDist['Open'] || 0;
  const inProgressCount = (statusDist['In Progress'] || 0) + (statusDist['Assigned'] || 0);
  const resolvedCount = statusDist['Resolved'] || 0;
  const criticalCount = dashboardData?.critical_tickets || 0;
  const totalCount = dashboardData?.total_tickets || 0;

  const kpiCards = [
    { label: 'Total Tickets', value: totalCount, icon: Ticket, trend: 'up', percentage: 8, color: 'text-brand-blue bg-brand-blue' },
    { label: 'Open Tickets', value: openCount, icon: Clock, trend: 'down', percentage: 4, color: 'text-blue-500 bg-blue-500' },
    { label: 'In Progress', value: inProgressCount, icon: Play, trend: 'up', percentage: 12, color: 'text-amber-500 bg-amber-500' },
    { label: 'Resolved Tickets', value: resolvedCount, icon: CheckCircle, trend: 'up', percentage: 15, color: 'text-emerald-500 bg-emerald-500' },
    { label: 'Critical Tickets', value: criticalCount, icon: AlertTriangle, trend: 'down', percentage: 22, color: 'text-rose-500 bg-rose-500' },
  ];

  return (
    <Layout
      title="System Overview"
      actions={
        <div className="flex gap-2">
          <button onClick={() => handleExport('csv')} className="btn-secondary">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => handleExport('excel')} className="btn-primary">
            <Download className="w-4 h-4" /> Export Excel
          </button>
        </div>
      }
    >
      {/* Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {kpiCards.map((card, idx) => (
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

      {/* SLA & Time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="card border-slate-200/80 bg-slate-50/20 p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Resolution Time</span>
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight mt-1 block">
              {dashboardData.avg_resolution_hours || '0.0'} Hours
            </span>
          </div>
          <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="card border-slate-200/80 bg-slate-50/20 p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SLA Resolution Rate</span>
            <span className="text-2xl font-extrabold text-emerald-600 tracking-tight mt-1 block">
              {dashboardData.resolution_rate || '0.0'}%
            </span>
          </div>
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="card border-slate-200/80 bg-slate-50/20 p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Categories Active</span>
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight mt-1 block">
              {Object.keys(dashboardData.tickets_by_category || {}).length} Active
            </span>
          </div>
          <div className="w-10 h-10 bg-brand-blue/5 border border-brand-blue/10 text-brand-blue-dark rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartWidget title="Tickets by Category" subtitle="Distribution across departments and services">
          <CategoryChart data={dashboardData.tickets_by_category} />
        </ChartWidget>

        <ChartWidget title="Tickets by Priority" subtitle="Total open tickets filtered by priority level">
          <PriorityChart data={dashboardData.tickets_by_priority} />
        </ChartWidget>

        <ChartWidget title="Monthly Ticket Trends" subtitle="Incoming requests volumes over the past 6 months">
          <TrendChart data={dashboardData.monthly_trends} />
        </ChartWidget>

        <ChartWidget title="Resolution Performance Rate" subtitle="Percentage of tickets closed within SLA">
          <ResolutionChart rate={dashboardData.resolution_rate} />
        </ChartWidget>
      </div>

      {/* Distribution & Activity row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartWidget 
          title="Department Distribution" 
          subtitle="Ticket submissions grouped by company department"
          className="lg:col-span-2"
        >
          <DepartmentChart data={dashboardData.department_distribution} />
        </ChartWidget>

        {/* Recent Activity Card */}
        <div className="card border-slate-200 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recent Activity Logs</h4>
              <p className="text-[10px] text-slate-400">Real-time action stream</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 max-h-60 pr-1">
            {dashboardData.recent_activity?.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">No recent actions logged.</div>
            ) : (
              dashboardData.recent_activity?.map((log) => (
                <div key={log.id} className="flex gap-3 text-xs border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                  <div className="w-1.5 h-1.5 bg-brand-blue rounded-full mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-705 leading-snug font-medium">{log.action}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-semibold">
                      <span className="text-slate-650">{log.user_name}</span>
                      <span>•</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
