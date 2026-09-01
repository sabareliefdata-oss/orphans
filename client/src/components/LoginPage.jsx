import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, KeyRound, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

export default function LoginPage() {
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter your access password.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await login('', password.trim());
    } catch (err) {
      setError(err.message || 'Incorrect access password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#092d3c',
        backgroundImage: 'radial-gradient(circle at 50% 20%, #0e4359 0%, #092d3c 70%, #061e28 100%)'
      }}
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 selection:bg-[#a78f31] selection:text-white"
    >
      <div className="relative z-10 max-w-md w-full my-auto">
        {/* Logo and Header Box */}
        <div className="flex flex-col items-center text-center mb-8">
          {/* Centered Logo on its own */}
          <div
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(255, 255, 255, 0.15)' }}
            className="p-4 rounded-3xl border shadow-2xl mb-5 flex items-center justify-center"
          >
            <img
              src={logoImg}
              alt="One Nation Logo"
              className="h-16 w-auto object-contain drop-shadow-md"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            One Nation Orphans' Video Scripts
          </h1>
        </div>

        {/* Login Card */}
        <div
          style={{
            backgroundColor: '#0c3547',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
          className="border rounded-3xl p-6 sm:p-8 text-white"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                style={{ backgroundColor: 'rgba(225, 29, 72, 0.2)', borderColor: 'rgba(225, 29, 72, 0.4)', color: '#fecdd3' }}
                className="p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2 flex items-center justify-between">
                <span>Access Password</span>
                <span className="text-[11px] text-[#f5d77f] font-medium lowercase">Role auto-assigned</span>
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-5 h-5 text-[#f5d77f]" />
                </div>

                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security access password"
                  style={{
                    backgroundColor: '#06202c',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff'
                  }}
                  className="w-full pl-11 pr-11 py-3.5 border rounded-2xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#a78f31] transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-slate-300" /> : <Eye className="w-4 h-4 text-slate-300" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: '#a78f31', borderColor: 'rgba(255, 255, 255, 0.2)' }}
              className="w-full py-3.5 px-4 hover:brightness-110 text-white rounded-2xl font-bold text-sm shadow-xl transition transform active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 border"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Privacy & Security Stamp */}
          <div
            style={{ borderTopColor: 'rgba(255, 255, 255, 0.1)' }}
            className="mt-6 pt-5 border-t flex items-center justify-center gap-2 text-xs text-slate-300 text-center font-medium"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>End-to-End Encrypted & Authenticated</span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 Sadeem Co.. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
