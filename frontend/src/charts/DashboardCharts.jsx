import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, BarElement, LineElement, PointElement, Filler
} from 'chart.js';

ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, BarElement, LineElement, PointElement, Filler
);

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { 
        color: '#475569', 
        font: { size: 11, family: 'Inter', weight: '500' },
        boxWidth: 10,
        boxHeight: 10,
        usePointStyle: true,
        padding: 15
      },
    },
    tooltip: {
      backgroundColor: '#0f172a',
      titleColor: '#ffffff',
      bodyColor: '#e2e8f0',
      titleFont: { family: 'Inter', size: 12, weight: 'bold' },
      bodyFont: { family: 'Inter', size: 11 },
      padding: 10,
      cornerRadius: 8,
      displayColors: true,
    }
  },
  scales: {
    x: {
      ticks: { color: '#64748b', font: { size: 10, family: 'Inter' } },
      grid: { color: '#f1f5f9' },
      border: { dash: [4, 4] }
    },
    y: {
      ticks: { color: '#64748b', font: { size: 10, family: 'Inter' } },
      grid: { color: '#f1f5f9' },
      border: { dash: [4, 4] }
    },
  },
};

const COLORS = [
  '#2563EB', // Brand Blue
  '#14B8A6', // Brand Teal
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#EF4444', // Red
];

export function CategoryChart({ data }) {
  const labels = Object.keys(data || {});
  const values = Object.values(data || {});

  return (
    <div className="w-full h-60">
      <Doughnut
        data={{
          labels,
          datasets: [{
            data: values,
            backgroundColor: COLORS.slice(0, labels.length),
            borderColor: '#ffffff',
            borderWidth: 2,
            hoverOffset: 4
          }],
        }}
        options={{ 
          ...chartDefaults, 
          scales: undefined,
          plugins: {
            ...chartDefaults.plugins,
            legend: {
              ...chartDefaults.plugins.legend,
              position: 'right'
            }
          }
        }}
      />
    </div>
  );
}

export function PriorityChart({ data }) {
  const labels = Object.keys(data || {});
  const values = Object.values(data || {});
  const priorityColors = {
    Low: '#10B981', // Emerald
    Medium: '#F59E0B', // Amber
    High: '#F97316', // Orange
    Critical: '#EF4444', // Red
  };

  return (
    <div className="w-full h-60">
      <Bar
        data={{
          labels,
          datasets: [{
            label: 'Tickets',
            data: values,
            backgroundColor: labels.map((l) => priorityColors[l] || '#3B82F6'),
            borderRadius: 6,
            barThickness: 32,
          }],
        }}
        options={{
          ...chartDefaults,
          plugins: {
            ...chartDefaults.plugins,
            legend: { display: false }
          }
        }}
      />
    </div>
  );
}

export function TrendChart({ data }) {
  const labels = Object.keys(data || {});
  const values = Object.values(data || {});

  return (
    <div className="w-full h-60">
      <Line
        data={{
          labels,
          datasets: [{
            label: 'Monthly Tickets',
            data: values,
            borderColor: '#2563EB',
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            fill: true,
            tension: 0.3,
            borderWidth: 2,
            pointBackgroundColor: '#2563EB',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          }],
        }}
        options={{
          ...chartDefaults,
          plugins: {
            ...chartDefaults.plugins,
            legend: { display: false }
          }
        }}
      />
    </div>
  );
}

export function DepartmentChart({ data }) {
  const labels = Object.keys(data || {});
  const values = Object.values(data || {});

  return (
    <div className="w-full h-60">
      <Bar
        data={{
          labels,
          datasets: [{
            label: 'Department Load',
            data: values,
            backgroundColor: '#8B5CF6',
            borderRadius: 6,
            barThickness: 16,
          }],
        }}
        options={{ 
          ...chartDefaults, 
          indexAxis: 'y',
          plugins: {
            ...chartDefaults.plugins,
            legend: { display: false }
          }
        }}
      />
    </div>
  );
}

export function ResolutionChart({ rate }) {
  const resolved = rate || 0;
  const open = 100 - resolved;

  return (
    <div className="w-full h-60 flex flex-col items-center justify-center">
      <div className="relative w-40 h-40">
        <Doughnut
          data={{
            labels: ['Resolved', 'Open'],
            datasets: [{
              data: [resolved, open],
              backgroundColor: ['#22C55E', '#E2E8F0'],
              borderColor: '#ffffff',
              borderWidth: 2,
            }],
          }}
          options={{
            ...chartDefaults,
            scales: undefined,
            cutout: '75%',
            plugins: {
              legend: { display: false },
              tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.raw}%` } },
            },
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-slate-800 leading-none">{resolved}%</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Rate</span>
        </div>
      </div>
    </div>
  );
}
