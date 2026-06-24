import { useEffect, useState } from 'react';
import {
  Search, Shield, UserCheck, Users, MoreVertical,
  Edit, UserX, UserCog, X, Check, ChevronDown
} from 'lucide-react';
import Layout from '../components/Layout';
import { analyticsAPI } from '../services/api';
import toast from 'react-hot-toast';

const DEPARTMENTS = ['Engineering', 'HR', 'Finance', 'Operations', 'Sales', 'Marketing', 'Legal'];

function EditUserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({ name: user.name, email: user.email, role: user.role, department: user.department || '' });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-md overflow-hidden animate-fade-up">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Edit User</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Update user profile and permissions</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
            <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
            <input className="input-field" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Role</label>
              <select className="input-field" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="employee">Employee</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Department</label>
              <select className="input-field" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                <option value="">Select...</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={() => { onSave(form); onClose(); }} className="btn-primary">
            <Check className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [editingUser, setEditingUser] = useState(null);
  const [disabledUsers, setDisabledUsers] = useState(new Set());
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    analyticsAPI.users().then(res => setUsers(res.data)).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All' || u.role === roleFilter.toLowerCase();
    const matchDept = deptFilter === 'All' || u.department === deptFilter;
    return matchSearch && matchRole && matchDept;
  });

  const adminCount = users.filter(u => u.role === 'admin').length;
  const employeeCount = users.filter(u => u.role === 'employee').length;
  const depts = ['All', ...new Set(users.map(u => u.department).filter(Boolean))];

  const handleSave = (userId, form) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...form } : u));
    toast.success('User profile updated');
  };

  const toggleDisable = (userId) => {
    setDisabledUsers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) { next.delete(userId); toast.success('User re-enabled'); }
      else { next.add(userId); toast.success('User disabled'); }
      return next;
    });
    setOpenMenu(null);
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const AVATAR_COLORS = [
    'from-brand-blue to-brand-teal', 'from-purple-500 to-indigo-600',
    'from-rose-500 to-pink-600', 'from-amber-500 to-orange-600',
    'from-emerald-500 to-teal-600',
  ];

  return (
    <Layout
      title="User Management"
      actions={
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">{filtered.length} of {users.length} users</span>
        </div>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Users', value: users.length, icon: Users, bg: 'bg-blue-50 border-blue-200', text: 'text-brand-blue', desc: 'Across all departments' },
          { label: 'Administrators', value: adminCount, icon: Shield, bg: 'bg-rose-50 border-rose-200', text: 'text-rose-600', desc: 'Full system access' },
          { label: 'Employees', value: employeeCount, icon: UserCheck, bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-600', desc: 'Standard access level' },
        ].map(({ label, value, icon: Icon, bg, text, desc }) => (
          <div key={label} className="bg-white border border-slate-200/70 rounded-xl p-5 flex items-center gap-4 shadow-card">
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${bg}`}>
              <Icon className={`w-6 h-6 ${text}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
              <p className={`text-2xl font-extrabold ${text} tracking-tight`}>{value}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200/70 rounded-xl p-4 shadow-card mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="input-field pl-9"
          />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input-field w-auto">
          <option value="All">All Roles</option>
          <option value="Admin">Administrators</option>
          <option value="Employee">Employees</option>
        </select>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="input-field w-auto">
          {depts.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/70 rounded-xl shadow-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr>
              {['User', 'Email', 'Department', 'Role', 'Status', 'Tickets', ''].map(h => (
                <th key={h} className="table-header">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="table-cell"><div className="skeleton h-4 rounded" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-500">No users found</p>
                  <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
                </td>
              </tr>
            ) : (
              filtered.map((user, idx) => {
                const avatarGrad = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                const isDisabled = disabledUsers.has(user.id);
                const ticketCount = Math.floor(Math.random() * 25) + 1;
                return (
                  <tr
                    key={user.id}
                    className={`hover:bg-slate-50/70 transition-colors animate-fade-in ${isDisabled ? 'opacity-50' : ''}`}
                    style={{ animationDelay: `${idx * 50}ms`, opacity: 0 }}
                    onClick={() => setOpenMenu(null)}
                  >
                    {/* Avatar + Name */}
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGrad} text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm`}>
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{user.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">ID #{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-slate-500 font-medium">{user.email}</td>
                    <td className="table-cell">
                      {user.department ? (
                        <span className="text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md">{user.department}</span>
                      ) : (
                        <span className="text-xs text-slate-300 italic">—</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <Shield className="w-3 h-3" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <UserCheck className="w-3 h-3" /> Employee
                        </span>
                      )}
                    </td>
                    <td className="table-cell">
                      {isDisabled ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Disabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                        </span>
                      )}
                    </td>
                    <td className="table-cell">
                      <span className="text-xs font-bold text-slate-700">{ticketCount}</span>
                    </td>
                    {/* Actions */}
                    <td className="table-cell relative" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenu === user.id && (
                        <div className="absolute right-8 top-2 w-44 bg-white border border-slate-200 rounded-xl shadow-notification z-10 overflow-hidden animate-fade-in">
                          <button
                            onClick={() => { setEditingUser(user); setOpenMenu(null); }}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5 text-slate-400" /> Edit Profile
                          </button>
                          <button
                            onClick={() => toggleDisable(user.id)}
                            className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-medium transition-colors ${isDisabled ? 'text-emerald-700 hover:bg-emerald-50' : 'text-rose-600 hover:bg-rose-50'}`}
                          >
                            <UserX className="w-3.5 h-3.5" /> {isDisabled ? 'Enable User' : 'Disable User'}
                          </button>
                          <button
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <UserCog className="w-3.5 h-3.5 text-slate-400" /> View Tickets
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-400 font-medium">
            Showing {filtered.length} of {users.length} users
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={(form) => handleSave(editingUser.id, form)}
        />
      )}
    </Layout>
  );
}
