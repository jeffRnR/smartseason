import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sprout, Eye, EyeOff } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../lib/auth-context';

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'AGENT' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.data.token, data.data.user);
      navigate('/dashboard');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-xl bg-leaf-600 flex items-center justify-center">
            <Sprout className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-stone-800 font-medium">Smart Season</span>
        </div>

        <h2 className="font-display text-3xl font-medium text-stone-800 mb-2">Create account</h2>
        <p className="text-stone-500 mb-8">Join the field monitoring platform.</p>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Jane Wanjiku"
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
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
                placeholder="Min 6 characters"
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

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">Role</label>
            <select
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-400 focus:border-transparent bg-white"
            >
              <option value="AGENT">Field Agent</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-leaf-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-leaf-700 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </div>

        <p className="text-center text-sm text-stone-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-leaf-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
