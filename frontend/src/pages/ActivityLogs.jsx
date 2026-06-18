import { useEffect, useState } from 'react';
import { Activity, Ticket } from 'lucide-react';
import Layout from '../components/Layout';
import { analyticsAPI } from '../services/api';
import { Link } from 'react-router-dom';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.activityLogs().then((res) => setLogs(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="Activity Logs">
      <div className="card border-slate-200/80">
        <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-3">
          <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">System Activity Feed</h3>
            <p className="text-[10px] text-slate-400">Chronological audit trail of all portal actions</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center flex flex-col items-center gap-3">
            <div className="animate-spin w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full" />
            <p className="text-xs text-slate-400 font-semibold">Loading activity logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">No activity logs recorded yet.</div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-6">
              {logs.map((log, idx) => (
                <li key={log.id}>
                  <div className="relative pb-6">
                    {idx !== logs.length - 1 && (
                      <span className="absolute left-3.5 top-5 -ml-px h-full w-0.5 bg-slate-100" />
                    )}
                    <div className="relative flex items-start gap-4">
                      {/* Dot */}
                      <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 border border-brand-blue/20 ring-4 ring-white">
                        <div className="w-2 h-2 rounded-full bg-brand-blue" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-xs font-semibold text-slate-800 leading-snug">{log.action}</p>
                          <span className="text-[10px] text-slate-400 font-semibold whitespace-nowrap shrink-0">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 font-semibold">
                          <span className="text-slate-600">{log.user_name}</span>
                          {log.ticket_id && (
                            <>
                              <span>•</span>
                              <Link
                                to={`/tickets/${log.ticket_id}`}
                                className="text-brand-blue hover:underline flex items-center gap-0.5"
                              >
                                <Ticket className="w-3 h-3" /> Ticket #{log.ticket_id}
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}
