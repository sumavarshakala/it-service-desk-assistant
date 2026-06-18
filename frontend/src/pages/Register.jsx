import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Building, Headphones } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-blue/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-teal/5 rounded-full filter blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-card relative z-10 space-y-6">
        <div className="flex flex-col items-center text-center space-y-2 mb-2">
          <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center border border-brand-blue/20">
            <Headphones className="w-6 h-6 text-brand-blue" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-950 tracking-tight">Create Portal Account</h2>
            <p className="text-slate-500 text-xs mt-1 font-medium">Register for access to the IT service desk portal</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { name: 'name', label: 'Full Name', icon: User, type: 'text', placeholder: 'e.g. John Doe' },
            { name: 'email', label: 'Work Email Address', icon: Mail, type: 'email', placeholder: 'you@company.com' },
            { name: 'password', label: 'Secure Password', icon: Lock, type: 'password', placeholder: 'Min 6 characters' },
            { name: 'department', label: 'Company Department', icon: Building, type: 'text', placeholder: 'e.g. Engineering' },
          ].map(({ name, label, icon: Icon, type, placeholder }) => (
            <div key={name}>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  name={name} 
                  type={type} 
                  value={form[name]} 
                  onChange={handleChange} 
                  className="input-field pl-10" 
                  placeholder={placeholder} 
                  required 
                />
              </div>
            </div>
          ))}

          <button 
            type="submit" 
            disabled={loading} 
            className="btn-primary w-full py-2.5 mt-2 font-bold"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 font-semibold">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-blue hover:text-brand-blue-dark transition-colors underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
