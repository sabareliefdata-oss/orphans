import React from 'react';
import { Edit3, CheckCircle2, Clock, Copy, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TableView({ scripts, onEdit, onStatusToggle, onDelete }) {
  const { user, showToast } = useAuth();
  const isViewer = user?.role === 'viewer';

  const copyScript = (script) => {
    const formatted = `Code: ${script.orphan_code}\nChild: ${script.child_name}\n\n${script.script_text}`;
    navigator.clipboard.writeText(formatted);
    showToast('Copied script to clipboard!');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 w-16 text-center">#</th>
              <th className="py-3.5 px-4 w-28">Code</th>
              <th className="py-3.5 px-4 w-44">Child Name</th>
              <th className="py-3.5 px-4">Video Script Content</th>
              <th className="py-3.5 px-4 w-32 text-center">Status</th>
              <th className="py-3.5 px-4 w-36 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {scripts.map((s) => {
              const isApproved = s.status === 'approved';
              return (
                <tr key={s.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 text-center font-mono text-xs font-bold text-slate-400">
                    #{s.serial_no}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#0e4359] text-xs">
                    {s.orphan_code}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {s.child_name}
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-xs leading-relaxed max-w-md">
                    <p className="line-clamp-2">{s.script_text}</p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {isViewer ? (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                          isApproved
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {isApproved ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Approved</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Waiting</span>
                          </>
                        )}
                      </span>
                    ) : (
                      <button
                        onClick={() => onStatusToggle(s.id, isApproved ? 'waiting' : 'approved')}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase transition ${
                          isApproved
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                        }`}
                      >
                        {isApproved ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Approved</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Waiting</span>
                          </>
                        )}
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => copyScript(s)}
                        title="Copy Script"
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {!isViewer && (
                        <button
                          onClick={() => onEdit(s)}
                          title="Edit Script"
                          className="p-1.5 text-[#0e4359] hover:bg-[#0e4359]/10 rounded"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => onDelete(s.id)}
                          title="Delete Script"
                          className="p-1.5 text-rose-400 hover:text-rose-600 rounded hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
