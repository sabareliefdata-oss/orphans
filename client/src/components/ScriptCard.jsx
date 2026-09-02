import React, { useState } from 'react';
import { Edit3, CheckCircle2, Clock, Copy, Check, Trash2, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ScriptCard({ script, onEdit, onStatusToggle, onDelete }) {
  const { user, showToast } = useAuth();
  const [copied, setCopied] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const isApproved = script.status === 'approved';
  const isViewer = user?.role === 'viewer';

  const handleCopy = () => {
    const formatted = `Code: ${script.orphan_code}\nChild: ${script.child_name}\n\n${script.script_text}`;
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    showToast('Copied script to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggle = async () => {
    if (!user || isViewer) {
      showToast('You have read-only access.', 'warning');
      return;
    }
    const nextStatus = isApproved ? 'waiting' : 'approved';
    try {
      setLoadingStatus(true);
      await onStatusToggle(script.id, nextStatus);
    } finally {
      setLoadingStatus(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border bg-white p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
        isApproved
          ? 'border-emerald-200/90 shadow-xs hover:border-emerald-400/80 bg-linear-to-b from-emerald-50/20 to-white'
          : 'border-amber-200/90 shadow-xs hover:border-amber-400/80 bg-linear-to-b from-amber-50/25 to-white'
      }`}
    >
      <div>
        {/* Card Header: Serial, Code & Status Badge */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              #{script.serial_no}
            </span>
            <span className="font-mono text-xs font-bold text-[#0e4359] bg-[#0e4359]/10 px-2 py-0.5 rounded-md border border-[#0e4359]/20">
              {script.orphan_code}
            </span>
          </div>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
              isApproved
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            {isApproved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Approved</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Waiting</span>
              </>
            )}
          </span>
        </div>

        {/* Child's Name as Main Title */}
        <h3 className="text-lg font-bold text-slate-900 mb-2.5 flex items-center gap-2 group">
          <span>{script.child_name || 'Orphan Child'}</span>
        </h3>

        {/* Script Content */}
        <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/70 text-slate-700 text-sm leading-relaxed mb-4 whitespace-pre-wrap selection:bg-[#a78f31]/30">
          {script.script_text}
        </div>

        {/* Notes (if any) */}
        {script.notes && (
          <div className="mb-4 text-xs bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-900 flex items-start gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Reviewer Note: </span>
              <span>{script.notes}</span>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer: Metadata & Actions */}
      <div className="pt-3 border-t border-slate-100">
        {/* Reviewer Stamp */}
        {isApproved && script.reviewed_by && (
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium mb-3">
            <UserCheck className="w-3.5 h-3.5" />
            <span>
              Reviewed & Approved by <strong className="font-semibold">{script.reviewed_by}</strong>
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2">
          {/* Quick Copy & Edit */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              title="Copy formatted script"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            {!isViewer && (
              <button
                onClick={() => onEdit(script)}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 text-slate-700 hover:text-[#0e4359] bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                title="Edit script text"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}

            {user?.role === 'admin' && (
              <button
                onClick={() => onDelete(script.id)}
                className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="Delete script"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Primary Action Button: Approve / Unapprove (Hidden for Viewer role) */}
          {!isViewer && (
            <button
              onClick={handleToggle}
              disabled={loadingStatus}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition transform active:scale-95 shadow-xs ${
                isApproved
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700'
                  : 'bg-[#a78f31] hover:bg-[#917b27] text-white border border-[#8d7722]'
              }`}
            >
              {isApproved ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approved</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white/90" />
                  <span>Mark as Reviewed</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
