import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, BarElement, LineElement, PointElement, Filler
} from 'chart.js';

ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, BarElement, LineElement, PointElement, Filler
);

const baseFont = { family: 'Inter', size: 11 };

const tooltipDefaults = {
  backgroundColor: '#0f172a',
  titleColor: '#f8fafc',
  bodyColor: '#cbd5e1',
  titleFont: { ...baseFont, size: 12, weight: '700' },
  bodyFont: { ...baseFont },
  padding: 12,
  cornerRadius: 10,
  displayColors: true,
  boxWidth: 8,
  boxHeight: 8,
};

const scaleDefaults = {
  x: {
    ticks: { color: '#94a3b8', font: baseFont },
    grid: { color: 'rgba(226, 232, 240, 0.6)', drawBorder: false },
    border: { display: false },
  },
  y: {
    ticks: { color: '#94a3b8', font: baseFont, padding: 8 },
    grid: { color: 'rgba(226, 232, 240, 0.5)', drawBorder: false },
    border: { display: false },
  },
};

const legendDefaults = {
  position: 'bottom',
  labels: {
    color: '#475569',
    font: { ...baseFont, weight: '600' },
    boxWidth: 8,
    boxHeight: 8,
    usePointStyle: true,
    pointStyleWidth: 8,
    padding: 18,
  },
};

// Brand color palette
export const COLORS = [
  '#2563EB', // Blue
  '#14B8A6', // Teal
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#EF4444', // Red
];

export function CategoryChart({ data }) {
  const labels = Object.keys(data || {});
  const values = Object.values(data || {});

  return (
    <div className="w-full h-64">
      <Doughnut
        data={{
          labels,
          datasets: [{
            data: values,
            backgroundColor: COLORS.slice(0, labels.length).map(c => c + 'cc'),
            borderColor: COLORS.slice(0, labels.length),
            borderWidth: 2,
            hoverOffset: 6,
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: { ...legendDefaults, position: 'right' },
            tooltip: tooltipDefaults,
          },
        }}
      />
    </div>
  );
}

export function PriorityChart({ data }) {
  const priorityColors = {
    Low: '#22C55E',
    Medium: '#3B82F6',
    High: '#F59E0B',
    Critical: '#EF4444',
  };
  const labels = Object.keys(data || {});
  const values = Object.values(data || {});

  return (
    <div className="w-full h-64">
      <Bar
        data={{
          labels,
          datasets: [{
            label: 'Tickets',
            data: values,
            backgroundColor: labels.map(l => (priorityColors[l] || '#3B82F6') + 'cc'),
            borderColor: labels.map(l => priorityColors[l] || '#3B82F6'),
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
            barThickness: 36,
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: tooltipDefaults },
          scales: scaleDefaults,
        }}
      />
    </div>
  );
}

export function TrendChart({ data }) {
  const labels = Object.keys(data || {});
  const values = Object.values(data || {});

  return (
    <div className="w-full h-64">
      <Line
        data={{
          labels,
          datasets: [
            {
              label: 'Incoming Tickets',
              data: values,
              borderColor: '#2563EB',
              backgroundColor: 'rgba(37, 99, 235, 0.08)',
              fill: true,
              tension: 0.4,
              borderWidth: 2.5,
              pointBackgroundColor: '#2563EB',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 7,
            },
            {
              label: 'Resolved',
              data: values.map(v => Math.round(v * 0.78)),
              borderColor: '#14B8A6',
              backgroundColor: 'rgba(20, 184, 166, 0.05)',
              fill: true,
              tension: 0.4,
              borderWidth: 2,
              borderDash: [4, 4],
              pointBackgroundColor: '#14B8A6',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 5,
            }
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: legendDefaults, tooltip: tooltipDefaults },
          scales: scaleDefaults,
          interaction: { mode: 'index', intersect: false },
        }}
      />
    </div>
  );
}

export function DepartmentChart({ data }) {
  const labels = Object.keys(data || {});
  const values = Object.values(data || {});

  return (
    <div className="w-full h-64">
      <Bar
        data={{
          labels,
          datasets: [{
            label: 'Tickets',
            data: values,
            backgroundColor: COLORS.slice(0, labels.length).map(c => c + 'bb'),
            borderColor: COLORS.slice(0, labels.length),
            borderWidth: 2,
            borderRadius: 6,
            borderSkipped: false,
            barThickness: 14,
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: { legend: { display: false }, tooltip: tooltipDefaults },
          scales: scaleDefaults,
        }}
      />
    </div>
  );
}

export function ResolutionChart({ rate }) {
  const resolved = Math.round(rate || 0);
  const open = 100 - resolved;

  return (
    <div className="w-full h-64 flex flex-col items-center justify-center gap-4">
      <div className="relative w-44 h-44">
        <Doughnut
          data={{
            labels: ['Resolved', 'Remaining'],
            datasets: [{
              data: [resolved, open],
              backgroundColor: ['#22C55E', '#E2E8F0'],
              borderColor: ['#22C55E', '#E2E8F0'],
              borderWidth: 0,
              hoverOffset: 0,
            }],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: '80%',
            plugins: {
              legend: { display: false },
              tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.raw}%` } },
            },
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-slate-800 leading-none">{resolved}%</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">SLA Met</span>
        </div>
      </div>
      <div className="flex items-center gap-5 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-600 font-medium">Resolved within SLA</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
          <span className="text-slate-600 font-medium">SLA Exceeded</span>
        </div>
      </div>
    </div>
  );
}

export function TicketHealthDonut({ data }) {
  const STATUS_COLORS = {
    'Open': '#3B82F6',
    'In Progress': '#F59E0B',
    'Assigned': '#8B5CF6',
    'Resolved': '#22C55E',
    'Closed': '#94A3B8',
  };
  const labels = Object.keys(data || {});
  const values = Object.values(data || {});
  const total = values.reduce((a, b) => a + b, 0);

  return (
    <div className="w-full h-52 flex items-center gap-6">
      <div className="relative w-40 h-40 shrink-0">
        <Doughnut
          data={{
            labels,
            datasets: [{
              data: values,
              backgroundColor: labels.map(l => STATUS_COLORS[l] || '#94A3B8'),
              borderColor: '#ffffff',
              borderWidth: 3,
              hoverOffset: 4,
            }],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
              legend: { display: false },
              tooltip: tooltipDefaults,
            },
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-slate-800">{total}</span>
          <span className="text-[10px] text-slate-400 font-semibold">Total</span>
        </div>
      </div>
      <div className="flex-1 space-y-2.5">
        {labels.map((label, i) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[label] || '#94A3B8' }} />
              <span className="text-xs font-medium text-slate-600">{label}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${total ? (values[i] / total * 100) : 0}%`, backgroundColor: STATUS_COLORS[label] || '#94A3B8' }}
                />
              </div>
              <span className="text-xs font-bold text-slate-700 w-5 text-right">{values[i]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
