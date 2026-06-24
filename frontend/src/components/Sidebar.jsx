import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Ticket, PlusCircle, BarChart2, Users,
  Settings, LogOut, BookOpen, ShieldCheck, Activity,
  Coffee, ChevronDown, Headphones
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const NAV_SECTIONS = [
  {
    label: 'MAIN',
    adminOnly: false,
    links: [
      { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/tickets/create', icon: PlusCircle,      label: 'New Request' },
      { to: '/tickets',        icon: Ticket,          label: 'My Tickets' },
      { to: '/kb',             icon: BookOpen,        label: 'Knowledge Base' },
      { to: '/wellness',       icon: Coffee,          label: 'Wellness Hub' },
    ],
  },
  {
    label: 'ADMIN',
    adminOnly: true,
    links: [
      { to: '/analytics',     icon: BarChart2,    label: 'Reports' },
      { to: '/users',         icon: Users,        label: 'Users' },
      { to: '/activity-logs', icon: Activity,     label: 'Audit Logs' },
    ],
  },
  {
    label: 'SYSTEM',
    adminOnly: false,
    links: [
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end={to === '/dashboard'}
      className={({ isActive }) =>
        `nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-blue-400 rounded-r" />
          )}
          <Icon className="w-4 h-4 shrink-0" />
          <span className="text-sm">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-56 bg-nav-bg flex flex-col h-screen fixed left-0 top-0 z-30 overflow-y-auto">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-nav-border">
        <div className="w-7 h-7 rounded bg-primary-600 flex items-center justify-center shrink-0">
          <Headphones className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-semibold leading-none truncate">IT Service Desk</p>
          <p className="text-nav-text text-xs mt-0.5 truncate">Enterprise Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-4">
        {NAV_SECTIONS.map((section) => {
          if (section.adminOnly && !isAdmin) return null;
          return (
            <div key={section.label}>
              <p className="px-3 text-2xs font-semibold text-nav-text/60 uppercase tracking-widest mb-1">
                {section.label}
              </p>
              <div className="space-y-0.5 relative">
                {section.links.map((link) => (
                  <NavItem key={link.to} {...link} />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="px-2 py-3 border-t border-nav-border">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded">
          <div className="w-7 h-7 rounded-full bg-primary-700 text-white text-xs font-semibold flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate leading-tight">{user?.name}</p>
            <p className="text-nav-text text-2xs truncate capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-1 nav-link nav-link-inactive w-full text-left hover:text-danger"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
