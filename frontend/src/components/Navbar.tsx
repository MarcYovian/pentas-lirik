import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Radio,
  Copy,
  Check,
  Users,
  LogOut,
  ExternalLink,
  Monitor,
  Sliders,
  Menu,
  X,
  Music,
  ListMusic,
  Zap,
  HardDrive,
  Cloud,
  Download,
  WifiOff,
  User as UserIcon,
  Sparkles,
  Building2,
  ChevronDown,
  UserPlus,
  Server,
  Shield,
} from 'lucide-react';
import { Organization, User } from '../types';
import { getEnvironmentInfo } from '../utils/envUtils';
import { onInstallPromptChange, promptPwaInstall } from '../utils/serviceWorkerRegistration';

interface NavbarProps {
  user: User;
  organizations?: Organization[];
  currentOrganization?: Organization | null;
  onOpenOrgSwitcher?: () => void;
  onOpenTeamManagement?: () => void;
  onOpenUserProfile?: () => void;
  onOpenSuperAdmin?: () => void;
  onLogout: () => void;
  onOpenUserManagement: () => void;
  onOpenDisplaySettings: () => void;
  isConnected: boolean;
  liveStateActive: boolean;
  isOffline?: boolean;
  activeMobileTab?: 'live' | 'setlist' | 'library';
  onSelectMobileTab?: (tab: 'live' | 'setlist' | 'library') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  organizations = [],
  currentOrganization = null,
  onOpenOrgSwitcher,
  onOpenTeamManagement,
  onOpenUserProfile,
  onOpenSuperAdmin,
  onLogout,
  onOpenUserManagement,
  onOpenDisplaySettings,
  isConnected,
  liveStateActive,
  isOffline = false,
  activeMobileTab = 'live',
  onSelectMobileTab,
}) => {
  const [copied, setCopied] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [canInstallPwa, setCanInstallPwa] = useState(false);
  const [lanInfo, setLanInfo] = useState<{ primary_ip?: string; port?: number; lan_dashboard_url?: string } | null>(null);
  const [copiedLan, setCopiedLan] = useState(false);
  const envInfo = getEnvironmentInfo();

  useEffect(() => {
    fetch('/api/v1/system/network-info')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.data?.primary_ip && json.data.primary_ip !== '127.0.0.1') {
          setLanInfo(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleCopyLanUrl = () => {
    if (lanInfo?.lan_dashboard_url) {
      navigator.clipboard.writeText(lanInfo.lan_dashboard_url);
      setCopiedLan(true);
      setTimeout(() => setCopiedLan(false), 2000);
    }
  };

  useEffect(() => {
    const unsubscribe = onInstallPromptChange((canInstall) => {
      setCanInstallPwa(canInstall);
    });
    return unsubscribe;
  }, []);

  const displayUrl = currentOrganization?.slug
    ? `${window.location.origin}/display?org=${encodeURIComponent(currentOrganization.slug)}`
    : `${window.location.origin}/display`;

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

  const handleInstallClick = async () => {
    await promptPwaInstall();
  };

  const isOrgAdmin =
    user.role === 'admin' ||
    currentOrganization?.pivot?.role === 'ADMIN';

  return (
    <header
      id="navbar-header"
      className="sticky top-0 z-40 h-14 md:h-16 bg-[#121212]/95 backdrop-blur-xl border-b border-white/10 px-3 sm:px-5 lg:px-6 flex items-center justify-between shrink-0 select-none transition-all"
    >
      {/* LEFT SECTION: Brand, Organization Switcher, Environment & Live Status */}
      <div id="brand-container" className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Brand Logo */}
        <div
          id="brand-logo"
          className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.07] px-2.5 py-1.5 rounded-xl border border-white/10 shadow-inner transition group cursor-pointer"
          onClick={() => handleNavClick('live')}
          title="PentasLirik - Live Streaming Lyric Controller"
        >
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-white transition-all shadow-md ${
              liveStateActive
                ? 'bg-gradient-to-tr from-rose-600 to-red-500 ring-2 ring-red-500/50 animate-pulse'
                : 'bg-gradient-to-tr from-blue-600 to-indigo-500 group-hover:scale-105'
            }`}
          >
            <Radio className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white font-display">
                Pentas<span className="text-blue-400">Lirik</span>
              </span>
              <span className="hidden sm:inline-block text-[9px] bg-blue-500/15 text-blue-300 font-mono font-semibold px-1.5 py-0.5 rounded border border-blue-500/20">
                v1.0
              </span>
            </div>
          </div>
        </div>

        {/* Organization Switcher Chip */}
        {onOpenOrgSwitcher && (
          <button
            id="org-switcher-chip"
            onClick={onOpenOrgSwitcher}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 rounded-xl text-amber-300 text-xs font-semibold transition active:scale-95 shadow-sm max-w-[130px] sm:max-w-[190px]"
            title="Beralih atau Buat Organisasi"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{currentOrganization?.name || 'Organisasi'}</span>
            <ChevronDown className="w-3 h-3 text-amber-400/70 shrink-0" />
          </button>
        )}

        {/* Live Broadcast Pulse Indicator */}
        {liveStateActive && (
          <div
            id="live-on-air-badge"
            className="flex items-center gap-1.5 bg-red-600/90 hover:bg-red-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg shadow-red-600/30 border border-red-400/30 animate-pulse shrink-0"
            title="Lirik sedang tayang di layar OBS Display"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>LIVE</span>
          </div>
        )}

        {/* Environment Badge (Local Venue vs Cloud VPS) */}
        <div
          id="badge-environment-mode"
          className={`hidden xl:flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold px-2.5 py-1 rounded-full border transition cursor-default shrink-0 shadow-sm ${
            envInfo.isLocal
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
          }`}
          title={envInfo.description}
        >
          {envInfo.isLocal ? (
            <HardDrive className="w-3 h-3 text-emerald-400 shrink-0" />
          ) : (
            <Cloud className="w-3 h-3 text-indigo-400 shrink-0" />
          )}
          <span className="hidden sm:inline">{envInfo.label}</span>
          <span className="sm:hidden">{envInfo.isLocal ? 'LOCAL' : 'CLOUD'}</span>
        </div>

        {/* Local Wi-Fi Access Badge for iPad / Multi-device */}
        {lanInfo && lanInfo.primary_ip && (
          <button
            id="badge-lan-ip"
            onClick={handleCopyLanUrl}
            className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-300 text-xs font-semibold transition active:scale-95 shadow-sm"
            title={`Klik untuk menyalin URL akses iPad/HP: ${lanInfo.lan_dashboard_url}`}
          >
            <Radio className="w-3 h-3 text-cyan-400 shrink-0 animate-pulse" />
            <span className="font-mono text-[11px]">{lanInfo.primary_ip}:{lanInfo.port || 3000}</span>
            {copiedLan ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-cyan-400/70" />}
          </button>
        )}

        {/* Live Sync / Offline Cache Status Badge */}
        <div
          id="connection-status"
          className={`flex items-center gap-1.5 text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 rounded-full border transition-all ${
            isOffline
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-sm shadow-amber-500/10'
              : isConnected
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          }`}
          title={
            isOffline
              ? 'Mode Offline Aktif (Data tersimpan di IndexedDB)'
              : isConnected
              ? 'WebSocket Server Terhubung (Real-Time Sync)'
              : 'Menghubungkan ke WebSocket Server...'
          }
        >
          {isOffline ? (
            <>
              <WifiOff className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="font-semibold hidden sm:inline">Offline Cache</span>
            </>
          ) : (
            <>
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-500 animate-pulse'
                }`}
              />
              <span className="font-semibold hidden sm:inline">
                {isConnected ? 'Online' : 'Connecting'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* CENTER SECTION: OBS Browser Source Widget (Desktop Only) */}
      <div
        id="obs-link-widget"
        className="hidden lg:flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.05] pl-3 pr-1.5 py-1 rounded-xl border border-white/10 text-xs shadow-inner transition group"
      >
        <Monitor className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span className="text-white/40 font-medium">OBS:</span>
        <code className="text-blue-300 mono text-[11px] max-w-[130px] xl:max-w-[180px] truncate">
          {displayUrl}
        </code>
        <div className="flex items-center gap-1 ml-1">
          <button
            id="copy-obs-url-btn"
            onClick={handleCopyDisplayUrl}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition text-[11px] font-semibold min-h-[28px] touch-manipulation active:scale-95 ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Salin URL untuk OBS Browser Source"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-white" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-white/70" />
                <span>Copy</span>
              </>
            )}
          </button>
          <a
            id="open-display-tab-link"
            href={displayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-blue-400 transition"
            title="Buka Layar Display di Tab Baru"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* RIGHT SECTION: Desktop Navigation Actions & User Pill */}
      <div id="user-actions-container" className="hidden md:flex items-center gap-2 sm:gap-2.5">
        {/* PWA Install Button (Desktop/Tablet) */}
        {canInstallPwa && (
          <button
            id="btn-install-pwa-desktop"
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/40 hover:to-teal-600/40 text-emerald-300 border border-emerald-500/40 text-xs font-bold rounded-xl transition min-h-[36px] touch-manipulation shadow-md shadow-emerald-950/40 active:scale-95 animate-pulse"
            title="Install PentasLirik ke Desktop / Laptop"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Install App</span>
          </button>
        )}

        {/* Team Management Button (For Org Admins) */}
        {isOrgAdmin && onOpenTeamManagement && (
          <button
            id="btn-team-management"
            onClick={onOpenTeamManagement}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/25 text-xs font-semibold rounded-xl transition min-h-[36px] touch-manipulation active:scale-95 shadow-sm"
            title="Kelola Tim & Undangan Organisasi"
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Kelola Tim</span>
          </button>
        )}

        {/* Super Admin Server Portal */}
        {user.role === 'admin' && onOpenSuperAdmin && (
          <button
            id="btn-super-admin-portal"
            onClick={onOpenSuperAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 text-xs font-semibold rounded-xl transition min-h-[36px] touch-manipulation active:scale-95 shadow-sm"
            title="Portal Super Administrator Server"
          >
            <Server className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden xl:inline">Server Audit</span>
          </button>
        )}

        {/* Global Admin User Management Button */}
        {user.role === 'admin' && (
          <button
            id="admin-user-mgmt-btn"
            onClick={onOpenUserManagement}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-purple-300 text-xs font-semibold rounded-xl transition min-h-[36px] touch-manipulation active:scale-95 shadow-sm"
            title="Kelola Pengguna & Hak Akses"
          >
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden xl:inline">Users</span>
          </button>
        )}

        {/* Display Overlay Styler Button */}
        <button
          id="display-settings-btn"
          onClick={onOpenDisplaySettings}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/25 text-xs font-semibold rounded-xl transition min-h-[36px] touch-manipulation active:scale-95 shadow-sm"
          title="Kustomisasi Font, Warna, & Preset OBS Overlay"
        >
          <Sliders className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden xl:inline">Display Style</span>
          <span className="xl:hidden">Style</span>
        </button>

        {/* User Profile Chip (Clickable to open User Profile & Password modal) */}
        <div
          id="user-info"
          onClick={onOpenUserProfile}
          className="flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 px-2.5 py-1 rounded-xl text-xs cursor-pointer transition"
          title="Buka Profil & Ganti Password"
        >
          <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-300 font-bold text-[11px] shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col text-left max-w-[90px] xl:max-w-[130px] truncate">
            <span id="user-name-display" className="font-semibold text-white/90 truncate leading-tight">
              {user.name}
            </span>
            <span
              id="user-role-badge"
              className={`text-[9px] font-extrabold uppercase tracking-wider leading-none ${
                user.role === 'admin' ? 'text-amber-400' : 'text-blue-400'
              }`}
            >
              {user.role}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          id="logout-btn"
          onClick={onLogout}
          className="flex items-center justify-center p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-xl transition min-w-[36px] min-h-[36px] touch-manipulation active:scale-95"
          title="Keluar dari Akun"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="sr-only">Logout</span>
        </button>
      </div>

      {/* RIGHT SECTION: Mobile Header Controls */}
      <div className="flex md:hidden items-center gap-1.5">
        {/* Quick PWA Install on Mobile Header */}
        {canInstallPwa && (
          <button
            id="btn-install-pwa-mobile-top"
            onClick={handleInstallClick}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 active:scale-95 transition touch-manipulation shadow-sm"
            title="Install PentasLirik ke Layar Utama"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Install</span>
          </button>
        )}

        {/* Mobile Hamburger Toggle Button */}
        <button
          id="mobile-menu-toggle-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/10 active:bg-white/15 border border-white/10 text-white transition touch-manipulation active:scale-95"
          aria-label="Buka Menu Navigasi"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5 text-indigo-400" />
          ) : (
            <Menu className="w-5 h-5 text-slate-200" />
          )}
        </button>
      </div>

      {/* MOBILE SLIDE-OUT DRAWER (Rendered via React Portal to Document Body) */}
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
              className="fixed inset-y-0 right-0 sm:left-0 w-80 max-w-[85vw] h-full bg-[#121212] border-l sm:border-r sm:border-l-0 border-slate-800 p-5 pt-8 sm:pt-6 pt-safe z-[101] shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right sm:slide-in-from-left duration-200"
            >
              <div className="space-y-5">
                {/* Drawer Top Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${
                        liveStateActive ? 'bg-red-600 animate-pulse' : 'bg-indigo-600'
                      }`}
                    >
                      <Radio className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white font-display leading-tight">
                        Pentas<span className="text-blue-400">Lirik</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">Mobile Stage Center</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition active:scale-95"
                    aria-label="Tutup menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Organization Switcher Card */}
                {onOpenOrgSwitcher && (
                  <div
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenOrgSwitcher();
                    }}
                    className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-amber-500/15 transition shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase font-bold text-amber-400/80">Organisasi Aktif</div>
                        <div className="text-xs font-bold text-white truncate">
                          {currentOrganization?.name || 'PentasLirik Main'}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-amber-300 font-semibold shrink-0">Ganti</span>
                  </div>
                )}

                {/* User Profile Card */}
                <div
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenUserProfile && onOpenUserProfile();
                  }}
                  className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-2xl p-3.5 flex items-center justify-between shadow-inner cursor-pointer transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-sm shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{user.name}</div>
                      <div className="text-[11px] text-slate-400 capitalize">{user.role} Account</div>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      user.role === 'admin'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>

                {/* PWA Install Drawer Button */}
                {canInstallPwa && (
                  <button
                    id="btn-install-pwa-drawer"
                    onClick={handleInstallClick}
                    className="w-full flex items-center justify-center gap-2.5 p-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-950/50 transition active:scale-98"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install Aplikasi ke Perangkat</span>
                  </button>
                )}

                {/* Navigation Links */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 px-2 pb-1">
                    Navigasi Layar
                  </div>

                  <button
                    id="nav-drawer-link-live"
                    onClick={() => handleNavClick('live')}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-sm transition min-h-[48px] touch-manipulation ${
                      activeMobileTab === 'live'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Zap className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>Live Control Panel</span>
                  </button>

                  <button
                    id="nav-drawer-link-setlist"
                    onClick={() => handleNavClick('setlist')}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-sm transition min-h-[48px] touch-manipulation ${
                      activeMobileTab === 'setlist'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <ListMusic className="w-5 h-5 text-indigo-400 shrink-0" />
                    <span>Setlist Rundown</span>
                  </button>

                  <button
                    id="nav-drawer-link-pustaka-lagu"
                    onClick={() => handleNavClick('library')}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-sm transition min-h-[48px] touch-manipulation ${
                      activeMobileTab === 'library'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Music className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>Pustaka Lagu</span>
                  </button>
                </div>

                {/* System Action Links */}
                <div className="space-y-1.5 pt-3 border-t border-white/10">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 px-2 pb-1">
                    Manajemen & Pengaturan
                  </div>

                  {isOrgAdmin && onOpenTeamManagement && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenTeamManagement();
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm text-slate-300 hover:bg-white/5 hover:text-white transition min-h-[48px] touch-manipulation"
                    >
                      <Users className="w-5 h-5 text-indigo-400 shrink-0" />
                      <span>Kelola Tim & Undangan</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenDisplaySettings();
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm text-slate-300 hover:bg-white/5 hover:text-white transition min-h-[48px] touch-manipulation"
                  >
                    <Sliders className="w-5 h-5 text-blue-400 shrink-0" />
                    <span>Display Overlay Style</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenUserProfile && onOpenUserProfile();
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm text-slate-300 hover:bg-white/5 hover:text-white transition min-h-[48px] touch-manipulation"
                  >
                    <UserIcon className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>Profil & Ganti Password</span>
                  </button>

                  {user.role === 'admin' && onOpenSuperAdmin && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenSuperAdmin();
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm text-slate-300 hover:bg-white/5 hover:text-white transition min-h-[48px] touch-manipulation"
                    >
                      <Server className="w-5 h-5 text-rose-400 shrink-0" />
                      <span>Portal Super Administrator</span>
                    </button>
                  )}

                  {/* OBS URL Copy Widget for Mobile */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 space-y-2 mt-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                        <Monitor className="w-4 h-4 text-blue-400" /> OBS Browser Source
                      </span>
                      <a
                        href={displayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline flex items-center gap-1 font-medium"
                      >
                        Buka <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={displayUrl}
                        className="bg-black/50 text-blue-300 mono text-xs px-3 py-2 rounded-xl border border-white/10 w-full truncate select-all"
                      />
                      <button
                        onClick={handleCopyDisplayUrl}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-bold shrink-0 min-h-[38px] flex items-center gap-1 transition active:scale-95 shadow-md shadow-blue-950/50"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logout Footer */}
              <div className="pt-4 pb-safe border-t border-white/10 mt-6">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 text-rose-300 border border-rose-500/20 rounded-xl font-bold text-sm transition min-h-[48px] touch-manipulation active:scale-98"
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
