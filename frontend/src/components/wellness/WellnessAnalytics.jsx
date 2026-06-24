import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { TrendingUp } from 'lucide-react';

// Register Chart.js modules
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function WellnessAnalytics({ profileData }) {
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      {
        label: 'Focus Hours',
        data: [2.5, 3.0, 1.5, 4.0, 3.5],
        backgroundColor: 'rgba(59, 130, 246, 0.75)',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.raw}h focused`,
        },
        backgroundColor: '#fff',
        titleColor: '#334155',
        bodyColor: '#64748b',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 10 } },
        border: { display: false },
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { color: '#94a3b8', font: { size: 10 } },
        border: { display: false },
      },
    },
  };

  return (
    <div className="bg-white border border-slate-200/70 rounded-xl p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-blue" />
          <h3 className="font-extrabold text-slate-800 text-lg">Weekly Activity</h3>
        </div>
      </div>

      <div className="h-48 mb-4">
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Focus</p>
          <p className="text-sm font-extrabold text-slate-800">2.9 hrs/day</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Sessions</p>
          <p className="text-sm font-extrabold text-slate-800">{profileData?.total_focus_sessions || 0}</p>
        </div>
      </div>
    </div>
  );
}
