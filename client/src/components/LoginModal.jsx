import React, { useState } from 'react';
import { X, Lock, User, Key, ShieldCheck, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginModal({ isOpen, onClose }) {
  const { login, showToast } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setPresetRole = (userType) => {
    if (userType === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('reviewer');
      setPassword('reviewer123');
    }
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0e4359] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-[#a78f31]/20 border border-[#a78f31] rounded-2xl flex items-center justify-center mb-3">
            <Lock className="w-6 h-6 text-[#f5d77f]" />
          </div>
          <h2 className="text-xl font-bold">Sign In to Portal</h2>
          <p className="text-xs text-slate-300 mt-1">
            Access your Translator or Reviewer role account
          </p>
        </div>

        {/* Quick Demo Switcher */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Quick Sign In Presets:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPresetRole('reviewer')}
              className="text-xs py-2 px-3 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-xl font-semibold transition text-left flex items-center justify-between"
            >
              <div>
                <p className="font-bold">Reviewer</p>
                <span className="text-[10px] text-slate-400">reviewer123</span>
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </button>

            <button
              type="button"
              onClick={() => setPresetRole('admin')}
              className="text-xs py-2 px-3 bg-white hover:bg-[#0e4359]/10 text-slate-700 hover:text-[#0e4359] border border-slate-200 hover:border-[#0e4359]/40 rounded-xl font-semibold transition text-left flex items-center justify-between"
            >
              <div>
                <p className="font-bold">Translator / Admin</p>
                <span className="text-[10px] text-slate-400">admin123</span>
              </div>
              <Key className="w-4 h-4 text-[#a78f31]" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0e4359]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0e4359]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#0e4359] hover:bg-[#145773] text-white rounded-xl font-bold text-sm shadow-md transition disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
