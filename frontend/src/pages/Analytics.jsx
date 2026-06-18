import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { CategoryChart, PriorityChart, TrendChart, DepartmentChart, ResolutionChart } from '../charts/DashboardCharts';
import { analyticsAPI } from '../services/api';
import ChartWidget from '../components/ChartWidget';
import { Ticket, Clock, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.get().then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout title="Analytics Dashboard">
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <div className="animate-spin w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full" />
          <p className="text-sm text-slate-400 font-semibold">Generating analytics report...</p>
        </div>
      </Layout>
    );
  }

  const analyticsKPIs = [
    { label: 'Total Tickets', value: data.total_tickets, icon: Ticket, textColor: 'text-brand-blue', bgColor: 'bg-brand-blue/10', borderColor: 'border-brand-blue/20' },
    { label: 'Open Requests', value: data.open_tickets, icon: Clock, textColor: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-100' },
    { label: 'Closed Cases', value: data.closed_tickets, icon: CheckCircle, textColor: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-100' },
    { label: 'Critical Errors', value: data.critical_tickets, icon: AlertTriangle, textColor: 'text-rose-600', bgColor: 'bg-rose-50', borderColor: 'border-rose-100' },
    { label: 'Avg Resolution', value: `${data.avg_resolution_hours}h`, icon: ShieldCheck, textColor: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-100' },
  ];

  return (
    <Layout title="Performance & Analytics">
      {/* Top statistics row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {analyticsKPIs.map(({ label, value, icon: Icon, textColor, bgColor, borderColor }, idx) => (
          <div key={idx} className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center gap-3 shadow-card">
            <div className={`p-2 rounded-lg shrink-0 border ${bgColor} ${borderColor}`}>
              <Icon className={`w-5 h-5 ${textColor}`} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{label}</span>
              <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">{value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget title="Tickets by Category" subtitle="Distribution across IT service classifications">
          <CategoryChart data={data.tickets_by_category} />
        </ChartWidget>

        <ChartWidget title="Tickets by Priority" subtitle="Active volumes grouped by severity levels">
          <PriorityChart data={data.tickets_by_priority} />
        </ChartWidget>

        <ChartWidget title="Monthly Ticket Trends" subtitle="Volume of requests over the past 6 months">
          <TrendChart data={data.monthly_trends} />
        </ChartWidget>

        <ChartWidget title="Resolution Rate" subtitle="Percentage of tickets resolved within SLA">
          <ResolutionChart rate={data.resolution_rate} />
        </ChartWidget>

        <ChartWidget title="Department Distribution" subtitle="Ticket load by company division" className="lg:col-span-2">
          <DepartmentChart data={data.department_distribution} />
        </ChartWidget>
      </div>
    </Layout>
  );
}
