import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MessageSquare, Send, ArrowLeft, Shield, CheckCircle,
  AlertTriangle, PlusCircle, MessageCircle, Clock, Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import SLAWidget from '../components/SLAWidget';
import { ticketAPI, analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function buildTimeline(ticket) {
  const events = [];
  if (ticket.created_at) events.push({
    id: 'created', type: 'created', user: ticket.employee_name,
    text: 'Ticket submitted', time: new Date(ticket.created_at),
  });
  ticket.comments?.forEach(c => events.push({
    id: `c-${c.id}`, type: 'comment', user: c.user_name,
    text: c.comment, time: new Date(c.timestamp),
  }));
  if (['Resolved', 'Closed'].includes(ticket.status)) events.push({
    id: 'resolved', type: 'resolved', user: ticket.admin_name || 'Support',
    text: ticket.status === 'Resolved' ? 'Ticket resolved' : 'Ticket closed',
    sub: ticket.resolution, time: ticket.resolved_at ? new Date(ticket.resolved_at) : new Date(),
  });
  return events.sort((a, b) => a.time - b.time);
}

const PRIORITY_ETA = { Critical: '1–2 hours', High: '2–4 hours', Medium: '8–24 hours', Low: '1–3 days' };
const TYPE_DOT = { created: 'bg-primary-600', comment: 'bg-purple-500', resolved: 'bg-green-500' };

export default function TicketDetail() {
  const { id }    = useParams();
  const { isAdmin } = useAuth();
  const [ticket,  setTicket]  = useState(null);
  const [comment, setComment] = useState('');
  const [admins,  setAdmins]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const reload = () => ticketAPI.get(id).then(r => setTicket(r.data)).finally(() => setLoading(false));

  useEffect(() => {
    reload();
    if (isAdmin) analyticsAPI.users().then(r => setAdmins(r.data.filter(u => u.role === 'admin')));
  }, [id]);

  const addComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSending(true);
    try { await ticketAPI.addComment(id, comment); setComment(''); reload(); toast.success('Comment added'); }
    catch { toast.error('Failed to add comment'); }
    finally { setSending(false); }
  };

  const update = async (field, value) => {
    try { await ticketAPI.update(id, { [field]: value }); reload(); toast.success('Updated'); }
    catch { toast.error('Update failed'); }
  };

  if (loading) return (
    <Layout title="Ticket Details">
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="card p-5 h-40 animate-pulse"><div className="skeleton h-full" /></div>)}
        </div>
        <div className="card p-4 h-64 animate-pulse"><div className="skeleton h-full" /></div>
      </div>
    </Layout>
  );

  if (!ticket) return (
    <Layout title="Ticket Details">
      <div className="card p-12 text-center">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="font-semibold text-gray-800">Ticket not found</p>
        <Link to="/tickets" className="btn-secondary mt-4 inline-flex"><ArrowLeft className="w-4 h-4" /> Back to Tickets</Link>
      </div>
    </Layout>
  );

  const timeline = buildTimeline(ticket);

  return (
    <Layout
      title={`#${String(ticket.id).padStart(4, '0')} – ${ticket.title}`}
      actions={<Link to="/tickets" className="btn-secondary"><ArrowLeft className="w-4 h-4" /> Back to Tickets</Link>}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* LEFT — 2/3 width */}
        <div className="lg:col-span-2 space-y-4">

          {/* Header meta bar */}
          <div className="card px-4 py-3 flex items-center gap-2 flex-wrap">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <span className="badge badge-gray">{ticket.category}</span>
            {ticket.category_confidence && (
              <span className="badge bg-blue-50 text-blue-600 border border-blue-200">
                AI {Math.round(ticket.category_confidence * 100)}% confidence
              </span>
            )}
            <span className="text-xs text-gray-400 ml-auto">ETA: {PRIORITY_ETA[ticket.priority]}</span>
          </div>

          {/* Description */}
          <div className="card p-4">
            <h3 className="section-title mb-3">Description</h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{ticket.description}</p>
            {ticket.resolution && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-semibold text-green-800">Resolution</span>
                </div>
                <p className="text-sm text-green-800 leading-relaxed">{ticket.resolution}</p>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="card p-4">
            <h3 className="section-title mb-4">Activity</h3>
            <div className="space-y-4">
              {timeline.map((e, i) => (
                <div key={e.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full ${TYPE_DOT[e.type] || 'bg-gray-400'} mt-1.5 shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-gray-800">{e.user}</span>
                      <span className="text-xs text-gray-400">
                        {e.time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {e.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{e.text}</p>
                    {e.sub && <p className="text-xs text-gray-500 mt-1 bg-gray-50 border border-gray-100 rounded p-2">{e.sub}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="card p-4">
            <h3 className="section-title mb-4">Comments ({ticket.comments?.length || 0})</h3>

            {ticket.comments?.length === 0 && (
              <p className="text-sm text-gray-400 mb-4">No comments yet.</p>
            )}
            <div className="space-y-3 mb-4">
              {ticket.comments?.map(c => (
                <div key={c.id} className="bg-gray-50 border border-gray-200 rounded p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-900">{c.user_name}</span>
                    <span className="text-xs text-gray-400">{new Date(c.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-700">{c.comment}</p>
                </div>
              ))}
            </div>

            <form onSubmit={addComment} className="flex gap-2 pt-3 border-t border-gray-100">
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Add a comment..."
                rows={2}
                className="input-field flex-1 resize-none"
              />
              <button type="submit" disabled={sending || !comment.trim()} className="btn-primary self-end shrink-0">
                <Send className="w-4 h-4" /> {sending ? 'Sending…' : 'Send'}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT — 1/3 width */}
        <div className="space-y-4">
          {/* Ticket properties */}
          <div className="card p-4">
            <h3 className="section-title mb-3 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Details
            </h3>
            <dl className="space-y-2.5 text-sm">
              {[
                ['Status',       <StatusBadge status={ticket.status} />],
                ['Priority',     <PriorityBadge priority={ticket.priority} />],
                ['Category',     ticket.category],
                ['Submitted By', ticket.employee_name],
                ['Assigned To',  ticket.admin_name || <span className="text-gray-400 italic text-xs">Unassigned</span>],
                ['Created',      new Date(ticket.created_at).toLocaleString()],
                ['Updated',      new Date(ticket.updated_at).toLocaleString()],
                ticket.resolved_at && ['Resolved', new Date(ticket.resolved_at).toLocaleString()],
              ].filter(Boolean).map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-2">
                  <dt className="text-gray-500 shrink-0">{label}</dt>
                  <dd className="text-gray-900 text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* SLA */}
          <div className="card p-4">
            <h3 className="section-title mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> SLA Status
            </h3>
            <SLAWidget ticket={ticket} />
          </div>

          {/* Admin Actions */}
          {isAdmin && (
            <div className="card p-4 border-l-4 border-l-amber-400">
              <h3 className="section-title mb-3 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-600" /> Admin Actions
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="label-text block mb-1">Status</label>
                  <select value={ticket.status} onChange={e => update('status', e.target.value)} className="select-field">
                    {['Open', 'In Progress', 'Assigned', 'Pending', 'Resolved', 'Closed'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-text block mb-1">Priority</label>
                  <select value={ticket.priority} onChange={e => update('priority', e.target.value)} className="select-field">
                    {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-text block mb-1">Assign To</label>
                  <select value={ticket.assigned_admin || ''} onChange={e => update('assigned_admin', parseInt(e.target.value) || null)} className="select-field">
                    <option value="">Unassigned</option>
                    {admins.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-text block mb-1">Resolution Notes</label>
                  <textarea
                    defaultValue={ticket.resolution || ''}
                    onBlur={e => { if (e.target.value !== ticket.resolution) update('resolution', e.target.value); }}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Document resolution steps…"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
