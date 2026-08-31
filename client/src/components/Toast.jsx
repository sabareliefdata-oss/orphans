import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Toast() {
  const { toast } = useAuth();
  if (!toast) return null;

  const bgStyles = {
    success: { backgroundColor: '#064e3b', borderColor: '#10b981', color: '#ffffff' },
    error: { backgroundColor: '#881337', borderColor: '#f43f5e', color: '#ffffff' },
    warning: { backgroundColor: '#78350f', borderColor: '#f59e0b', color: '#ffffff' },
    info: { backgroundColor: '#092d3c', borderColor: '#a78f31', color: '#ffffff' }
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-[#f5d77f] shrink-0" />
  };

  const style = bgStyles[toast.type] || bgStyles.info;

  return (
    <div
      style={{
        ...style,
        boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.6)'
      }}
      className="fixed bottom-6 right-6 z-50 max-w-md border-2 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xl transition-all duration-300 animate-fade-in"
    >
      {icons[toast.type] || icons.info}
      <p className="text-sm font-bold text-white tracking-wide flex-1 leading-snug">
        {toast.message}
      </p>
    </div>
  );
}
