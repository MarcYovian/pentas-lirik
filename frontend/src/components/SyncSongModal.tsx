import React, { useState, useEffect } from 'react';
import {
  CloudDownload,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  Server,
  Key,
  Mail,
  SlidersHorizontal,
} from 'lucide-react';
import { apiClient } from '../utils/apiClient';

interface SyncSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncSuccess: () => void;
}

interface SyncStats {
  total_fetched: number;
  created: number;
  updated: number;
  skipped: number;
}

export const SyncSongModal: React.FC<SyncSongModalProps> = ({
  isOpen,
  onClose,
  onSyncSuccess,
}) => {
  const [remoteUrl, setRemoteUrl] = useState(() => {
    return localStorage.getItem('pentaslirik_sync_remote_url') || '';
  });
  const [authMode, setAuthMode] = useState<'login' | 'token'>(() => {
    return (localStorage.getItem('pentaslirik_sync_auth_mode') as 'login' | 'token') || 'login';
  });
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('pentaslirik_sync_email') || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [apiToken, setApiToken] = useState('');
  const [conflictStrategy, setConflictStrategy] = useState<'skip' | 'overwrite'>('skip');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSyncStats(null);
      setPassword('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSyncStats(null);

    const cleanUrl = remoteUrl.trim().replace(/\/+$/, '');
    if (!cleanUrl) {
      setErrorMessage('URL Remote VPS wajib diisi.');
      return;
    }

    if (authMode === 'login' && (!email.trim() || !password)) {
      setErrorMessage('Email dan password akun VPS wajib diisi.');
      return;
    }

    if (authMode === 'token' && !apiToken.trim()) {
      setErrorMessage('API Token wajib diisi.');
      return;
    }

    setIsLoading(true);

    try {
      // Save user preferences
      localStorage.setItem('pentaslirik_sync_remote_url', cleanUrl);
      localStorage.setItem('pentaslirik_sync_auth_mode', authMode);
      if (email.trim()) {
        localStorage.setItem('pentaslirik_sync_email', email.trim());
      }

      const payload: Record<string, string> = {
        remote_url: cleanUrl,
        conflict_strategy: conflictStrategy,
      };

      if (authMode === 'login') {
        payload.email = email.trim();
        payload.password = password;
      } else {
        payload.api_token = apiToken.trim();
      }

      const res = await apiClient.post<{
        message: string;
        data: SyncStats;
      }>('/api/v1/songs/sync-remote', payload);

      if (res.data) {
        setSyncStats(res.data);
        onSyncSuccess();
      } else {
        setErrorMessage('Terjadi kesalahan saat memproses data respon sinkronisasi.');
      }
    } catch (err: any) {
      console.error('Sync error:', err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Gagal melakukan sinkronisasi lagu dari VPS. Periksa URL dan koneksi Anda.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="modal-sync-songs-overlay"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div
        id="modal-sync-songs-container"
        className="bg-[#18181B] border border-white/15 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <CloudDownload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">
                Tarik Lagu dari VPS Cloud
              </h2>
              <p className="text-xs text-white/50">
                Sinkronkan pustaka lagu dari server PentasLirik VPS ke database lokal ini
              </p>
            </div>
          </div>
          <button
            id="btn-close-sync-modal"
            onClick={onClose}
            disabled={isLoading}
            className="text-white/40 hover:text-white p-2 hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSync} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Error Message Alert */}
          {errorMessage && (
            <div
              id="sync-error-banner"
              className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-red-300 text-xs animate-fade-in"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {/* Success Statistics Banner */}
          {syncStats && (
            <div
              id="sync-success-banner"
              className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-xl space-y-3 animate-fade-in"
            >
              <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Sinkronisasi Berhasil Selesai!</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                  <div className="text-[10px] text-white/50 uppercase">Total</div>
                  <div className="text-sm font-bold text-white mono">{syncStats.total_fetched}</div>
                </div>
                <div className="bg-black/30 p-2 rounded-lg border border-emerald-500/20">
                  <div className="text-[10px] text-emerald-400 uppercase">Baru</div>
                  <div className="text-sm font-bold text-emerald-300 mono">+{syncStats.created}</div>
                </div>
                <div className="bg-black/30 p-2 rounded-lg border border-blue-500/20">
                  <div className="text-[10px] text-blue-400 uppercase">Diperbarui</div>
                  <div className="text-sm font-bold text-blue-300 mono">~{syncStats.updated}</div>
                </div>
                <div className="bg-black/30 p-2 rounded-lg border border-amber-500/20">
                  <div className="text-[10px] text-amber-400 uppercase">Dilewati</div>
                  <div className="text-sm font-bold text-amber-300 mono">{syncStats.skipped}</div>
                </div>
              </div>
            </div>
          )}

          {/* Remote VPS URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-blue-400" />
              <span>URL Remote VPS PentasLirik</span>
            </label>
            <input
              id="input-sync-remote-url"
              type="url"
              required
              value={remoteUrl}
              onChange={(e) => setRemoteUrl(e.target.value)}
              placeholder="https://lirik.domain-anda.com"
              disabled={isLoading}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-blue-500 focus:bg-white/[0.08] outline-none transition mono"
            />
          </div>

          {/* Remote Authentication Section */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blue-400" />
                <span>Autentikasi Remote VPS</span>
              </label>
              <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/10 text-[11px]">
                <button
                  type="button"
                  id="tab-auth-login"
                  onClick={() => setAuthMode('login')}
                  className={`px-2.5 py-1 rounded-md transition font-medium ${
                    authMode === 'login'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  Email & Sandi
                </button>
                <button
                  type="button"
                  id="tab-auth-token"
                  onClick={() => setAuthMode('token')}
                  className={`px-2.5 py-1 rounded-md transition font-medium ${
                    authMode === 'token'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  API Token
                </button>
              </div>
            </div>

            {authMode === 'login' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <div className="space-y-1">
                  <span className="text-[10px] text-white/60 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-white/40" /> Email Akun VPS
                  </span>
                  <input
                    id="input-sync-email"
                    type="email"
                    required={authMode === 'login'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@pentaslirik.com"
                    disabled={isLoading}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white placeholder-white/30 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-white/60">Kata Sandi Akun VPS</span>
                  <div className="relative">
                    <input
                      id="input-sync-password"
                      type={showPassword ? 'text' : 'password'}
                      required={authMode === 'login'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={isLoading}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-2.5 pr-8 py-2 text-xs text-white placeholder-white/30 focus:border-blue-500 outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2 text-white/40 hover:text-white transition"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] text-white/60">Bearer API Token (Sanctum)</span>
                <input
                  id="input-sync-api-token"
                  type="text"
                  required={authMode === 'token'}
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  placeholder="1|abc123xyz..."
                  disabled={isLoading}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white placeholder-white/30 focus:border-blue-500 outline-none transition mono"
                />
              </div>
            )}
          </div>

          {/* Conflict Resolution Strategy */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
              <span>Jika Lagu Sudah Ada di Database Lokal</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div
                id="card-strategy-skip"
                onClick={() => !isLoading && setConflictStrategy('skip')}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-2.5 ${
                  conflictStrategy === 'skip'
                    ? 'bg-blue-600/20 border-blue-500/60 ring-1 ring-blue-500/30'
                    : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/10'
                }`}
              >
                <input
                  type="radio"
                  name="conflict_strategy"
                  checked={conflictStrategy === 'skip'}
                  onChange={() => setConflictStrategy('skip')}
                  className="mt-0.5 accent-blue-500"
                  disabled={isLoading}
                />
                <div>
                  <div className="text-xs font-bold text-white">Lewati (Skip)</div>
                  <div className="text-[10px] text-white/50 leading-tight mt-0.5">
                    Hanya tambahkan lagu baru. Lagu lokal yang sudah ada tidak akan diubah.
                  </div>
                </div>
              </div>

              <div
                id="card-strategy-overwrite"
                onClick={() => !isLoading && setConflictStrategy('overwrite')}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-2.5 ${
                  conflictStrategy === 'overwrite'
                    ? 'bg-blue-600/20 border-blue-500/60 ring-1 ring-blue-500/30'
                    : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/10'
                }`}
              >
                <input
                  type="radio"
                  name="conflict_strategy"
                  checked={conflictStrategy === 'overwrite'}
                  onChange={() => setConflictStrategy('overwrite')}
                  className="mt-0.5 accent-blue-500"
                  disabled={isLoading}
                />
                <div>
                  <div className="text-xs font-bold text-white">Timpa / Perbarui</div>
                  <div className="text-[10px] text-white/50 leading-tight mt-0.5">
                    Perbarui bait lirik lokal mengikuti versi terbaru dari VPS.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              id="btn-cancel-sync"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition"
            >
              Tutup
            </button>
            <button
              type="submit"
              id="btn-start-sync"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyinkronkan Data...</span>
                </>
              ) : (
                <>
                  <CloudDownload className="w-4 h-4" />
                  <span>Mulai Sinkronisasi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
