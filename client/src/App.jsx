import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { apiRequest } from './api/client';
import Navbar from './components/Navbar';
import StatsHeader from './components/StatsHeader';
import FilterBar from './components/FilterBar';
import ScriptCard from './components/ScriptCard';
import TableView from './components/TableView';
import ScriptModal from './components/ScriptModal';
import LoginPage from './components/LoginPage';
import Toast from './components/Toast';
import { Loader2, Plus, FileText } from 'lucide-react';

export default function App() {
  const { user, showToast, loading: authLoading } = useAuth();

  const [scripts, setScripts] = useState([]);
  const [stats, setStats] = useState({ total: 0, waiting: 0, approved: 0 });
  const [loading, setLoading] = useState(true);

  const [currentTab, setCurrentTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // Default: Grid Cards View

  // Modals state
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [editingScript, setEditingScript] = useState(null);

  // Fetch scripts & stats (with optional silent background refresh)
  const fetchData = async (showLoader = true) => {
    if (!user) return;
    try {
      if (showLoader) setLoading(true);
      const params = new URLSearchParams();
      if (currentTab !== 'all') params.append('status', currentTab);
      if (searchQuery) params.append('search', searchQuery);

      const [scriptsRes, statsRes] = await Promise.all([
        apiRequest(`/scripts?${params.toString()}`),
        apiRequest('/scripts/stats')
      ]);

      setScripts(scriptsRes.scripts || []);
      setStats(statsRes || { total: 0, waiting: 0, approved: 0 });
    } catch (err) {
      console.error('Error loading data:', err);
      showToast(err.message || 'Failed to fetch scripts.', 'error');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData(true);
    }
  }, [currentTab, searchQuery, user]);

  // Handle save (create / update) with zero scroll-jump
  const handleSaveScript = async (data, id) => {
    try {
      if (id) {
        const res = await apiRequest(`/scripts/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        if (res.script) {
          setScripts(prev => prev.map(s => s.id === id ? res.script : s));
        }
        showToast('Script updated successfully!');
      } else {
        const res = await apiRequest('/scripts', {
          method: 'POST',
          body: JSON.stringify(data)
        });
        if (res.script) {
          setScripts(prev => [...prev, res.script]);
        }
        showToast('New script added in Waiting status!');
      }

      // Silent stats update without resetting scroll
      apiRequest('/scripts/stats').then(setStats).catch(() => {});
    } catch (err) {
      showToast(err.message || 'Failed to save script.', 'error');
      throw err;
    }
  };

  // Handle status toggle (Approve / Return to Waiting) smoothly in-place
  const handleStatusToggle = async (id, newStatus) => {
    try {
      // 1. Optimistic in-place update (keeps exact scroll position)
      setScripts(prev => prev.map(s => {
        if (s.id === id) {
          return {
            ...s,
            status: newStatus,
            reviewed_by: newStatus === 'approved' ? (user ? user.name : 'Reviewer') : null,
            reviewed_at: newStatus === 'approved' ? new Date().toISOString() : null
          };
        }
        return s;
      }));

      // 2. Call API
      const res = await apiRequest(`/scripts/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });

      if (res.script) {
        setScripts(prev => prev.map(s => s.id === id ? res.script : s));
      }

      showToast(
        newStatus === 'approved'
          ? 'Script marked as Reviewed & Approved (Green)!'
          : 'Script returned to Waiting for Review (Yellow).'
      );

      // 3. Update stats silently in background
      apiRequest('/scripts/stats').then(setStats).catch(() => {});
    } catch (err) {
      showToast(err.message || 'Failed to update status.', 'error');
      fetchData(false);
    }
  };

  // Handle delete
  const handleDeleteScript = async (id) => {
    if (!window.confirm('Are you sure you want to delete this script?')) return;
    try {
      await apiRequest(`/scripts/${id}`, {
        method: 'DELETE'
      });
      setScripts(prev => prev.filter(s => s.id !== id));
      showToast('Script deleted successfully.');
      apiRequest('/scripts/stats').then(setStats).catch(() => {});
    } catch (err) {
      showToast(err.message || 'Failed to delete script.', 'error');
      fetchData(false);
    }
  };

  // Handle resequence
  const handleResequence = async () => {
    if (!window.confirm('Re-sequence all serial numbers from #1 to #N?')) return;
    try {
      const res = await apiRequest('/scripts/resequence', { method: 'POST' });
      showToast(res.message);
      fetchData(false);
    } catch (err) {
      showToast(err.message || 'Failed to resequence serials.', 'error');
    }
  };

  // Handle export Word docx
  const handleExport = async (status = 'approved') => {
    try {
      showToast('Generating Word document...', 'info');
      const token = localStorage.getItem('on_token');
      const res = await fetch(`/api/scripts/export/word?status=${status}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Failed to generate export');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `One_Nation_Reviewed_Scripts_${status}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('Word document downloaded successfully!');
    } catch (err) {
      showToast('Export failed. Please try again.', 'error');
    }
  };

  // 1. Initial Loading Screen
  if (authLoading) {
    return (
      <div style={{ backgroundColor: '#0e4359' }} className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#a78f31] animate-spin" />
      </div>
    );
  }

  // 2. Strict Authentication Wall: If not logged in, render only the Login Page!
  if (!user) {
    return (
      <>
        <Toast />
        <LoginPage />
      </>
    );
  }

  // 3. Authenticated Dashboard with Wide Workspace
  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7f9]">
      <Toast />

      {/* Top Navbar */}
      <Navbar
        onOpenNewModal={() => {
          setEditingScript(null);
          setIsScriptModalOpen(true);
        }}
        onExport={() => handleExport('approved')}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content - Wide Responsive Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome & Stats Banner */}
        <StatsHeader
          stats={stats}
          onExport={handleExport}
          onResequence={handleResequence}
          loading={loading}
        />

        {/* Filter Bar */}
        <FilterBar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          stats={stats}
        />

        {/* Script Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-10 h-10 text-[#0e4359] animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-500">Loading orphan video scripts...</p>
          </div>
        ) : scripts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Scripts Found</h3>
            <p className="text-sm text-slate-500 mb-6">
              {searchQuery
                ? `No scripts match your search "${searchQuery}".`
                : currentTab === 'approved'
                ? 'No scripts have been approved yet.'
                : 'No scripts in this filter.'}
            </p>
            {user?.role === 'admin' && (
              <button
                onClick={() => {
                  setEditingScript(null);
                  setIsScriptModalOpen(true);
                }}
                className="inline-flex items-center gap-2 bg-[#0e4359] text-white px-4 py-2 rounded-xl text-sm font-bold shadow hover:bg-[#145773]"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Script</span>
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Side-by-Side Responsive Grid Cards Layout (Default) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scripts.map((script) => (
              <ScriptCard
                key={script.id}
                script={script}
                onEdit={(s) => {
                  setEditingScript(s);
                  setIsScriptModalOpen(true);
                }}
                onStatusToggle={handleStatusToggle}
                onDelete={handleDeleteScript}
              />
            ))}
          </div>
        ) : (
          <TableView
            scripts={scripts}
            onEdit={(s) => {
              setEditingScript(s);
              setIsScriptModalOpen(true);
            }}
            onStatusToggle={handleStatusToggle}
            onDelete={handleDeleteScript}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Sadeem Co.. All Rights Reserved.</p>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Secured & Encrypted Portal</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ScriptModal
        isOpen={isScriptModalOpen}
        onClose={() => {
          setIsScriptModalOpen(false);
          setEditingScript(null);
        }}
        script={editingScript}
        onSave={handleSaveScript}
      />
    </div>
  );
}
