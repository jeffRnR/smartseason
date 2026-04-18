import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sprout, Eye, EyeOff } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../lib/auth-context';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.data.token, data.data.user);
      navigate('/dashboard');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-leaf-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 70%, #fff 0, transparent 60%), radial-gradient(circle at 80% 20%, #fff 0, transparent 50%)' }}
        />
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-white text-xl font-medium">Smart Season</span>
          </div>
          <h1 className="font-display text-5xl font-light text-white leading-tight mb-6">
            Monitor your fields,<br />
            <em>season by season.</em>
          </h1>
          <p className="text-leaf-100 text-lg leading-relaxed max-w-sm">
            Real-time field status, crop stage tracking, and intelligent risk detection — all in one platform.
          </p>
        </div>
        <div className="relative grid grid-cols-3 gap-4">
          {[
            { label: 'Active Fields', value: '—' },
            { label: 'At Risk Alerts', value: '—' },
            { label: 'Seasons Tracked', value: '—' },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 rounded-xl p-4">
              <p className="text-white font-display text-2xl font-light">{s.value}</p>
              <p className="text-leaf-200 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-8 h-8 rounded-xl bg-leaf-600 flex items-center justify-center">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-stone-800 font-medium">Smart Season</span>
          </div>

          <h2 className="font-display text-3xl font-medium text-stone-800 mb-2">Welcome back</h2>
          <p className="text-stone-500 mb-8">Sign in to your field monitoring account.</p>

          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="you@example.com"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="••••••••"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-400 focus:border-transparent pr-10"
                />
                <button
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-leaf-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-leaf-700 transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          <p className="text-center text-sm text-stone-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-leaf-600 font-medium hover:underline">
              Register
            </Link>
          </p>

          <div className="mt-8 p-4 bg-soil-50 border border-soil-200 rounded-xl">
            <p className="text-xs font-semibold text-soil-700 mb-2">Demo Credentials</p>
            <div className="space-y-1 font-mono text-xs text-soil-600">
              <p>Admin: admin@smartseason.com</p>
              <p>Agent: agent1@smartseason.com</p>
              <p>Password: password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
