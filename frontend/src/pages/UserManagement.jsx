import { useEffect, useState } from 'react';
import { Search, Shield, UserCheck, Users } from 'lucide-react';
import Layout from '../components/Layout';
import { analyticsAPI } from '../services/api';

const DEPARTMENTS = ['All', 'Engineering', 'HR', 'Finance', 'Operations', 'Sales', 'Marketing', 'Legal'];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');

  useEffect(() => {
    analyticsAPI.users().then((res) => setUsers(res.data)).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || u.department === deptFilter;
    const matchRole = roleFilter === 'All' || u.role === roleFilter.toLowerCase();
    return matchSearch && matchDept && matchRole;
  });

  const adminCount = users.filter(u => u.role === 'admin').length;
  const employeeCount = users.filter(u => u.role === 'employee').length;
  const depts = [...new Set(users.map(u => u.department))];

  return (
    <Layout title="User Management">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'text-brand-blue bg-brand-blue/10 border-brand-blue/20' },
          { label: 'Administrators', value: adminCount, icon: Shield, color: 'text-rose-600 bg-rose-50 border-rose-100' },
          { label: 'Employees', value: employeeCount, icon: UserCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card border-slate-200/80 flex items-center gap-3 p-4 shadow-sm">
            <div className={`p-2 rounded-lg border ${color.split(' ').slice(1).join(' ')}`}>
              <Icon className={`w-5 h-5 ${color.split(' ')[0]}`} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{label}</span>
              <span className="text-xl font-extrabold text-slate-900">{value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card border-slate-200/80 p-4 mb-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
            />
          </div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue w-full sm:w-44"
          >
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
          </select>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue w-full sm:w-36"
          >
            {['All', 'Admin', 'Employee'].map(r => <option key={r} value={r}>{r === 'All' ? 'All Roles' : r}</option>)}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Member Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full" />
                      Loading user directory...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No users match your current filters
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          u.role === 'admin'
                            ? 'bg-rose-100 text-rose-600 border border-rose-200'
                            : 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20'
                        }`}>
                          {u.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{u.name}</p>
                          <p className="text-[10px] text-slate-400">ID: #{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {u.department}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                          <Shield className="w-3 h-3" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          <UserCheck className="w-3 h-3" /> Employee
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-semibold">
                      {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="bg-white border-t border-slate-100 px-4 py-2.5 text-xs text-slate-400 font-semibold">
            Showing {filtered.length} of {users.length} users
          </div>
        )}
      </div>
    </Layout>
  );
}
