import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Building2,
  Check,
  Plus,
  Ticket,
  Shield,
  UserCheck,
  Clock,
  Music,
  ListMusic,
  Users,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { Organization } from '../types';

interface OrganizationSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizations: Organization[];
  currentOrganization: Organization | null;
  onSelectOrganization: (org: Organization) => void;
  onOrganizationCreated: (newOrg: Organization) => void;
  authToken: string;
}

export const OrganizationSwitcherModal: React.FC<OrganizationSwitcherModalProps> = ({
  isOpen,
  onClose,
  organizations,
  currentOrganization,
  onSelectOrganization,
  onOrganizationCreated,
  authToken,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'join'>('list');

  // Create Form State
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDesc, setNewOrgDesc] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Join Form State
  const [inviteCode, setInviteCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelect = (org: Organization) => {
    onSelectOrganization(org);
    onClose();
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateLoading(true);

    try {
      const res = await fetch('/api/v1/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: newOrgName,
          description: newOrgDesc,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setCreateError(json.message || 'Gagal membuat organisasi baru.');
        return;
      }

      onOrganizationCreated(json.data);
      onSelectOrganization(json.data);
      setNewOrgName('');
      setNewOrgDesc('');
      onClose();
    } catch (err) {
      setCreateError('Terjadi kesalahan jaringan.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    setJoinSuccess(null);
    setJoinLoading(true);

    try {
      const res = await fetch('/api/v1/organizations/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          invite_code: inviteCode,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setJoinError(json.message || 'Kode undangan tidak valid.');
        return;
      }

      setJoinSuccess(json.message || 'Permintaan bergabung berhasil dikirim ke Admin!');
      setInviteCode('');
      setTimeout(() => {
        setJoinSuccess(null);
        setActiveTab('list');
      }, 3000);
    } catch (err) {
      setJoinError('Terjadi kesalahan jaringan.');
    } finally {
      setJoinLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div
        className="bg-[#141414] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Organisasi & Komunitas</h2>
              <p className="text-xs text-white/50">
                Pilih atau beralih organisasi aktif untuk lirik dan panggung
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 bg-white/[0.01]">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-3 px-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'list'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Pilih Organisasi</span>
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-3 px-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'create'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Buat Baru</span>
          </button>
          <button
            onClick={() => setActiveTab('join')}
            className={`flex-1 py-3 px-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'join'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Gabung Tim</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'list' && (
            <div className="space-y-3">
              {organizations.map((org) => {
                const isActive = currentOrganization?.id === org.id;
                const role = org.pivot?.role || 'OPERATOR';
                const status = org.pivot?.status || 'ACTIVE';
                const isPending = status === 'PENDING';

                return (
                  <div
                    key={org.id}
                    onClick={() => !isPending && handleSelect(org)}
                    className={`p-3.5 sm:p-4 rounded-xl border transition flex items-center justify-between gap-3 ${
                      isPending
                        ? 'bg-amber-950/20 border-amber-500/30 opacity-75 cursor-not-allowed'
                        : isActive
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/30 cursor-default'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07] hover:border-white/20 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-inner ${
                          isActive
                            ? 'bg-gradient-to-tr from-amber-600 to-yellow-500 text-white'
                            : 'bg-white/10 text-white/70'
                        }`}
                      >
                        {org.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white truncate">{org.name}</h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              role === 'ADMIN'
                                ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                                : 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                            }`}
                          >
                            {role}
                          </span>
                        </div>
                        <p className="text-xs text-white/40 truncate">
                          {org.description || `Slug: ${org.slug}`}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Menunggu Approval</span>
                        </span>
                      ) : isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 rounded-lg shadow-sm">
                          <Check className="w-4 h-4" />
                          <span>Aktif</span>
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-white/50 group-hover:text-white flex items-center gap-1">
                          <span>Pilih</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'create' && (
            <form onSubmit={handleCreateOrg} className="space-y-4">
              {createError && (
                <div className="p-3 bg-red-950/60 border border-red-500/40 text-red-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{createError}</span>
                </div>
              )}

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300/90 leading-relaxed flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Organisasi baru akan otomatis diisi **Starter Pack** (3 Lagu Rohani + 1 Preset Layar OBS) agar siap langsung dipakai!
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5">
                  Nama Organisasi / Komunitas / Band
                </label>
                <input
                  type="text"
                  required
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full bg-[#0F0F0F] border border-white/10 focus:border-amber-500/50 text-white text-xs px-3.5 py-3 rounded-xl outline-none transition"
                  placeholder="Contoh: GBI Sukawarna / Acoustic Team"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5">
                  Deskripsi Singkat (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={newOrgDesc}
                  onChange={(e) => setNewOrgDesc(e.target.value)}
                  className="w-full bg-[#0F0F0F] border border-white/10 focus:border-amber-500/50 text-white text-xs p-3 rounded-xl outline-none transition resize-none"
                  placeholder="Keterangan singkat mengenai tim atau lokasi..."
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={createLoading}
                  className="w-full h-11 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{createLoading ? 'Membuat Organisasi...' : 'Buat Organisasi & Mulai'}</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'join' && (
            <form onSubmit={handleJoinOrg} className="space-y-4">
              {joinError && (
                <div className="p-3 bg-red-950/60 border border-red-500/40 text-red-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{joinError}</span>
                </div>
              )}
              {joinSuccess && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{joinSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5">
                  Kode Undangan Organisasi (Invite Code)
                </label>
                <div className="relative">
                  <Ticket className="w-4 h-4 text-white/30 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="w-full bg-[#0F0F0F] border border-white/10 focus:border-amber-500/50 text-white font-mono font-bold text-sm tracking-wider pl-10 pr-3.5 py-3 rounded-xl outline-none transition uppercase"
                    placeholder="PL-XXXXXX"
                  />
                </div>
                <p className="text-[11px] text-white/40 mt-1.5">
                  Dapatkan kode 8 karakter ini dari Admin gereja atau tim Anda.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={joinLoading || !inviteCode}
                  className="w-full h-11 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <Ticket className="w-4 h-4" />
                  <span>{joinLoading ? 'Memproses...' : 'Kirim Permintaan Bergabung'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
