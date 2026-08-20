import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ShieldAlert,
  Building2,
  Users,
  Music,
  ListMusic,
  Server,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { ServerStats } from '../types';

interface SuperAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  authToken: string;
}

export const SuperAdminModal: React.FC<SuperAdminModalProps> = ({
  isOpen,
  onClose,
  authToken,
}) => {
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/super-admin/stats', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const json = await res.json();
      if (res.ok) {
        setStats(json.data);
      } else {
        setError(json.message || 'Hanya Super Admin yang dapat mengakses statistik server.');
      }
    } catch (err) {
      setError('Kesalahan koneksi jaringan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div
        className="bg-[#141414] border border-white/10 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Portal Super Administrator</h2>
              <p className="text-xs text-white/50">Audit & Statistik Global Server PentasLirik VPS</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchStats}
              title="Refresh Data"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-500/40 text-red-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {stats && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-amber-400">
                    <span className="text-xs font-semibold text-white/50">Organisasi</span>
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    {stats.summary.total_organizations}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-indigo-400">
                    <span className="text-xs font-semibold text-white/50">Total Pengguna</span>
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    {stats.summary.total_users}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-blue-400">
                    <span className="text-xs font-semibold text-white/50">Total Lagu</span>
                    <Music className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    {stats.summary.total_songs}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-purple-400">
                    <span className="text-xs font-semibold text-white/50">Total Rundown</span>
                    <ListMusic className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    {stats.summary.total_setlists}
                  </div>
                </div>
              </div>

              {/* Organization Directory Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider">
                  Direktori Seluruh Organisasi di Server
                </h3>
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/[0.04] text-white/50 uppercase text-[10px] font-bold tracking-wider border-b border-white/10">
                        <tr>
                          <th className="p-3">Nama Organisasi</th>
                          <th className="p-3">Slug</th>
                          <th className="p-3">Invite Code</th>
                          <th className="p-3 text-center">Anggota</th>
                          <th className="p-3 text-center">Lagu</th>
                          <th className="p-3 text-center">Rundown</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {stats.organizations.map((org) => (
                          <tr key={org.id} className="hover:bg-white/[0.02] transition">
                            <td className="p-3 font-semibold text-white">{org.name}</td>
                            <td className="p-3 font-mono text-white/50 text-[11px]">{org.slug}</td>
                            <td className="p-3 font-mono font-bold text-amber-400 text-[11px]">
                              {org.invite_code || '-'}
                            </td>
                            <td className="p-3 text-center text-white/70">{org.users_count ?? 0}</td>
                            <td className="p-3 text-center text-white/70">{org.songs_count ?? 0}</td>
                            <td className="p-3 text-center text-white/70">{org.setlists_count ?? 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
