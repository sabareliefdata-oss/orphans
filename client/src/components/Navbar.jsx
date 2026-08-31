import React, { useState } from 'react';
import { LogOut, Search, Plus, Download, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

export default function Navbar({ onOpenNewModal, onExport, searchQuery, onSearchChange }) {
  const { user, logout } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="bg-[#0e4359] text-white shadow-lg sticky top-0 z-40 border-b border-[#13536d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Portal Title */}
          <div className="flex items-center gap-3.5">
            <div className="h-14 w-auto flex items-center justify-center p-1 bg-[#092d3c]/50 rounded-xl border border-white/10 shadow-inner">
              <img
                src={logoImg}
                alt="One Nation Logo"
                className="h-11 w-auto object-contain drop-shadow"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-widest font-semibold text-[#a78f31] bg-[#a78f31]/15 px-2 py-0.5 rounded border border-[#a78f31]/30">
                  Translation & Review
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                One Nation Orphans' Video Scripts
              </h1>
            </div>
          </div>

          {/* Center / Right: Search & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Top Search Bar (Expandable or inline) */}
            <div className="relative">
              <div className={`flex items-center transition-all duration-200 ${
                isSearchOpen ? 'w-48 sm:w-64' : 'w-9 sm:w-56'
              }`}>
                <Search
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="w-4 h-4 text-slate-300 absolute left-3 cursor-pointer sm:pointer-events-none z-10"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                  onBlur={() => {
                    if (!searchQuery) setIsSearchOpen(false);
                  }}
                  placeholder="Search code or name..."
                  className={`w-full pl-9 pr-8 py-2 rounded-xl bg-black/20 border border-white/20 text-xs sm:text-sm text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#a78f31] focus:bg-black/40 transition ${
                    isSearchOpen ? 'block' : 'hidden sm:block'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-2.5 text-slate-300 hover:text-white p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Export Button in Navbar (Accessible to all roles) */}
            <button
              onClick={onExport}
              title="Download Reviewed Word Document (.docx)"
              className="flex items-center gap-1.5 bg-[#092d3c] hover:bg-[#145773] text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-xs transition border border-white/10 hover:border-[#a78f31]/40"
            >
              <Download className="w-4 h-4 text-[#a78f31]" />
              <span className="hidden md:inline">Download (.docx)</span>
            </button>

            {/* Add Script (Admin Only) */}
            {user?.role === 'admin' && (
              <button
                onClick={onOpenNewModal}
                className="flex items-center gap-1.5 bg-[#a78f31] hover:bg-[#917b27] text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow transition transform active:scale-95 border border-[#c4a93f]/40"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Script</span>
              </button>
            )}

            {/* User Role Badge */}
            {user && (
              <div className="flex items-center gap-2 bg-[#092d3c]/60 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                <div className="w-7 h-7 rounded-full bg-[#a78f31]/20 border border-[#a78f31] flex items-center justify-center text-[#f5d77f] font-bold">
                  {user.role === 'admin' ? 'A' : 'R'}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="font-semibold text-white leading-tight">{user.name}</p>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-300">
                    {user.role === 'admin' ? 'Translator' : 'Reviewer'}
                  </span>
                </div>
              </div>
            )}

            {/* Logout */}
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-100 border border-red-500/20 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
