import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function DataTable({ 
  columns, 
  data = [], 
  loading = false, 
  emptyMessage = "No data available",
  total = 0,
  page = 1,
  pageSize = 15,
  onPageChange
}) {
  const totalPages = Math.ceil(total / pageSize);
  const startRange = (page - 1) * pageSize + 1;
  const endRange = Math.min(page * pageSize, total);

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th key={idx} className="py-3.5 px-4 font-semibold text-slate-500 select-none">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="animate-spin w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full" />
                    <span>Loading data details...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr 
                  key={row.id || rowIdx} 
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="py-3.5 px-4 text-slate-600 font-medium">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {!loading && total > pageSize && onPageChange && (
        <div className="bg-white border-t border-slate-100 px-4 py-3 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Showing <span className="font-bold text-slate-700">{startRange}</span> to{' '}
            <span className="font-bold text-slate-700">{endRange}</span> of{' '}
            <span className="font-bold text-slate-700">{total}</span> records
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center px-3 text-xs font-semibold text-slate-600 border border-slate-200 rounded-md">
              Page {page} of {totalPages}
            </div>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
