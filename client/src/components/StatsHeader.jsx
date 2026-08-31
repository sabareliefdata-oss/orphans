import React from 'react';
import { CheckCircle, Clock, FileText, Download, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function StatsHeader({ stats, onExport, onResequence, loading }) {
  const { user } = useAuth();
  const total = stats?.total || 0;
  const waiting = stats?.waiting || 0;
  const approved = stats?.approved || 0;
  const percentage = total > 0 ? Math.round((approved / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 mb-6 transition">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
          {/* Total */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="p-3 bg-[#0e4359]/10 text-[#0e4359] rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Scripts</p>
              <h3 className="text-2xl font-bold text-slate-900">{total}</h3>
            </div>
          </div>

          {/* Waiting for Review (Yellow) */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50/80 border border-amber-200/80">
            <div className="p-3 bg-amber-500/15 text-amber-700 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Waiting Review</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-amber-900">{waiting}</h3>
                <span className="text-xs font-medium text-amber-700">Pending</span>
              </div>
            </div>
          </div>

          {/* Reviewed & Approved (Green) */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/80">
            <div className="p-3 bg-emerald-500/15 text-emerald-700 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Approved & Ready</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-emerald-900">{approved}</h3>
                <span className="text-xs font-medium text-emerald-700">Done</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Progress & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 lg:border-l lg:border-slate-200 lg:pl-6">
          {/* Progress Circle / Bar */}
          <div className="min-w-[140px] text-center sm:text-left">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1.5">
              <span>Review Progress</span>
              <span className="text-[#0e4359] font-bold">{percentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
              <div
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Quick Word Export Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onExport('approved')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#0e4359] hover:bg-[#145773] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition border border-[#145773]"
              title="Download Reviewed Word Document (.docx)"
            >
              <Download className="w-4 h-4 text-[#a78f31]" />
              <span>Export Approved (.docx)</span>
            </button>

            {user?.role === 'admin' && (
              <button
                onClick={onResequence}
                className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition border border-slate-200"
                title="Resequence Serial Numbers (#1 to #N)"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
