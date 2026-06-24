import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Search, Bell, ChevronDown, LogOut, Settings, BookOpen, X, Ticket, AlertTriangle, Coffee, Info, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ticketAPI } from '../services/api';

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'SLA Warning – Ticket #1042', body: '30 minutes until SLA breach on Login Issue ticket.', type: 'sla', time: '10m ago', unread: true },
  { id: 2, title: 'Need a break?', body: "You've been active for 90 minutes. Visit the Wellness Hub to recharge.", type: 'wellness', time: 'Just now', unread: true },
  { id: 3, title: 'Ticket #1043 assigned to you', body: 'VPN Access request from Marketing.', type: 'ticket', time: '1h ago', unread: true },
  { id: 4, title: 'Ticket #1029 resolved', body: 'Email config issue closed by Admin.', type: 'resolved', time: '3h ago', unread: false },
  { id: 5, title: 'Maintenance window tonight 11 PM', body: 'Expected downtime: ~30 minutes.', type: 'system', time: '5h ago', unread: false },
];

const TYPE_ICON = {
  sla:      { icon: AlertTriangle, cls: 'text-amber-600' },
  wellness: { icon: Coffee,        cls: 'text-purple-600' },
  ticket:   { icon: Ticket,        cls: 'text-primary-600' },
  resolved: { icon: CheckCircle,   cls: 'text-green-600' },
  system:   { icon: Info,          cls: 'text-gray-500' },
};

function Breadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);
  const labels = { dashboard: 'Dashboard', tickets: 'Tickets', create: 'New Request', kb: 'Knowledge Base', analytics: 'Reports', users: 'Users', settings: 'Settings', wellness: 'Wellness Hub', 'activity-logs': 'Audit Logs' };
  return (
    <nav className="flex items-center gap-1 text-xs text-gray-500">
      <span className="text-gray-400">IT Service Desk</span>
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="text-gray-300">/</span>
          <span className={i === segments.length - 1 ? 'text-gray-700 font-medium' : ''}>
            {labels[seg] || (isNaN(seg) ? seg : `#${seg}`)}
          </span>
        </span>
      ))}
    </nav>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const searchRef  = useRef(null);
  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  const unread  = notifications.filter(n => n.unread).length;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    const handler = (e) => {
      if (!searchRef.current?.contains(e.target))  setShowSearch(false);
      if (!notifRef.current?.contains(e.target))   setShowNotifs(false);
      if (!profileRef.current?.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const t = setTimeout(() => {
        ticketAPI.list({ search: searchQuery, page_size: 5 })
          .then(res => { setSearchResults(res.data.tickets); setShowSearch(true); })
          .catch(() => setSearchResults([]));
      }, 300);
      return () => clearTimeout(t);
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  }, [searchQuery]);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  const dismiss = (id, e) => { e.stopPropagation(); setNotifications(prev => prev.filter(n => n.id !== id)); };

  return (
    <header className="sticky top-0 z-20 h-11 bg-white border-b border-gray-200 flex items-center justify-between px-5 gap-4">
      {/* Left: Breadcrumb */}
      <Breadcrumb />

      {/* Right: Search + Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div ref={searchRef} className="relative">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && searchQuery.trim()) { setShowSearch(false); navigate(`/tickets?search=${encodeURIComponent(searchQuery)}`); }}}
              className="w-56 bg-gray-50 border border-gray-300 rounded pl-8 pr-3 py-1 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-colors"
            />
          </div>

          {showSearch && (
            <div className="absolute right-0 mt-1 w-80 bg-white border border-gray-200 rounded shadow-dropdown z-50 animate-slide-down">
              <div className="px-3 py-2 border-b border-gray-100">
                <span className="text-xs font-medium text-gray-500">Search results</span>
              </div>
              {searchResults.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-gray-400">No tickets found</div>
              ) : (
                <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                  {searchResults.map(t => (
                    <button key={t.id} onClick={() => { setSearchQuery(''); setShowSearch(false); navigate(`/tickets/${t.id}`); }}
                      className="w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-mono text-primary-600 font-semibold mt-0.5">#{t.id}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 truncate">{t.title}</p>
                          <p className="text-xs text-gray-400">{t.category} · {t.status}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
                <button onClick={() => { setShowSearch(false); navigate(`/tickets?search=${encodeURIComponent(searchQuery)}`); }}
                  className="text-xs text-primary-600 font-medium hover:underline">
                  View all results →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
            className="relative p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full border border-white" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-1 w-80 bg-white border border-gray-200 rounded shadow-dropdown z-50 animate-slide-down">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-800">Notifications</span>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary-600 hover:underline font-medium">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {notifications.map(n => {
                  const cfg = TYPE_ICON[n.type] || TYPE_ICON.system;
                  const Icon = cfg.icon;
                  return (
                    <div key={n.id} className={`flex gap-3 px-4 py-3 hover:bg-gray-50 group ${n.unread ? 'bg-blue-50/30' : ''}`}>
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.cls}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${n.unread ? 'font-medium text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.body}</p>
                        <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                      </div>
                      <button onClick={e => dismiss(n.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-gray-500 transition-opacity shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                <Link to="/settings" onClick={() => setShowNotifs(false)} className="text-xs text-gray-500 hover:text-gray-700">
                  Notification preferences
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-gray-200" />

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
            className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-semibold flex items-center justify-center">
              {initials}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden md:block">{user?.name?.split(' ')[0]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden md:block" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded shadow-dropdown z-50 animate-slide-down">
              <div className="px-3 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                <span className={`inline-flex items-center mt-1.5 px-1.5 py-0.5 rounded text-xs font-medium ${user?.role === 'admin' ? 'bg-red-50 text-red-700' : 'bg-primary-50 text-primary-700'}`}>
                  {user?.role === 'admin' ? 'Administrator' : 'Employee'}
                </span>
              </div>
              <div className="p-1">
                <Link to="/settings" onClick={() => setShowProfile(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors">
                  <Settings className="w-4 h-4 text-gray-400" /> Account Settings
                </Link>
                <Link to="/kb" onClick={() => setShowProfile(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors">
                  <BookOpen className="w-4 h-4 text-gray-400" /> Help Center
                </Link>
                <hr className="border-gray-100 my-1" />
                <button onClick={() => { setShowProfile(false); logout(); navigate('/login'); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
