import React, { useState } from 'react';
import { Radio, Copy, Check, Users, LogOut, ExternalLink, Monitor } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onOpenUserManagement: () => void;
  isConnected: boolean;
  liveStateActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onOpenUserManagement,
  isConnected,
  liveStateActive,
}) => {
  const [copied, setCopied] = useState(false);

  const displayUrl = `${window.location.origin}/display`;

  const handleCopyDisplayUrl = () => {
    navigator.clipboard.writeText(displayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header id="navbar-header" className="h-16 bg-[#121212] border-b border-white/10 px-6 flex items-center justify-between shrink-0 select-none">
      {/* Brand & System Status */}
      <div id="brand-container" className="flex items-center gap-4">
        <div id="brand-logo" className="flex items-center gap-2.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
          <div className={`w-7 h-7 rounded flex items-center justify-center font-bold text-white transition ${
            liveStateActive ? 'bg-red-600 animate-pulse' : 'bg-blue-600'
          }`}>
            <Radio className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight text-white font-display">PentasLirik</span>
          <span className="text-[10px] bg-white/10 text-white/70 px-1.5 py-0.5 rounded mono">LAN v1.0</span>
        </div>

        {/* Live / WebSocket Connection Status */}
        <div id="connection-status" className="flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-white/[0.03] border border-white/10">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`} />
          <span className="text-white/60">
            {isConnected ? 'WebSocket Online' : 'Connecting...'}
          </span>
        </div>

        {liveStateActive && (
          <div id="live-on-air-badge" className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white" />
            LIVE ON AIR
          </div>
        )}
      </div>

      {/* Center / OBS Browser Source Link */}
      <div id="obs-link-widget" className="hidden md:flex items-center gap-2.5 bg-white/[0.03] px-3.5 py-1.5 rounded-lg border border-white/10 text-xs">
        <Monitor className="w-4 h-4 text-blue-400" />
        <span className="text-white/40">OBS Source URL:</span>
        <code className="text-blue-300 mono text-[11px] max-w-[200px] truncate">{displayUrl}</code>
        <button
          id="copy-obs-url-btn"
          onClick={handleCopyDisplayUrl}
          className="flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded transition text-[11px] ml-1"
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
          className="p-1 hover:text-blue-400 text-white/40 transition"
          title="Open Display Source in New Tab"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* User Info & Actions */}
      <div id="user-actions-container" className="flex items-center gap-3">
        <div id="user-info" className="flex items-center gap-2.5 text-xs">
          <div className="text-right hidden sm:block">
            <div id="user-name-display" className="font-semibold text-white/90">{user.name}</div>
            <div className="text-white/40 text-[10px] uppercase font-bold tracking-wider">{user.role}</div>
          </div>
          <span id="user-role-badge" className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            user.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
          }`}>
            {user.role}
          </span>
        </div>

        {user.role === 'admin' && (
          <button
            id="admin-user-mgmt-btn"
            onClick={onOpenUserManagement}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-xs rounded-lg transition"
            title="Manage User Accounts"
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Users</span>
          </button>
        )}

        <button
          id="logout-btn"
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 text-xs rounded-lg transition"
          title="Log Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
