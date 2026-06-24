import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PlusCircle, Download, ChevronLeft, ChevronRight, Search, X, SlidersHorizontal } from 'lucide-react';
import Layout from '../components/Layout';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { ticketAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['Network Issues', 'Software Issues', 'Hardware Issues', 'Email Problems', 'Account Access', 'Security Issues', 'Printer Issues', 'Other'];
const PRIORITIES  = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES    = ['Open', 'In Progress', 'Assigned', 'Resolved', 'Closed'];
const PAGE_SIZE   = 20;

function getSLAUrgency(t) {
  if (['Resolved', 'Closed'].includes(t.status)) return null;
  const hours  = { Critical: 4, High: 8, Medium: 24, Low: 72 };
  const limit  = hours[t.priority] || 24;
  const diff   = (new Date(new Date(t.created_at).getTime() + limit * 3600000) - new Date()) / 3600000;
  if (diff <= 0)          return 'breached';
  if (diff <= 1)          return 'critical';
  if (diff <= limit * .25) return 'warning';
  return 'ok';
}
const SLA_LABEL = { ok: 'On Track', warning: 'Warning', critical: 'Critical', breached: 'Breached' };
const SLA_CLS   = { ok: 'text-green-600', warning: 'text-amber-600', critical: 'text-red-600', breached: 'text-red-700 font-semibold' };

export default function TicketList({ adminView = false }) {
  const [searchParams]   = useSearchParams();
  const { isAdmin }      = useAuth();
  const [tickets, setTickets] = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({ category: '', priority: '', status: '' });
  const [page,    setPage]    = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const p = { page, page_size: PAGE_SIZE };
    if (search)             p.search   = search;
    if (filters.category)   p.category = filters.category;
    if (filters.priority)   p.priority = filters.priority;
    if (filters.status)     p.status   = filters.status;
    ticketAPI.list(p)
      .then(r => { setTickets(r.data.tickets); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [page, filters, search]);

  useEffect(() => { load(); }, [page, filters]);

  const exportData = async (fmt) => {
    try {
      const res = fmt === 'csv' ? await ticketAPI.exportCSV() : await ticketAPI.exportExcel();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a   = document.createElement('a'); a.href = url;
      a.download = `tickets.${fmt === 'csv' ? 'csv' : 'xlsx'}`; a.click();
      toast.success(`Exported as ${fmt.toUpperCase()}`);
    } catch { toast.error('Export failed'); }
  };

  const clearFilter = (key) => { setFilters(p => ({ ...p, [key]: '' })); setPage(1); };
  const activeCount  = Object.values(filters).filter(Boolean).length + (search ? 1 : 0);
  const totalPages   = Math.ceil(total / PAGE_SIZE);

  return (
    <Layout
      title={adminView ? 'Ticket Management' : 'My Tickets'}
      subtitle={`${total} tickets`}
      actions={
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <button onClick={() => exportData('csv')}   className="btn-ghost"><Download className="w-4 h-4" /> CSV</button>
              <button onClick={() => exportData('excel')} className="btn-secondary"><Download className="w-4 h-4" /> Excel</button>
            </>
          )}
          {!adminView && (
            <Link to="/tickets/create" className="btn-primary">
              <PlusCircle className="w-4 h-4" /> New Request
            </Link>
          )}
        </div>
      }
    >
      {/* Filter Bar */}
      <div className="card p-3 mb-4">
        <div className="flex items-center gap-2">
          {/* Search */}
          <form className="relative flex-1" onSubmit={e => { e.preventDefault(); setPage(1); load(); }}>
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by ID, title, category..."
              className="input-field pl-8"
            />
          </form>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(s => !s)}
            className={`btn-secondary gap-1.5 ${activeCount > 0 ? 'border-primary-600 text-primary-700' : ''}`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {activeCount > 0 && <span className="w-4 h-4 bg-primary-600 text-white text-2xs rounded-full flex items-center justify-center">{activeCount}</span>}
          </button>
        </div>

        {/* Filter row */}
        {showFilters && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 flex-wrap">
            {[
              { key: 'category', label: 'Category', options: CATEGORIES },
              { key: 'priority', label: 'Priority',  options: PRIORITIES },
              { key: 'status',   label: 'Status',    options: STATUSES },
            ].map(({ key, label, options }) => (
              <select
                key={key}
                value={filters[key]}
                onChange={e => { setFilters(p => ({ ...p, [key]: e.target.value })); setPage(1); }}
                className="select-field w-40"
              >
                <option value="">All {label}s</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ))}
            {activeCount > 0 && (
              <button onClick={() => { setFilters({ category: '', priority: '', status: '' }); setSearch(''); setPage(1); }}
                className="btn-ghost text-gray-500 text-xs">
                <X className="w-3.5 h-3.5" /> Clear all
              </button>
            )}
          </div>
        )}

        {/* Active filter chips */}
        {activeCount > 0 && !showFilters && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {search && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 border border-primary-200 rounded text-xs font-medium">
                "{search}" <button onClick={() => setSearch('')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {Object.entries(filters).filter(([, v]) => v).map(([k, v]) => (
              <span key={k} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 border border-primary-200 rounded text-xs font-medium capitalize">
                {v} <button onClick={() => clearFilter(k)}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-16">ID</th>
                <th>Title</th>
                {adminView && <th>Submitted By</th>}
                <th className="w-28">Category</th>
                <th className="w-24">Priority</th>
                <th className="w-28">Status</th>
                <th className="w-24">SLA</th>
                {adminView && <th className="w-28">Assigned To</th>}
                <th className="w-24">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(adminView ? 9 : 7)].map((_, j) => (
                      <td key={j}><div className="skeleton h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={adminView ? 9 : 7} className="text-center py-12 text-gray-400 text-sm">
                    No tickets match your filters.
                  </td>
                </tr>
              ) : (
                tickets.map(t => {
                  const sla = getSLAUrgency(t);
                  return (
                    <tr key={t.id}>
                      <td>
                        <Link to={`/tickets/${t.id}`} className="font-mono text-xs text-primary-600 hover:underline font-semibold">
                          #{String(t.id).padStart(4, '0')}
                        </Link>
                      </td>
                      <td>
                        <Link to={`/tickets/${t.id}`} className="text-gray-900 hover:text-primary-600 font-medium block max-w-xs truncate">
                          {t.title}
                        </Link>
                      </td>
                      {adminView && (
                        <td>
                          <span className="text-sm text-gray-600">{t.employee_name}</span>
                        </td>
                      )}
                      <td><span className="text-xs text-gray-500">{t.category}</span></td>
                      <td><PriorityBadge priority={t.priority} /></td>
                      <td><StatusBadge status={t.status} /></td>
                      <td>
                        {sla
                          ? <span className={`text-xs ${SLA_CLS[sla]}`}>{SLA_LABEL[sla]}</span>
                          : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      {adminView && (
                        <td><span className="text-sm text-gray-600">{t.admin_name || <span className="text-gray-300 italic text-xs">Unassigned</span>}</span></td>
                      )}
                      <td className="text-xs text-gray-400">
                        {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded disabled:opacity-40 disabled:pointer-events-none transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                const p = i + 1;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-7 h-7 text-xs rounded transition-colors ${page === p ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                    {p}
                  </button>
                );
              })}
              {totalPages > 7 && <span className="text-gray-400 text-xs px-1">…</span>}
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded disabled:opacity-40 disabled:pointer-events-none transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
