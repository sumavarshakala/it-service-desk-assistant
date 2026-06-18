import { useState } from 'react';
import { User, Bell, Shield, Keyboard, Save, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
  });

  const [notifications, setNotifications] = useState({
    emailSummary: true,
    instantComment: true,
    slackIntegration: false,
  });

  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleProfileSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Profile configurations saved successfully!');
    }, 800);
  };

  const handleToggleNotify = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('Notification preference updated');
  };

  const handleToggleMfa = () => {
    setMfaEnabled(!mfaEnabled);
    toast.success(mfaEnabled ? 'MFA disabled' : 'MFA successfully enabled');
  };

  return (
    <Layout title="System Settings">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navigation / List */}
        <div className="space-y-2">
          <div className="card border-slate-200/80 p-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Settings Menu</h4>
            <div className="space-y-1">
              <button className="w-full text-left px-3 py-2 bg-brand-blue-light/30 text-brand-blue-dark rounded-lg text-xs font-semibold flex items-center gap-2">
                <User className="w-4 h-4" /> Account Details
              </button>
              <button className="w-full text-left px-3 py-2 text-slate-600 hover:bg-slate-55 hover:text-slate-900 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors">
                <Bell className="w-4 h-4" /> Notification Alerts
              </button>
              <button className="w-full text-left px-3 py-2 text-slate-600 hover:bg-slate-55 hover:text-slate-900 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors">
                <Shield className="w-4 h-4" /> Security & Access
              </button>
            </div>
          </div>

          <div className="card border-slate-200/80 p-4 bg-slate-50/50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Session Data</span>
            <div className="text-[10px] text-slate-500 space-y-1">
              <p>Device: Chrome Web Browser (Windows)</p>
              <p>Client IP: 192.168.1.115</p>
              <p>Last Sync: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        {/* Configurations Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Profile Form */}
          <form onSubmit={handleProfileSave} className="card border-slate-200/80 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-5 h-5 text-brand-blue" />
              <h3 className="font-bold text-slate-800 text-sm">Account Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="input-field bg-slate-50 text-slate-450 cursor-not-allowed border-slate-200"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Department</label>
                <select
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  className="input-field"
                >
                  {['Engineering', 'HR', 'Finance', 'Operations', 'Sales', 'Marketing', 'Legal'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button type="submit" disabled={saving} className="btn-primary">
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>

          {/* Notifications config */}
          <div className="card border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Bell className="w-5 h-5 text-brand-blue" />
              <h3 className="font-bold text-slate-800 text-sm">Notification Alerts</h3>
            </div>

            <div className="divide-y divide-slate-100">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Daily ticket summary reports</h4>
                  <p className="text-[10px] text-slate-400">Receive an email every morning detailing your open requests.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailSummary}
                  onChange={() => handleToggleNotify('emailSummary')}
                  className="w-4 h-4 rounded text-brand-blue border-slate-300 focus:ring-brand-blue"
                />
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Instant comment alerts</h4>
                  <p className="text-[10px] text-slate-400">Notify me immediately when an agent adds comments to my tickets.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.instantComment}
                  onChange={() => handleToggleNotify('instantComment')}
                  className="w-4 h-4 rounded text-brand-blue border-slate-300 focus:ring-brand-blue"
                />
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Slack workspace notifications</h4>
                  <p className="text-[10px] text-slate-400">Integrate system alerts and direct message updates to your Slack ID.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.slackIntegration}
                  onChange={() => handleToggleNotify('slackIntegration')}
                  className="w-4 h-4 rounded text-brand-blue border-slate-300 focus:ring-brand-blue"
                />
              </div>
            </div>
          </div>

          {/* Security & Access */}
          <div className="card border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Shield className="w-5 h-5 text-brand-blue" />
              <h3 className="font-bold text-slate-800 text-sm">Security & Access</h3>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  Multi-Factor Authentication (MFA)
                  {mfaEnabled && <span className="inline-flex px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-[9px] font-bold text-emerald-700">Active</span>}
                </h4>
                <p className="text-[10px] text-slate-500 mt-1 max-w-md">
                  Keep your service desk credentials extra secure by requiring a smartphone-generated code at sign in.
                </p>
              </div>

              <button
                onClick={handleToggleMfa}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all shrink-0 ${
                  mfaEnabled
                    ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    : 'bg-brand-blue text-white border-brand-blue hover:bg-brand-blue-dark'
                }`}
              >
                {mfaEnabled ? 'Disable MFA' : 'Enable MFA'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
