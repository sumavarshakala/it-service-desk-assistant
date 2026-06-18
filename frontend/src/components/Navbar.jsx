import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Bell, User, LogOut, ChevronDown, Shield, UserCheck, Ticket, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ticketAPI } from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const searchRef = useRef(null);
  const notifyRef = useRef(null);
  const profileRef = useRef(null);

  // Mock Notifications for corporate feel
  const notifications = [
    { id: 1, title: 'New response on ticket #12', type: 'comment', time: '10m ago', unread: true },
    { id: 2, title: 'System maintenance scheduled this Friday at 10:00 PM EST', type: 'system', time: '2h ago', unread: true },
    { id: 3, title: 'Your ticket #15 has been marked as Resolved', type: 'resolve', time: '5h ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
      if (notifyRef.current && !notifyRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const delayDebounce = setTimeout(() => {
        ticketAPI.list({ search: searchQuery, page_size: 5 })
          .then((res) => {
            setSearchResults(res.data.tickets);
            setShowSearchDropdown(true);
          })
          .catch(() => setSearchResults([]));
      }, 300);
      return () => clearTimeout(delayDebounce);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/tickets?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleResultClick = (ticketId) => {
    setSearchQuery('');
    setShowSearchDropdown(false);
    navigate(`/tickets/${ticketId}`);
  };

  return (
    <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-8 py-3.5 flex items-center justify-between shadow-sm">
      {/* Search Bar */}
      <div className="w-96 relative" ref={searchRef}>
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tickets by ID, title, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
            />
          </div>
        </form>

        {showSearchDropdown && (
          <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden max-h-80">
            <div className="p-2 border-b border-slate-100 bg-slate-50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Search Results</span>
            </div>
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">No matching tickets found</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {searchResults.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleResultClick(t.id)}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-center gap-3"
                  >
                    <Ticket className="w-4 h-4 text-brand-blue shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900 truncate">#{t.id} - {t.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-500 capitalize shrink-0">{t.status}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{t.category}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="p-2 border-t border-slate-100 text-center bg-slate-50">
              <button
                onClick={() => {
                  setShowSearchDropdown(false);
                  navigate(`/tickets?search=${encodeURIComponent(searchQuery)}`);
                }}
                className="text-[11px] text-brand-blue hover:text-brand-blue-dark font-semibold"
              >
                View all results for "{searchQuery}"
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Navigation controls */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={notifyRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-all relative"
          >
            <Bell className="w-[19px] h-[19px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 border border-white text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Notifications</span>
                <span className="text-[10px] text-brand-blue font-semibold cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className={`p-3 hover:bg-slate-50 transition-colors ${n.unread ? 'bg-brand-blue/5' : ''}`}>
                    <div className="flex gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${n.unread ? 'bg-brand-blue' : 'bg-transparent'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-700 leading-snug">{n.title}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100 text-center bg-slate-50">
                <Link to="/settings" onClick={() => setShowNotifications(false)} className="text-xs text-slate-500 hover:text-slate-700 font-medium">
                  Configure alerts
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown & Role badge */}
        <div className="h-6 w-px bg-slate-200" />

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 hover:bg-slate-50 p-1 rounded-lg transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue font-bold text-sm flex items-center justify-center">
              {user?.name?.charAt(0)}
            </div>
            <div className="hidden md:flex flex-col items-start text-left">
              <span className="text-xs font-semibold text-slate-900 leading-none">{user?.name}</span>
              <span className="text-[10px] text-slate-400 mt-0.5">{user?.department}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-brand-blue/15 text-brand-blue font-bold text-sm flex items-center justify-center shrink-0">
                  {user?.name?.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="p-1.5 divide-y divide-slate-100">
                <div className="py-1">
                  <div className="px-3 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Credentials</div>
                  <div className="px-3 py-1.5 flex items-center justify-between">
                    <span className="text-xs text-slate-600">Access Level</span>
                    {user?.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                        <Shield className="w-3 h-3" /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        <UserCheck className="w-3 h-3" /> Employee
                      </span>
                    )}
                  </div>
                </div>
                <div className="py-1.5">
                  <Link
                    to="/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Account Settings
                  </Link>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-md transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
