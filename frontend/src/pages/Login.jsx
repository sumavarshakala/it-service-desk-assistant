import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Headphones, Mail, Lock, Eye, EyeOff, Sparkles, Brain, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

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
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Branding Info Column (Left Side) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-blue-dark via-brand-blue to-brand-teal text-white items-center justify-center p-12 relative overflow-hidden">
        <div className="max-w-md relative z-10 space-y-6">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shadow-lg">
            <Headphones className="w-7 h-7 text-white" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold tracking-tight">Intelligent IT Desk</h1>
            <p className="text-brand-blue-light text-sm font-semibold uppercase tracking-wider">Powered by Machine Learning</p>
          </div>
          
          <p className="text-white/80 text-sm leading-relaxed">
            Experience next-generation IT support with automated ticket categorization, priority prediction, and instant knowledge solutions.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-4">
            {[
              { text: 'ML Categorization', icon: Brain },
              { text: 'Priority Prediction', icon: Sparkles },
              { text: 'Knowledge Matching', icon: Lightbulb },
              { text: 'SaaS Analytics', icon: Headphones },
            ].map(({ text, icon: Icon }) => (
              <div 
                key={text} 
                className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3 flex items-center gap-2 text-xs font-semibold"
              >
                <Icon className="w-4 h-4 text-white/90 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic visual shapes */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full filter blur-2xl -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full filter blur-2xl translate-y-20 -translate-x-20" />
      </div>

      {/* Login Form Column (Right Side) */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">Sign In</h2>
            <p className="text-slate-500 text-xs mt-1.5 font-medium">Access your intelligent enterprise service desk</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
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
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type={showPass ? 'text' : 'password'} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="input-field pl-10 pr-10" 
                  placeholder="Enter secure password" 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary w-full py-2.5 mt-2 font-bold"
            >
              {loading ? 'Verifying Account...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 font-semibold">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-blue hover:text-brand-blue-dark transition-colors underline">
              Create an account
            </Link>
          </p>

          {/* Credentials Helper */}
          <div className="p-4 bg-slate-100 border border-slate-200/80 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Demo Portal Credentials</span>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-semibold">
              <div>
                <span className="text-slate-700 block font-bold">Admin Portal</span>
                <p>User: admin@company.com</p>
                <p>Pass: admin123</p>
              </div>
              <div>
                <span className="text-slate-700 block font-bold">Employee Portal</span>
                <p>User: john.doe@company.com</p>
                <p>Pass: employee123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
