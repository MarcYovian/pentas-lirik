import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users, Trash2, ShieldCheck, UserCheck } from 'lucide-react';
import { User, UserRole } from '../types';

interface UserManagementModalProps {
  isOpen: boolean;
  currentUser: User;
  onClose: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  currentUser,
  onClose,
}) => {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states for creating new user
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('operator');

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('pentaslirik_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/users', {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (res.ok) {
        setUsersList(json.data || []);
      }
    } catch (err) {
      setError('Gagal memuat daftar pengguna');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch('/api/v1/users', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, email, password, role }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.message || 'Gagal membuat pengguna baru');
        return;
      }

      setName('');
      setEmail('');
      setPassword('');
      setRole('operator');
      fetchUsers();
    } catch (err) {
      setError('Terjadi kesalahan jaringan');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus akun pengguna ini?')) return;
    setError(null);

    try {
      const res = await fetch(`/api/v1/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || 'Gagal menghapus pengguna');
        return;
      }
      fetchUsers();
    } catch (err) {
      setError('Kesalahan saat menghapus pengguna');
    }
  };

  const handleUpdateRole = async (id: number, newRole: UserRole) => {
    try {
      const res = await fetch(`/api/v1/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      setError('Gagal memperbarui role pengguna');
    }
  };

  return (
    <div id="user-mgmt-overlay" className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div id="user-mgmt-modal" className="bg-[#121212] border border-white/10 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto">
        {/* Header */}
        <div className="px-4 md:px-6 py-4 bg-white/[0.02] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm md:text-base font-bold text-white font-display">Manajemen Pengguna (Admin)</h2>
          </div>
          <button
            id="close-user-mgmt-btn"
            onClick={onClose}
            className="text-white/40 hover:text-white transition p-2 rounded-xl hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-900/50 border border-red-500/50 text-red-200 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Create User Form */}
          <div className="bg-[#0F0F0F] border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-xs text-white uppercase tracking-wider font-display">
                Buat Akun Baru
              </h3>
            </div>

            <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                id="new-user-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Lengkap"
                className="bg-white/5 border border-white/10 text-white text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-blue-500/50 min-h-[42px]"
              />
              <input
                id="new-user-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Alamat Email (Login)"
                className="bg-white/5 border border-white/10 text-white text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-blue-500/50 min-h-[42px]"
              />
              <input
                id="new-user-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 karakter)"
                className="bg-white/5 border border-white/10 text-white text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-blue-500/50 min-h-[42px]"
              />
              <div className="flex items-center gap-2">
                <select
                  id="new-user-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="flex-1 bg-white/5 border border-white/10 text-white text-xs px-3 py-2.5 rounded-xl outline-none focus:border-blue-500/50 min-h-[42px]"
                >
                  <option value="operator" className="bg-[#121212] text-white">Role: Operator</option>
                  <option value="admin" className="bg-[#121212] text-white">Role: Admin</option>
                </select>
                <button
                  id="btn-submit-create-user"
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow transition min-h-[42px] touch-manipulation active:scale-95 shrink-0"
                >
                  Tambah
                </button>
              </div>
            </form>
          </div>

          {/* User List */}
          <div className="space-y-2.5">
            <h3 className="font-bold text-xs text-white/50 uppercase tracking-wider font-display">
              Daftar Akun Terdaftar ({usersList.length})
            </h3>

            {/* Mobile Card List View (< md) */}
            <div className="block md:hidden space-y-2">
              {usersList.map((u) => (
                <div key={u.id} className="p-3 bg-[#0F0F0F] border border-white/10 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-white">{u.name}</h4>
                      <p className="text-[11px] text-white/50">{u.email}</p>
                    </div>
                    {u.id !== currentUser.id && (
                      <button
                        id={`btn-delete-user-mobile-${u.id}`}
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-2 bg-red-950/40 text-red-300 hover:text-red-400 rounded-lg transition"
                        title="Hapus akun pengguna"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[10px] text-white/40 uppercase font-mono">Peran:</span>
                    <select
                      value={u.role}
                      disabled={u.id === currentUser.id}
                      onChange={(e) => handleUpdateRole(u.id, e.target.value as UserRole)}
                      className="bg-white/5 border border-white/10 text-white text-xs rounded-lg px-2 py-1 outline-none disabled:opacity-50"
                    >
                      <option value="operator" className="bg-[#121212] text-white">OPERATOR</option>
                      <option value="admin" className="bg-[#121212] text-white">ADMIN</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block bg-[#0F0F0F] border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/10 text-white/40 font-display">
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] text-white/80">
                      <td className="p-3.5 font-semibold text-white">{u.name}</td>
                      <td className="p-3.5 text-white/60">{u.email}</td>
                      <td className="p-3.5">
                        <select
                          value={u.role}
                          disabled={u.id === currentUser.id}
                          onChange={(e) => handleUpdateRole(u.id, e.target.value as UserRole)}
                          className="bg-white/5 border border-white/10 text-white text-xs rounded-lg px-2.5 py-1.5 outline-none disabled:opacity-50"
                        >
                          <option value="operator" className="bg-[#121212] text-white">OPERATOR</option>
                          <option value="admin" className="bg-[#121212] text-white">ADMIN</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-right">
                        {u.id !== currentUser.id && (
                          <button
                            id={`btn-delete-user-${u.id}`}
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                            title="Delete user account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
