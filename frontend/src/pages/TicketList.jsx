import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PlusCircle, ExternalLink } from 'lucide-react';
import Layout from '../components/Layout';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import { ticketAPI } from '../services/api';

const CATEGORIES = ['Network Issues', 'Software Issues', 'Hardware Issues', 'Email Problems', 'Account Access', 'Security Issues', 'Printer Issues', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES = ['Open', 'In Progress', 'Assigned', 'Resolved', 'Closed'];
const PAGE_SIZE = 15;

export default function TicketList({ adminView = false }) {
  const [searchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const [filterValues, setFilterValues] = useState({ category: '', priority: '', status: '' });
  const [page, setPage] = useState(1);

  const fetchTickets = useCallback(() => {
    setLoading(true);
    const params = { page, page_size: PAGE_SIZE };
    if (searchValue) params.search = searchValue;
    if (filterValues.category) params.category = filterValues.category;
    if (filterValues.priority) params.priority = filterValues.priority;
    if (filterValues.status) params.status = filterValues.status;

    ticketAPI.list(params)
      .then((res) => { setTickets(res.data.tickets); setTotal(res.data.total); })
      .finally(() => setLoading(false));
  }, [page, filterValues, searchValue]);

  useEffect(() => { fetchTickets(); }, [page, filterValues]);

  const handleSearchSubmit = () => {
    setPage(1);
    fetchTickets();
  };

  const handleFilterChange = (name, value) => {
    setFilterValues(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilterValues({ category: '', priority: '', status: '' });
    setSearchValue('');
    setPage(1);
  };

  const columns = [
    {
      header: 'Ticket ID',
      render: (row) => (
        <Link to={`/tickets/${row.id}`} className="text-brand-blue hover:text-brand-blue-dark font-bold hover:underline flex items-center gap-1">
          #{row.id} <ExternalLink className="w-3 h-3 opacity-50" />
        </Link>
      ),
    },
    {
      header: 'Title',
      render: (row) => (
        <div className="max-w-xs">
          <Link to={`/tickets/${row.id}`} className="text-slate-800 font-semibold hover:text-brand-blue text-xs leading-snug block truncate">
            {row.title}
          </Link>
        </div>
      ),
    },
    adminView && {
      header: 'Employee',
      render: (row) => <span className="text-slate-600 font-medium">{row.employee_name}</span>,
    },
    {
      header: 'Category',
      render: (row) => (
        <span className="text-slate-500 font-medium text-[11px] bg-slate-100 px-2 py-0.5 rounded-full">
          {row.category}
        </span>
      ),
    },
    {
      header: 'Priority',
      render: (row) => <PriorityBadge priority={row.priority} />,
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    adminView && {
      header: 'Assigned To',
      render: (row) => (
        <span className="text-slate-500 text-xs font-medium">
          {row.admin_name || <span className="italic text-slate-300">Unassigned</span>}
        </span>
      ),
    },
    {
      header: 'Created',
      render: (row) => (
        <span className="text-slate-400 font-semibold text-[11px]">
          {new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
        </span>
      ),
    },
  ].filter(Boolean);

  return (
    <Layout
      title={adminView ? 'Ticket Management' : 'My Tickets'}
      actions={
        !adminView && (
          <Link to="/tickets/create" className="btn-primary">
            <PlusCircle className="w-4 h-4" /> New Ticket
          </Link>
        )
      }
    >
      <SearchBar
        searchPlaceholder="Search by ticket ID, title, description..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchSubmit={handleSearchSubmit}
        filters={[
          { name: 'category', label: 'Category', value: filterValues.category, options: CATEGORIES, placeholder: 'All Categories' },
          { name: 'priority', label: 'Priority', value: filterValues.priority, options: PRIORITIES, placeholder: 'All Priorities' },
          { name: 'status', label: 'Status', value: filterValues.status, options: STATUSES, placeholder: 'All Statuses' },
        ]}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <DataTable
        columns={columns}
        data={tickets}
        loading={loading}
        emptyMessage="No tickets match your current filters. Try adjusting your search criteria."
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </Layout>
  );
}
