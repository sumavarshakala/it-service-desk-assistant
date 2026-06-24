import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, Brain, Sparkles, Shield,
  BarChart3, Clock, Users, CheckCircle, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: Brain, label: 'AI Classification', desc: 'Auto-categorizes and prioritizes tickets instantly' },
  { icon: BarChart3, label: 'Live Analytics', desc: 'Real-time SLA tracking and team performance' },
  { icon: Clock, label: 'SLA Management', desc: 'Never miss a response or resolution deadline' },
  { icon: Users, label: 'Role-Based Access', desc: 'Granular permissions for employees and admins' },
];

const STATS = [
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '<2h', label: 'Avg Resolution' },
  { value: '94%', label: 'AI Accuracy' },
  { value: '500+', label: 'Tickets Managed' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (type) => {
    if (type === 'admin') {
      setEmail('admin@company.com');
      setPassword('admin123');
    } else {
      setEmail('john.doe@company.com');
      setPassword('employee123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* LEFT — Branding Panel */}
      <div className="hidden lg:flex lg:w-[55%] bg-gradient-to-br from-slate-900 via-brand-blue-dark to-[#1e3a5f] relative overflow-hidden flex-col justify-between p-14">
        {/* Background layers */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-brand-blue rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-brand-teal rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />

        {/* Top content */}
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-extrabold text-sm tracking-tight">IT Service Desk</p>
              <p className="text-white/50 text-[10px] font-medium uppercase tracking-wider">Enterprise Portal</p>
            </div>
          </div>

          {/* Hero */}
          <div className="space-y-5 max-w-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs text-white/80 font-semibold">
              <Sparkles className="w-3 h-3 text-brand-teal" />
              AI-Powered · Enterprise Grade
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
              Intelligent IT<br />Service Desk
            </h1>
            <p className="text-white/60 text-sm leading-relaxed">
              Transform your IT operations with AI-driven ticket management, real-time SLA tracking, and enterprise-grade analytics.
            </p>
          </div>

          {/* Feature list */}
          <div className="mt-10 space-y-4">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-8 h-8 bg-white/10 border border-white/15 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-white/80" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{label}</p>
                  <p className="text-white/50 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative z-10">
          <div className="border border-white/10 bg-white/5 backdrop-blur-sm rounded-2xl p-5">
            <div className="grid grid-cols-4 divide-x divide-white/10">
              {STATS.map(({ value, label }) => (
                <div key={label} className="text-center px-4 first:pl-0 last:pr-0">
                  <p className="text-xl font-extrabold text-white">{value}</p>
                  <p className="text-[10px] text-white/50 font-medium mt-0.5 uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-5">
            {[
              { color: 'bg-emerald-400', label: 'SOC 2 Type II' },
              { color: 'bg-blue-400', label: 'ISO 27001' },
              { color: 'bg-purple-400', label: 'GDPR Ready' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-[10px] text-white/50 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-[380px] space-y-7">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-blue-dark to-brand-teal rounded-xl flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-white" style={{ width: '18px', height: '18px' }} />
            </div>
            <p className="font-extrabold text-slate-900 text-sm">IT Service Desk</p>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-1.5">Sign in to your enterprise service desk</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-2 font-bold text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying credentials...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Sign In Securely
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-blue font-semibold hover:text-brand-blue-dark transition-colors">
              Create account
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Demo Access Credentials</p>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin')}
                className="text-left p-3 rounded-lg border border-rose-100 bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Shield className="w-3 h-3 text-rose-600" />
                  <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wide">Admin</span>
                </div>
                <p className="text-[10px] text-slate-600 font-medium truncate">admin@company.com</p>
                <p className="text-[10px] text-slate-400">admin123</p>
                <p className="text-[9px] text-rose-500 font-semibold mt-1.5">Click to auto-fill →</p>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('employee')}
                className="text-left p-3 rounded-lg border border-blue-100 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Users className="w-3 h-3 text-blue-600" />
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">Employee</span>
                </div>
                <p className="text-[10px] text-slate-600 font-medium truncate">john.doe@company.com</p>
                <p className="text-[10px] text-slate-400">employee123</p>
                <p className="text-[9px] text-blue-500 font-semibold mt-1.5">Click to auto-fill →</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
