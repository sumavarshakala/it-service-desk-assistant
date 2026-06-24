import { useState } from 'react';
import { User, Bell, Shield, Save, CheckCircle, Zap, Camera, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'preferences', label: 'Preferences', icon: Zap },
];

const DEPARTMENTS = ['Engineering', 'HR', 'Finance', 'Operations', 'Sales', 'Marketing', 'Legal'];

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-5.5 w-10 items-center rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-brand-blue' : 'bg-slate-200'}`}
      style={{ height: '22px', width: '40px' }}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-1'}`}
      />
    </button>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', department: user?.department || '', phone: '' });
  const [notifications, setNotifications] = useState({
    emailSummary: true, instantComment: true, slackIntegration: false,
    slaPending: true, ticketAssigned: true, systemAlerts: false,
  });
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleProfileSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.success('Profile updated successfully!'); }, 800);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (password.new !== password.confirm) return toast.error('Passwords do not match');
    if (password.new.length < 8) return toast.error('Password must be at least 8 characters');
    toast.success('Password changed successfully');
    setPassword({ current: '', new: '', confirm: '' });
  };

  const notificationItems = [
    { key: 'emailSummary', label: 'Daily Ticket Digest', desc: 'Receive a morning email summary of all your open tickets and SLA status' },
    { key: 'instantComment', label: 'Comment Notifications', desc: 'Get notified immediately when an agent adds a comment to your tickets' },
    { key: 'slaPending', label: 'SLA Warning Alerts', desc: 'Alert me when a ticket is approaching its SLA deadline (60 min warning)' },
    { key: 'ticketAssigned', label: 'Assignment Notifications', desc: 'Notify me when a ticket is assigned or re-assigned to a support agent' },
    { key: 'slackIntegration', label: 'Slack Integration', desc: 'Mirror portal notifications to your Slack workspace via webhook' },
    { key: 'systemAlerts', label: 'System Maintenance Alerts', desc: 'Receive announcements for planned downtime and system updates' },
  ];

  return (
    <Layout title="Account Settings">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Nav */}
        <div className="space-y-4">
          {/* User Profile Card */}
          <div className="bg-white border border-slate-200/70 rounded-xl p-5 shadow-card text-center">
            <div className="relative inline-block mb-3">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-blue-dark to-brand-teal text-white text-2xl font-extrabold flex items-center justify-center shadow-md">
                {initials}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-brand-blue transition-colors">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="font-extrabold text-slate-900 text-sm">{user?.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
            <div className="mt-2">
              {user?.role === 'admin' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                  <Shield className="w-3 h-3" /> Administrator
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                  <User className="w-3 h-3" /> Employee
                </span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white border border-slate-200/70 rounded-xl overflow-hidden shadow-card">
            <div className="p-2 space-y-0.5">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === id
                      ? 'bg-brand-blue/10 text-brand-blue-dark'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${activeTab === id ? 'text-brand-blue' : 'text-slate-400'}`} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Session Info */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 text-[10px] text-slate-500 space-y-1.5 shadow-card">
            <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Current Session</p>
            <p>🖥️ Chrome · Windows 11</p>
            <p>🌐 192.168.1.115 (Corporate)</p>
            <p>🕐 Last sync: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-5">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSave} className="card border-slate-200/80 space-y-5 animate-fade-in">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="p-1.5 rounded-lg bg-brand-blue/10 border border-brand-blue/20">
                  <User className="w-4 h-4 text-brand-blue" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Account Details</h3>
                  <p className="text-[11px] text-slate-400">Update your personal information</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input className="input-field" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input className="input-field bg-slate-50 cursor-not-allowed text-slate-400" value={profile.email} disabled />
                  <p className="text-[10px] text-slate-400 mt-1">Email cannot be changed. Contact IT admin.</p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Department</label>
                  <select className="input-field" value={profile.department} onChange={e => setProfile(p => ({ ...p, department: e.target.value }))}>
                    <option value="">Select...</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone (optional)</label>
                  <input className="input-field" placeholder="+1 555-000-0000" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save Profile</>}
                </button>
              </div>
            </form>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="card border-slate-200/80 space-y-5 animate-fade-in">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-100">
                  <Bell className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Notification Preferences</h3>
                  <p className="text-[11px] text-slate-400">Customize how and when you receive alerts</p>
                </div>
              </div>

              <div className="space-y-0 divide-y divide-slate-100">
                {notificationItems.map(({ key, label, desc }) => (
                  <div key={key} className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{label}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 max-w-md">{desc}</p>
                    </div>
                    <Toggle
                      checked={notifications[key]}
                      onChange={() => {
                        setNotifications(n => ({ ...n, [key]: !n[key] }));
                        toast.success(`${label} ${!notifications[key] ? 'enabled' : 'disabled'}`);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-5 animate-fade-in">
              <div className="card border-slate-200/80 space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <div className="p-1.5 rounded-lg bg-rose-50 border border-rose-100">
                    <Shield className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Security & Access</h3>
                    <p className="text-[11px] text-slate-400">Manage password and authentication settings</p>
                  </div>
                </div>

                {/* MFA */}
                <div className={`p-4 rounded-xl border ${mfaEnabled ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-800">Multi-Factor Authentication</h4>
                        {mfaEnabled && <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded">Active</span>}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">Secure your account with a time-based one-time password from your authenticator app.</p>
                    </div>
                    <button
                      onClick={() => { setMfaEnabled(m => !m); toast.success(mfaEnabled ? 'MFA disabled' : 'MFA enabled successfully'); }}
                      className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${mfaEnabled ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' : 'bg-brand-blue text-white border-brand-blue hover:bg-brand-blue-dark'}`}
                    >
                      {mfaEnabled ? 'Disable MFA' : 'Enable MFA'}
                    </button>
                  </div>
                </div>

                {/* Change Password */}
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Change Password</h4>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Current Password</label>
                    <div className="relative">
                      <input type={showCurrentPass ? 'text' : 'password'} className="input-field pr-10" value={password.current} onChange={e => setPassword(p => ({ ...p, current: e.target.value }))} />
                      <button type="button" onClick={() => setShowCurrentPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">New Password</label>
                      <div className="relative">
                        <input type={showNewPass ? 'text' : 'password'} className="input-field pr-10" value={password.new} onChange={e => setPassword(p => ({ ...p, new: e.target.value }))} />
                        <button type="button" onClick={() => setShowNewPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Confirm Password</label>
                      <input type="password" className="input-field" value={password.confirm} onChange={e => setPassword(p => ({ ...p, confirm: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" disabled={!password.current || !password.new || !password.confirm} className="btn-primary">
                      <Lock className="w-4 h-4" /> Update Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="card border-slate-200/80 space-y-5 animate-fade-in">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100">
                  <Zap className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Interface Preferences</h3>
                  <p className="text-[11px] text-slate-400">Customize your portal experience</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Color Theme</label>
                  <div className="flex gap-3">
                    {[
                      { id: 'light', label: 'Professional Light', colors: ['#F8FAFC', '#2563EB', '#0EA5A4'], active: true },
                      { id: 'dark', label: 'Enterprise Dark', colors: ['#1E293B', '#3B82F6', '#14B8A6'], active: false },
                    ].map(t => (
                      <div key={t.id} className={`flex-1 p-3.5 rounded-xl border cursor-pointer transition-all ${t.active ? 'border-brand-blue ring-2 ring-brand-blue/20' : 'border-slate-200 hover:border-slate-300'}`}>
                        <div className="flex gap-1.5 mb-2">
                          {t.colors.map((c, i) => <div key={i} className="w-5 h-5 rounded-full border border-white/50 shadow-sm" style={{ backgroundColor: c }} />)}
                        </div>
                        <p className="text-[11px] font-bold text-slate-700">{t.label}</p>
                        {t.active && <p className="text-[10px] text-brand-blue font-semibold mt-0.5">Currently Active</p>}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Default Ticket View</label>
                  <select className="input-field">
                    <option>Table View</option>
                    <option>Card Grid View</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Items Per Page</label>
                  <select className="input-field">
                    <option>15 tickets per page</option>
                    <option>25 tickets per page</option>
                    <option>50 tickets per page</option>
                  </select>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button onClick={() => toast.success('Preferences saved')} className="btn-primary">
                    <Save className="w-4 h-4" /> Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
