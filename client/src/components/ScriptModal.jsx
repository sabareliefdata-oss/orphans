import React, { useState, useEffect } from 'react';
import { X, Save, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ScriptModal({ isOpen, onClose, script, onSave }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    orphan_code: '',
    child_name: '',
    script_text: '',
    notes: '',
    status: 'waiting'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (script) {
      setFormData({
        orphan_code: script.orphan_code || '',
        child_name: script.child_name || '',
        script_text: script.script_text || '',
        notes: script.notes || '',
        status: script.status || 'waiting'
      });
    } else {
      setFormData({
        orphan_code: '',
        child_name: '',
        script_text: '',
        notes: '',
        status: 'waiting'
      });
    }
  }, [script, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onSave(formData, script ? script.id : null);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#0e4359] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">
              {script ? `Edit Script: #${script.serial_no} (${script.orphan_code})` : 'Create New Orphan Script'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Orphan Code */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Orphan Code
              </label>
              <input
                type="text"
                required
                placeholder="e.g. YE-01086"
                value={formData.orphan_code}
                onChange={(e) => setFormData({ ...formData, orphan_code: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0e4359] font-mono font-semibold"
              />
            </div>

            {/* Child's Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Child's Full Name (Title)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Amwaj Nabeel"
                value={formData.child_name}
                onChange={(e) => setFormData({ ...formData, child_name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0e4359]"
              />
            </div>
          </div>

          {/* Script Text */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                English Video Script Body
              </label>
              <span className="text-xs text-slate-400">
                {formData.script_text.length} characters | {formData.script_text.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              rows={6}
              required
              placeholder="Assalam Alaikum. I am [Child Name]..."
              value={formData.script_text}
              onChange={(e) => setFormData({ ...formData, script_text: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0e4359] leading-relaxed resize-y"
            ></textarea>
          </div>

          {/* Status Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Review Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 'waiting' })}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    formData.status === 'waiting'
                      ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Waiting (Yellow)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 'approved' })}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    formData.status === 'approved'
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Approved (Green)</span>
                </button>
              </div>
            </div>

            {/* Reviewer Note */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Internal Remarks / Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Corrected pronunciation spelling"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0e4359]"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white bg-[#0e4359] hover:bg-[#145773] shadow-md transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Script'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
