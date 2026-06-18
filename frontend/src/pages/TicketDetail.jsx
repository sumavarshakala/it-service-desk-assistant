import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MessageSquare, Send, ArrowLeft, User, Clock, Tag,
  Shield, CheckCircle, AlertTriangle, PlusCircle, MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import ActivityTimeline from '../components/ActivityTimeline';
import { ticketAPI, analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function buildTimeline(ticket) {
  const events = [];

  if (ticket.created_at) {
    events.push({
      id: 'created',
      title: 'Ticket Submitted',
      user: ticket.employee_name,
      description: `"${ticket.title}"`,
      time: new Date(ticket.created_at).toLocaleString(),
      icon: PlusCircle,
      color: 'blue',
    });
  }

  ticket.comments?.forEach((c) => {
    events.push({
      id: `comment-${c.id}`,
      title: 'Comment Added',
      user: c.user_name,
      description: c.comment,
      time: new Date(c.timestamp).toLocaleString(),
      icon: MessageCircle,
      color: 'purple',
    });
  });

  if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
    events.push({
      id: 'resolved',
      title: ticket.status === 'Resolved' ? 'Ticket Resolved' : 'Ticket Closed',
      user: ticket.admin_name || 'Support Agent',
      description: ticket.resolution ? `Resolution: ${ticket.resolution}` : null,
      time: ticket.resolved_at ? new Date(ticket.resolved_at).toLocaleString() : 'Recently',
      icon: CheckCircle,
      color: 'green',
    });
  }

  return events.sort((a, b) => new Date(a.time) - new Date(b.time));
}

export default function TicketDetail() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comment, setComment] = useState('');
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchTicket = () => {
    ticketAPI.get(id).then((res) => setTicket(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTicket();
    if (isAdmin) {
      analyticsAPI.users().then((res) => {
        setAdmins(res.data.filter((u) => u.role === 'admin'));
      });
    }
  }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmittingComment(true);
    try {
      await ticketAPI.addComment(id, comment);
      setComment('');
      fetchTicket();
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdate = async (field, value) => {
    try {
      await ticketAPI.update(id, { [field]: value });
      fetchTicket();
      toast.success('Ticket updated successfully');
    } catch {
      toast.error('Update failed');
    }
  };

  if (loading) {
    return (
      <Layout title="Ticket Details">
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <div className="animate-spin w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full" />
          <p className="text-sm text-slate-400 font-semibold">Loading ticket details...</p>
        </div>
      </Layout>
    );
  }

  if (!ticket) {
    return (
      <Layout title="Ticket Details">
        <div className="card text-center py-16">
          <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <p className="text-slate-700 font-bold">Ticket not found or access denied</p>
          <Link to="/tickets" className="btn-secondary mt-4 inline-flex">
            <ArrowLeft className="w-4 h-4" /> Back to Tickets
          </Link>
        </div>
      </Layout>
    );
  }

  const timelineEvents = buildTimeline(ticket);

  return (
    <Layout
      title={`Ticket #${ticket.id}`}
      actions={
        <Link to="/tickets" className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> All Tickets
        </Link>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Ticket Header + Description */}
          <div className="card border-slate-200/80">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-extrabold text-slate-900 leading-tight mb-2">{ticket.title}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                  <span className="text-[10px] text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">{ticket.category}</span>
                  {ticket.category_confidence && (
                    <span className="text-[10px] text-brand-teal-dark font-semibold bg-brand-teal/10 border border-brand-teal/20 px-2 py-0.5 rounded-full">
                      AI: {(ticket.category_confidence * 100).toFixed(0)}% confidence
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="prose prose-sm max-w-none">
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{ticket.description}</p>
            </div>

            {ticket.resolution && (
              <div className="mt-5 p-4 bg-emerald-50 border border-emerald-200/70 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-emerald-800">Resolution Notes</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">{ticket.resolution}</p>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="card border-slate-200/80">
            <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-3">
              <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Activity Timeline</h3>
                <p className="text-[10px] text-slate-400">Chronological lifecycle of this ticket</p>
              </div>
            </div>
            <ActivityTimeline events={timelineEvents} />
          </div>

          {/* Comments */}
          <div className="card border-slate-200/80">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Comments ({ticket.comments?.length || 0})
                </h3>
                <p className="text-[10px] text-slate-400">Conversation thread</p>
              </div>
            </div>

            <div className="space-y-3 mb-4 max-h-80 overflow-y-auto pr-1">
              {ticket.comments?.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No comments yet. Be the first to add one below.
                </div>
              ) : (
                ticket.comments?.map((c) => (
                  <div key={c.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center text-[10px] font-bold">
                          {c.user_name?.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-slate-800">{c.user_name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">{new Date(c.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{c.comment}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleComment} className="flex gap-2 pt-3 border-t border-slate-100">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="input-field flex-1"
                placeholder="Type a comment or update..."
              />
              <button
                type="submit"
                disabled={submittingComment || !comment.trim()}
                className="btn-primary shrink-0 px-4"
              >
                <Send className="w-4 h-4" />
                {submittingComment ? '...' : 'Send'}
              </button>
            </form>
          </div>
        </div>

        {/* Right — Sidebar Details */}
        <div className="space-y-5">
          {/* Ticket Info */}
          <div className="card border-slate-200/80 space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Tag className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ticket Details</h3>
            </div>
            <div className="space-y-2.5 text-xs">
              {[
                { label: 'Status', value: <StatusBadge status={ticket.status} /> },
                { label: 'Priority', value: <PriorityBadge priority={ticket.priority} /> },
                { label: 'Category', value: <span className="font-semibold text-slate-800">{ticket.category}</span> },
                { label: 'Submitted By', value: <span className="font-semibold text-slate-800">{ticket.employee_name}</span> },
                ticket.admin_name && { label: 'Assigned To', value: <span className="font-semibold text-slate-800">{ticket.admin_name}</span> },
                { label: 'Created At', value: <span className="text-slate-500">{new Date(ticket.created_at).toLocaleString()}</span> },
                { label: 'Last Updated', value: <span className="text-slate-500">{new Date(ticket.updated_at).toLocaleString()}</span> },
                ticket.resolved_at && { label: 'Resolved At', value: <span className="text-emerald-600 font-semibold">{new Date(ticket.resolved_at).toLocaleString()}</span> },
              ].filter(Boolean).map(({ label, value }, idx) => (
                <div key={idx} className="flex justify-between items-center gap-2">
                  <span className="text-slate-400 font-semibold shrink-0">{label}</span>
                  <div className="text-right">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Action Panel */}
          {isAdmin && (
            <div className="card border-rose-100 bg-rose-50/30 space-y-4">
              <div className="flex items-center gap-2 border-b border-rose-100 pb-3">
                <Shield className="w-4 h-4 text-rose-500" />
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Admin Actions</h3>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Update Status
                  </label>
                  <select
                    value={ticket.status}
                    onChange={(e) => handleUpdate('status', e.target.value)}
                    className="input-field bg-white"
                  >
                    {['Open', 'In Progress', 'Assigned', 'Resolved', 'Closed'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Change Priority
                  </label>
                  <select
                    value={ticket.priority}
                    onChange={(e) => handleUpdate('priority', e.target.value)}
                    className="input-field bg-white"
                  >
                    {['Low', 'Medium', 'High', 'Critical'].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Assign Agent
                  </label>
                  <select
                    value={ticket.assigned_admin || ''}
                    onChange={(e) => handleUpdate('assigned_admin', parseInt(e.target.value) || null)}
                    className="input-field bg-white"
                  >
                    <option value="">Unassigned</option>
                    {admins.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Resolution Notes
                  </label>
                  <textarea
                    defaultValue={ticket.resolution || ''}
                    onBlur={(e) => {
                      if (e.target.value !== ticket.resolution) handleUpdate('resolution', e.target.value);
                    }}
                    className="input-field min-h-[80px] bg-white resize-none"
                    placeholder="Describe how the issue was resolved..."
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
