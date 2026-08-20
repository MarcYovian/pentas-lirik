import React, { useState, useEffect } from 'react';
import {
  Radio,
  Lock,
  Mail,
  LogIn,
  Shield,
  UserCheck,
  HardDrive,
  Cloud,
  Building2,
  Ticket,
  UserPlus,
  Sparkles,
  AlertCircle,
  Check,
} from 'lucide-react';
import { User } from '../types';
import { getEnvironmentInfo } from '../utils/envUtils';

interface LoginViewProps {
  onLoginSuccess: (user: User, token: string) => void;
  authError?: string | null;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, authError }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register_org' | 'register_invite'>('login');

  // Login Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register Org Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regOrgName, setRegOrgName] = useState('');

  // Register Join via Invite Code
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const envInfo = getEnvironmentInfo();

  // Auto-detect invite code from query param (?invite=... or ?code=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('invite') || params.get('code');
      if (code) {
        setInviteCode(code.toUpperCase());
        setActiveTab('register_invite');
      }
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const deviceName = typeof window !== 'undefined' ? window.navigator.userAgent : 'Web Browser';
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, device_name: deviceName }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.message || 'Email atau password tidak sesuai.');
        return;
      }

      onLoginSuccess(json.data.user, json.data.token);
    } catch (err) {
      setError('Kesalahan koneksi jaringan. Pastikan backend aktif.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const deviceName = typeof window !== 'undefined' ? window.navigator.userAgent : 'Web Browser';
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          organization_name: regOrgName,
          device_name: deviceName,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        const errorMsg = json.errors
          ? Object.values(json.errors).flat().join(' ')
          : json.message || 'Gagal mendaftarkan organisasi.';
        setError(errorMsg);
        return;
      }

      onLoginSuccess(json.data.user, json.data.token);
    } catch (err) {
      setError('Kesalahan koneksi jaringan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const deviceName = typeof window !== 'undefined' ? window.navigator.userAgent : 'Web Browser';
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inviteName,
          email: inviteEmail,
          password: invitePassword,
          invite_code: inviteCode.toUpperCase(),
          device_name: deviceName,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        const errorMsg = json.errors
          ? Object.values(json.errors).flat().join(' ')
          : json.message || 'Kode undangan tidak valid.';
        setError(errorMsg);
        return;
      }

      if (json.data?.status === 'PENDING') {
        setSuccessMsg(
          'Pendaftaran berhasil! Akun Anda sedang menunggu persetujuan (approval) dari Admin Organisasi sebelum dapat login aktif.'
        );
        setInviteName('');
        setInviteEmail('');
        setInvitePassword('');
      } else {
        onLoginSuccess(json.data.user, json.data.token);
      }
    } catch (err) {
      setError('Kesalahan koneksi jaringan.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setActiveTab('login');
  };

  const displayMessage = error || authError;

  return (
    <div id="login-container" className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4">
      <div id="login-card" className="bg-[#121212] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        {/* Header Logo */}
        <div className="p-6 pb-4 text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-inner mb-1">
            <Radio className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display font-black text-2xl text-white tracking-tight">PentasLirik</h1>
          <p className="text-xs text-white/40">
            Low-Latency Live Streaming Lyric Control System
          </p>
          <div className="pt-1 flex justify-center">
            <span
              id="login-env-badge"
              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full border ${
                envInfo.isLocal
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
              }`}
            >
              {envInfo.isLocal ? (
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span>{envInfo.label} ({envInfo.hostname})</span>
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 bg-white/[0.01] px-4">
          <button
            onClick={() => {
              setActiveTab('login');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1 border-b-2 transition ${
              activeTab === 'login'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Masuk</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('register_org');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1 border-b-2 transition ${
              activeTab === 'register_org'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Daftar Tim Baru</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('register_invite');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1 border-b-2 transition ${
              activeTab === 'register_invite'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Pakai Kode</span>
          </button>
        </div>

        <div className="p-6 pt-5 space-y-4">
          {displayMessage && (
            <div id="login-error-alert" className="p-3 bg-red-950/60 border border-red-500/40 text-red-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{displayMessage}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl flex items-start gap-2 leading-relaxed">
              <Check className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/30 absolute left-3 top-3" />
                  <input
                    id="login-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@pentaslirik.local"
                    className="w-full bg-[#0F0F0F] border border-white/10 focus:border-blue-500/50 text-white text-xs pl-9 pr-3 py-2.5 rounded-xl outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/30 absolute left-3 top-3" />
                  <input
                    id="login-password-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0F0F0F] border border-white/10 focus:border-blue-500/50 text-white text-xs pl-9 pr-3 py-2.5 rounded-xl outline-none transition"
                  />
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
              >
                <LogIn className="w-4 h-4" />
                <span>{isLoading ? 'Masuk...' : 'Masuk ke Dashboard'}</span>
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER NEW ORGANIZATION */}
          {activeTab === 'register_org' && (
            <form onSubmit={handleRegisterOrgSubmit} className="space-y-3.5">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300/90 leading-relaxed flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Membuat organisasi baru otomatis memberikan hak **ADMIN** dan **Starter Pack 3 Lagu + 1 Preset OBS** gratis!
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1">Nama Lengkap Anda</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Nama Lengkap"
                  className="w-full bg-[#0F0F0F] border border-white/10 focus:border-amber-500/50 text-white text-xs px-3 py-2.5 rounded-xl outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="admin@gereja.org"
                  className="w-full bg-[#0F0F0F] border border-white/10 focus:border-amber-500/50 text-white text-xs px-3 py-2.5 rounded-xl outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1">Nama Organisasi / Gereja / Band</label>
                <input
                  type="text"
                  required
                  value={regOrgName}
                  onChange={(e) => setRegOrgName(e.target.value)}
                  placeholder="Contoh: Kapel St. Yohanes"
                  className="w-full bg-[#0F0F0F] border border-white/10 focus:border-amber-500/50 text-white text-xs px-3 py-2.5 rounded-xl outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full bg-[#0F0F0F] border border-white/10 focus:border-amber-500/50 text-white text-xs px-3 py-2.5 rounded-xl outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
              >
                <Building2 className="w-4 h-4" />
                <span>{isLoading ? 'Mendaftarkan...' : 'Daftar Organisasi Baru'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: JOIN TEAM VIA INVITE CODE */}
          {activeTab === 'register_invite' && (
            <form onSubmit={handleRegisterInviteSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1">
                  Kode Undangan Organisasi (Invite Code)
                </label>
                <input
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="PL-XXXXXX"
                  className="w-full bg-[#0F0F0F] border border-white/10 focus:border-indigo-500/50 text-white font-mono font-bold text-sm tracking-wider px-3 py-2.5 rounded-xl outline-none transition uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Nama Lengkap Operator"
                  className="w-full bg-[#0F0F0F] border border-white/10 focus:border-indigo-500/50 text-white text-xs px-3 py-2.5 rounded-xl outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="operator@domain.com"
                  className="w-full bg-[#0F0F0F] border border-white/10 focus:border-indigo-500/50 text-white text-xs px-3 py-2.5 rounded-xl outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full bg-[#0F0F0F] border border-white/10 focus:border-indigo-500/50 text-white text-xs px-3 py-2.5 rounded-xl outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
              >
                <Ticket className="w-4 h-4" />
                <span>{isLoading ? 'Mendaftarkan...' : 'Gabung Tim Organisasi'}</span>
              </button>
            </form>
          )}

          {/* Quick Demo Credentials */}
          {activeTab === 'login' && (
            <div className="pt-3 border-t border-white/10 space-y-2">
              <span className="block text-[10px] text-white/40 uppercase font-bold tracking-wider text-center">
                Quick Demo Accounts (1-Click Fill)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-quick-admin"
                  type="button"
                  onClick={() => fillQuickCredentials('admin@pentaslirik.local', 'password')}
                  className="flex items-center justify-center gap-1.5 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-amber-300 font-medium transition"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Demo</span>
                </button>
                <button
                  id="btn-quick-operator"
                  type="button"
                  onClick={() => fillQuickCredentials('operator@pentaslirik.local', 'password')}
                  className="flex items-center justify-center gap-1.5 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-blue-300 font-medium transition"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Operator Demo</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
