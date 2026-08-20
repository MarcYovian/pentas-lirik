import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Users,
  UserPlus,
  Copy,
  Check,
  RefreshCw,
  Shield,
  UserCheck,
  Clock,
  Trash2,
  AlertCircle,
  Sparkles,
  Link as LinkIcon,
  Ticket,
} from 'lucide-react';
import { Organization, OrganizationMember } from '../types';

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization;
  authToken: string;
  onOrganizationUpdated?: (updatedOrg: Organization) => void;
}

export const TeamManagementModal: React.FC<TeamManagementModalProps> = ({
  isOpen,
  onClose,
  organization,
  authToken,
  onOrganizationUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'add'>('members');
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [inviteCode, setInviteCode] = useState<string>(organization.invite_code || '');
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Add Member Form
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addRole, setAddRole] = useState<'ADMIN' | 'OPERATOR'>('OPERATOR');
  const [addLoading, setAddLoading] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/v1/organizations/${organization.id}/members`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const json = await res.json();
      if (res.ok) {
        setMembers(json.data || []);
        setPendingCount(json.pending_count || 0);
        if (json.invite_code) {
          setInviteCode(json.invite_code);
        }
      } else {
        setActionError(json.message || 'Gagal memuat daftar anggota.');
      }
    } catch (err) {
      setActionError('Kesalahan koneksi jaringan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen, organization.id]);

  if (!isOpen) return null;

  const inviteLink = typeof window !== 'undefined' ? `${window.location.origin}/login?invite=${inviteCode}` : '';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleRegenerateInvite = async () => {
    if (!confirm('Apakah Anda yakin ingin membuat kode undangan baru? Kode lama tidak akan bisa dipakai lagi.')) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/organizations/${organization.id}/regenerate-invite`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const json = await res.json();
      if (res.ok) {
        setInviteCode(json.invite_code);
        setActionSuccess('Kode undangan baru berhasil dibuat!');
        if (onOrganizationUpdated) {
          onOrganizationUpdated({ ...organization, invite_code: json.invite_code });
        }
        setTimeout(() => setActionSuccess(null), 3000);
      } else {
        setActionError(json.message || 'Gagal memperbarui kode undangan.');
      }
    } catch (err) {
      setActionError('Terjadi kesalahan jaringan.');
    }
  };

  const handleUpdateMemberStatus = async (userId: number, newStatus: 'ACTIVE' | 'INACTIVE') => {
    try {
      const res = await fetch(`/api/v1/organizations/${organization.id}/members/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      if (res.ok) {
        setActionSuccess(`Status anggota berhasil diperbarui ke ${newStatus}.`);
        fetchMembers();
        setTimeout(() => setActionSuccess(null), 3000);
      } else {
        setActionError(json.message || 'Gagal mengubah status anggota.');
      }
    } catch (err) {
      setActionError('Terjadi kesalahan jaringan.');
    }
  };

  const handleUpdateMemberRole = async (userId: number, newRole: 'ADMIN' | 'OPERATOR') => {
    try {
      const res = await fetch(`/api/v1/organizations/${organization.id}/members/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      const json = await res.json();
      if (res.ok) {
        setActionSuccess(`Role anggota berhasil diubah menjadi ${newRole}.`);
        fetchMembers();
        setTimeout(() => setActionSuccess(null), 3000);
      } else {
        setActionError(json.message || 'Gagal mengubah role anggota.');
      }
    } catch (err) {
      setActionError('Terjadi kesalahan jaringan.');
    }
  };

  const handleRemoveMember = async (userId: number, userName: string) => {
    if (!confirm(`Hapus ${userName} dari organisasi ini?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/organizations/${organization.id}/members/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const json = await res.json();
      if (res.ok) {
        setActionSuccess(`Anggota ${userName} berhasil dihapus.`);
        fetchMembers();
        setTimeout(() => setActionSuccess(null), 3000);
      } else {
        setActionError(json.message || 'Gagal menghapus anggota.');
      }
    } catch (err) {
      setActionError('Terjadi kesalahan jaringan.');
    }
  };

  const handleDirectAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/v1/organizations/${organization.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: addName,
          email: addEmail,
          password: addPassword,
          role: addRole,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setActionSuccess(`Akun ${addName} berhasil ditambahkan dan langsung aktif!`);
        setAddName('');
        setAddEmail('');
        setAddPassword('');
        setActiveTab('members');
        fetchMembers();
        setTimeout(() => setActionSuccess(null), 3000);
      } else {
        setActionError(json.message || 'Gagal menambahkan anggota baru.');
      }
    } catch (err) {
      setActionError('Terjadi kesalahan jaringan.');
    } finally {
      setAddLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div
        className="bg-[#141414] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Manajemen Tim & Anggota</h2>
              <p className="text-xs text-white/50">{organization.name}</p>
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

        {/* Invite Code Bar */}
        <div className="p-4 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-transparent border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider block">
              Kode Undangan Organisasi (Invite Code)
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono font-black text-lg text-white tracking-widest bg-black/40 px-3 py-1 rounded-lg border border-white/10">
                {inviteCode || 'PL-XXXXXX'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyCode}
              className="h-9 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 transition"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Disalin!' : 'Salin Kode'}</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="h-9 px-3 bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/40 rounded-lg text-xs font-semibold text-indigo-300 flex items-center gap-1.5 transition"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <LinkIcon className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Disalin!' : 'Salin Link'}</span>
            </button>
            <button
              onClick={handleRegenerateInvite}
              title="Buat ulang kode undangan"
              className="w-9 h-9 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/50 hover:text-white flex items-center justify-center transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 bg-white/[0.01]">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'members'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Daftar Anggota</span>
            {pendingCount > 0 && (
              <span className="bg-amber-500 text-black text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'add'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Anggota Langsung</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {actionError && (
            <div className="p-3 bg-red-950/60 border border-red-500/40 text-red-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{actionError}</span>
            </div>
          )}
          {actionSuccess && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-3">
              {loading && (
                <div className="py-8 text-center text-xs text-white/40">Memuat anggota tim...</div>
              )}

              {!loading && members.length === 0 && (
                <div className="py-8 text-center text-xs text-white/40">Belum ada anggota.</div>
              )}

              {!loading &&
                members.map((member) => {
                  const role = member.pivot?.role || 'OPERATOR';
                  const status = member.pivot?.status || 'ACTIVE';
                  const isPending = status === 'PENDING';
                  const isInactive = status === 'INACTIVE';

                  return (
                    <div
                      key={member.id}
                      className={`p-3 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                        isPending
                          ? 'bg-amber-950/20 border-amber-500/40 ring-1 ring-amber-500/20'
                          : isInactive
                          ? 'bg-red-950/10 border-white/5 opacity-60'
                          : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold text-xs text-white shrink-0">
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white truncate">{member.name}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                role === 'ADMIN'
                                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                                  : 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                              }`}
                            >
                              {role}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isPending
                                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                                  : isInactive
                                  ? 'bg-red-500/20 border-red-500/40 text-red-300'
                                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              }`}
                            >
                              {status}
                            </span>
                          </div>
                          <span className="text-xs text-white/40 block truncate">{member.email}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                        {isPending ? (
                          <>
                            <button
                              onClick={() => handleUpdateMemberStatus(member.id, 'ACTIVE')}
                              className="h-8 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm transition"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Setujui</span>
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member.id, member.name)}
                              className="h-8 px-3 bg-red-600/30 hover:bg-red-600/50 text-red-300 text-xs font-bold rounded-lg flex items-center gap-1 transition"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Tolak</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateMemberRole(member.id, role === 'ADMIN' ? 'OPERATOR' : 'ADMIN')
                              }
                              className="h-8 px-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-[11px] font-semibold rounded-lg transition"
                              title={`Ubah role menjadi ${role === 'ADMIN' ? 'OPERATOR' : 'ADMIN'}`}
                            >
                              Role: {role === 'ADMIN' ? 'Operator' : 'Admin'}
                            </button>

                            <button
                              onClick={() =>
                                handleUpdateMemberStatus(member.id, isInactive ? 'ACTIVE' : 'INACTIVE')
                              }
                              className={`h-8 px-2.5 border text-[11px] font-semibold rounded-lg transition ${
                                isInactive
                                  ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30'
                                  : 'bg-amber-600/20 border-amber-500/40 text-amber-300 hover:bg-amber-600/30'
                              }`}
                              title={isInactive ? 'Aktifkan Akun' : 'Nonaktifkan Akun'}
                            >
                              {isInactive ? 'Aktifkan' : 'Nonaktifkan'}
                            </button>

                            <button
                              onClick={() => handleRemoveMember(member.id, member.name)}
                              className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                              title="Hapus Anggota"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {activeTab === 'add' && (
            <form onSubmit={handleDirectAddMember} className="space-y-4">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300/90 leading-relaxed flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  Anggota yang ditambahkan secara langsung oleh Admin akan berstatus **ACTIVE** seketika tanpa perlu melewati antrean approval.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full bg-[#0F0F0F] border border-white/10 focus:border-indigo-500/50 text-white text-xs px-3.5 py-3 rounded-xl outline-none transition"
                  placeholder="Nama Lengkap Operator"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5">Alamat Email</label>
                <input
                  type="email"
                  required
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  className="w-full bg-[#0F0F0F] border border-white/10 focus:border-indigo-500/50 text-white text-xs px-3.5 py-3 rounded-xl outline-none transition"
                  placeholder="operator@domain.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5">Password Sementara</label>
                <input
                  type="password"
                  required
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  className="w-full bg-[#0F0F0F] border border-white/10 focus:border-indigo-500/50 text-white text-xs px-3.5 py-3 rounded-xl outline-none transition"
                  placeholder="Minimal 6 karakter"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5">Role / Wewenang</label>
                <select
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value as 'ADMIN' | 'OPERATOR')}
                  className="w-full bg-[#0F0F0F] border border-white/10 focus:border-indigo-500/50 text-white text-xs px-3.5 py-3 rounded-xl outline-none transition"
                >
                  <option value="OPERATOR">OPERATOR (Kontrol Live & Rundown)</option>
                  <option value="ADMIN">ADMIN (Kelola Anggota & Konfigurasi)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={addLoading}
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{addLoading ? 'Menambahkan...' : 'Tambah Anggota Sekarang'}</span>
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
