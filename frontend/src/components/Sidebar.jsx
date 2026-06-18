import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Ticket, PlusCircle, BarChart3, Users,
  Settings, LogOut, Headphones, BookOpen, ShieldCheck, Lock, Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const generalLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tickets/create', icon: PlusCircle, label: 'Create Ticket' },
    { to: '/tickets', icon: Ticket, label: 'My Tickets' },
    { to: '/kb', icon: BookOpen, label: 'Knowledge Base' },
  ];

  const adminLinks = [
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/users', icon: Users, label: 'User Management' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-30 shadow-sm">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200/80 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center border border-brand-blue/20">
            <Headphones className="w-5 h-5 text-brand-blue" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-slate-800 tracking-tight">IT Service Desk</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Intelligent Portal</p>
          </div>
        </div>
      </div>

      {/* Main Nav Links */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        <div>
          <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Service Desk</span>
          <div className="space-y-1">
            {generalLinks.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    isActive
                      ? 'bg-brand-blue-light/30 border-brand-blue/20 text-brand-blue-dark shadow-sm'
                      : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <div>
            <div className="px-3 flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Admin Console</span>
              <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="space-y-1">
              {adminLinks.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      isActive
                        ? 'bg-brand-teal-light/45 border-brand-teal/20 text-brand-teal-dark shadow-sm'
                        : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {/* Unified Settings */}
        <div>
          <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Configuration</span>
          <div className="space-y-1">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  isActive
                    ? 'bg-brand-blue-light/30 border-brand-blue/20 text-brand-blue-dark shadow-sm'
                    : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Settings className="w-4 h-4" />
              Settings
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Footer Profile summary */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-3 px-2 py-1.5 mb-2">
          <div className="w-8 h-8 bg-brand-blue/10 rounded-full flex items-center justify-center text-xs font-bold text-brand-blue shrink-0">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate leading-none">{user?.name}</p>
            <span className="text-[10px] text-slate-400 font-semibold capitalize mt-1 block">{user?.role}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all text-left"
        >
          <LogOut className="w-4 h-4 text-slate-400 hover:text-rose-500 shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );
}
