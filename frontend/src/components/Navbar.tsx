import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Radio, Copy, Check, Users, LogOut, ExternalLink, Monitor, Sliders, Menu, X, Music, ListMusic, Zap, HardDrive, Cloud } from 'lucide-react';
import { User } from '../types';
import { getEnvironmentInfo } from '../utils/envUtils';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onOpenUserManagement: () => void;
  onOpenDisplaySettings: () => void;
  isConnected: boolean;
  liveStateActive: boolean;
  activeMobileTab?: 'live' | 'setlist' | 'library';
  onSelectMobileTab?: (tab: 'live' | 'setlist' | 'library') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onOpenUserManagement,
  onOpenDisplaySettings,
  isConnected,
  liveStateActive,
  activeMobileTab = 'live',
  onSelectMobileTab,
}) => {
  const [copied, setCopied] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const envInfo = getEnvironmentInfo();

  const displayUrl = `${window.location.origin}/display`;

  const handleCopyDisplayUrl = () => {
    navigator.clipboard.writeText(displayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNavClick = (tab: 'live' | 'setlist' | 'library') => {
    if (onSelectMobileTab) {
      onSelectMobileTab(tab);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header id="navbar-header" className="sticky top-0 z-40 h-14 md:h-16 bg-[#121212]/95 backdrop-blur-md border-b border-white/10 px-3 sm:px-6 flex items-center justify-between shrink-0 select-none">
      {/* Brand & System Status */}
      <div id="brand-container" className="flex items-center gap-2 sm:gap-4">
        <div id="brand-logo" className="flex items-center gap-2 bg-white/5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-white/10">
          <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center font-bold text-white transition ${
            liveStateActive ? 'bg-red-600 animate-pulse' : 'bg-blue-600'
          }`}>
            <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
          <span className="font-bold text-sm sm:text-base tracking-tight text-white font-display">PentasLirik</span>
          <span className="hidden sm:inline-block text-[10px] bg-white/10 text-white/70 px-1.5 py-0.5 rounded mono">v1.0</span>
        </div>

        {/* Environment Mode Badge (Local Venue vs Cloud VPS) */}
        <div
          id="badge-environment-mode"
          className={`flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border transition cursor-default shrink-0 ${
            envInfo.isLocal
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
          }`}
          title={envInfo.description}
        >
          {envInfo.isLocal ? (
            <HardDrive className="w-3 h-3 text-emerald-400 shrink-0" />
          ) : (
            <Cloud className="w-3 h-3 text-indigo-400 shrink-0" />
          )}
          <span className="hidden xs:inline sm:inline">{envInfo.label}</span>
          <span className="xs:hidden sm:hidden">{envInfo.isLocal ? 'LOCAL' : 'CLOUD'}</span>
        </div>

        {/* Live / WebSocket Connection Status */}
        <div id="connection-status" className="hidden sm:flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/10">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`} />
          <span className="text-white/70 font-medium">
            {isConnected ? 'Online' : 'Connecting'}
          </span>
        </div>

        {liveStateActive && (
          <div id="live-on-air-badge" className="flex items-center gap-1 bg-red-600 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-lg animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            LIVE
          </div>
        )}
      </div>

      {/* Center / OBS Browser Source Link (Desktop only) */}
      <div id="obs-link-widget" className="hidden lg:flex items-center gap-2.5 bg-white/[0.03] px-3.5 py-1.5 rounded-lg border border-white/10 text-xs">
        <Monitor className="w-4 h-4 text-blue-400" />
        <span className="text-white/40">OBS Source:</span>
        <code className="text-blue-300 mono text-[11px] max-w-[180px] truncate">{displayUrl}</code>
        <button
          id="copy-obs-url-btn"
          onClick={handleCopyDisplayUrl}
          className="flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded transition text-[11px] ml-1 min-h-[32px] touch-manipulation"
          title="Copy URL for OBS Studio Browser Source"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" /> Copied!
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" /> Copy
            </>
          )}
        </button>
        <a
          id="open-display-tab-link"
          href="/display"
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 hover:text-blue-400 text-white/40 transition"
          title="Open Display Source in New Tab"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Desktop Navigation & Actions */}
      <div id="user-actions-container" className="hidden md:flex items-center gap-3">
        <div id="user-info" className="flex items-center gap-2.5 text-xs">
          <div className="text-right">
            <div id="user-name-display" className="font-semibold text-white/90">{user.name}</div>
            <div className="text-white/40 text-[10px] uppercase font-bold tracking-wider">{user.role}</div>
          </div>
          <span id="user-role-badge" className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            user.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
          }`}>
            {user.role}
          </span>
        </div>

        <button
          id="display-settings-btn"
          onClick={onOpenDisplaySettings}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 text-xs rounded-lg transition min-h-[36px] touch-manipulation"
          title="Customize OBS Display Overlay Styling & Presets"
        >
          <Sliders className="w-3.5 h-3.5 text-blue-400" />
          <span>Display Style</span>
        </button>

        {user.role === 'admin' && (
          <button
            id="admin-user-mgmt-btn"
            onClick={onOpenUserManagement}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-xs rounded-lg transition min-h-[36px] touch-manipulation"
            title="Manage User Accounts"
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>Users</span>
          </button>
        )}

        <button
          id="logout-btn"
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 text-xs rounded-lg transition min-h-[36px] touch-manipulation"
          title="Log Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Mobile Hamburger Toggle Button */}
      <div className="flex md:hidden items-center gap-2">
        <button
          id="mobile-menu-toggle-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition touch-manipulation active:scale-95"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6 text-indigo-400" /> : <Menu className="w-6 h-6 text-slate-200" />}
        </button>
      </div>

      {/* Mobile Navigation Slide-Out Drawer & Overlay (Rendered via Portal to Document Body) */}
      {isMobileMenuOpen &&
        createPortal(
          <div className="relative z-[100]">
            {/* Backdrop Overlay */}
            <div
              id="mobile-drawer-backdrop"
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] transition-opacity duration-200"
            />

            {/* Slide-out Drawer Container */}
            <aside
              id="mobile-navigation-drawer"
              className="fixed inset-y-0 left-0 w-80 max-w-[85vw] h-full bg-slate-900 border-r border-slate-800 p-5 pt-8 sm:pt-6 pt-safe z-[101] shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200"
            >
              <div className="space-y-6">
                {/* Drawer Top Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white ${
                      liveStateActive ? 'bg-red-600 animate-pulse' : 'bg-indigo-600'
                    }`}>
                      <Radio className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white font-display">PentasLirik</h3>
                      <p className="text-xs text-slate-400">Mobile Control Center</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* User Profile Card */}
                <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">{user.name}</div>
                    <div className="text-xs text-slate-400 capitalize">{user.role} Account</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                    user.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {user.role}
                  </span>
                </div>

                {/* View Navigation Links */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-2 pb-1">
                    Navigasi Halaman
                  </div>

                  <button
                    id="nav-drawer-link-live"
                    onClick={() => handleNavClick('live')}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition min-h-[48px] ${
                      activeMobileTab === 'live'
                        ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Zap className="w-5 h-5 text-amber-400" />
                    <span>Live Control Panel</span>
                  </button>

                  <button
                    id="nav-drawer-link-setlist"
                    onClick={() => handleNavClick('setlist')}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition min-h-[48px] ${
                      activeMobileTab === 'setlist'
                        ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <ListMusic className="w-5 h-5 text-indigo-400" />
                    <span>Setlist Rundown</span>
                  </button>

                  <button
                    id="nav-drawer-link-pustaka-lagu"
                    onClick={() => handleNavClick('library')}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition min-h-[48px] ${
                      activeMobileTab === 'library'
                        ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Music className="w-5 h-5 text-emerald-400" />
                    <span>Pustaka Lagu</span>
                  </button>
                </div>

                {/* System Action Links */}
                <div className="space-y-1.5 pt-3 border-t border-slate-800">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-2 pb-1">
                    Pengaturan & Sistem
                  </div>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenDisplaySettings();
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition min-h-[48px]"
                  >
                    <Sliders className="w-5 h-5 text-blue-400" />
                    <span>Display Overlay Style</span>
                  </button>

                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenUserManagement();
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition min-h-[48px]"
                    >
                      <Users className="w-5 h-5 text-purple-400" />
                      <span>Manajemen Pengguna</span>
                    </button>
                  )}

                  {/* OBS URL Copy Widget for Mobile */}
                  <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 space-y-2 mt-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1.5 font-medium text-slate-300">
                        <Monitor className="w-4 h-4 text-blue-400" /> OBS Browser Source
                      </span>
                      <a
                        href="/display"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline flex items-center gap-1"
                      >
                        Buka <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={displayUrl}
                        className="bg-slate-900 text-blue-300 mono text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 w-full truncate"
                      />
                      <button
                        onClick={handleCopyDisplayUrl}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shrink-0 min-h-[36px] flex items-center gap-1"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logout Footer */}
              <div className="pt-4 pb-safe border-t border-slate-800 mt-6">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-xl font-semibold text-sm transition min-h-[48px]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar (Logout)</span>
                </button>
              </div>
            </aside>
          </div>,
          document.body
        )}
    </header>
  );
};
