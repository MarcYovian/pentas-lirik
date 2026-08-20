# PentasLirik - Engineering Learnings & Best Practices

Dokumen ini mencatat pembelajaran teknis, solusi bug, dan kaidah arsitektur sistem PentasLirik.

---

## 1. Multi-Container Docker & Nginx Reverse Proxy
- **Upstream DNS / IP Caching pada Nginx**:
  - Saat container frontend (`pentas_lirik_frontend`) di-recreate/rebuild via `docker compose up -d --build frontend`, Docker bridge network mengalokasikan internal IP baru.
  - Container `pentas_lirik_nginx` menyimpan cache IP container lama sehingga dapat mengembalikan error `502 Bad Gateway`.
  - **Solusi**: Selalu jalankan `docker compose restart nginx` setiap kali container backend atau frontend di-recreate.

---

## 2. Multi-Tenancy & Security Isolation
- **Explicit vs Implicit Tenant Scoping**:
  - Saat request API menyertakan `organization_id` di body atau header `X-Organization-Id`, backend WAJIB memvalidasi apakah pengguna yang login memiliki relasi aktif (`status = ACTIVE`) pada organisasi tersebut.
  - Jika tidak divalidasi, pengguna bisa menyuntikkan (*inject*) lagu/setlist ke organisasi lain (Cross-Tenant Data Tampering).
- **Public OBS Display Scoping**:
  - Tampilan overlay OBS tidak memerlukan autentikasi login (Browser Source di OBS Studio), tetapi memerlukan isolasi per-organisasi.
  - Gunakan query parameter slug: `/display?org=nama-organisasi`. Frontend OBSDisplay akan me-resolve slug via public endpoint `/api/v1/organizations/public/{slug}` untuk mengambil preset styling dan live state yang sesuai.
- **Pending/Inactive Account Restriction**:
  - Pengguna yang mendaftar melalui kode undangan berstatus `PENDING` sampai disetujui Admin.
  - Endpoint operasional live broadcast (`/api/v1/live/send-lyric` dan `/api/v1/live/clear`) wajib memblokir akun yang belum berstatus `ACTIVE` (`403 Forbidden`).

---

## 3. Real-Time State & WebSocket Synchronization
- **Redis State Cache**:
  - State live lirik disimpan di Redis `live_display_state` agar klien OBS yang baru dibuka atau di-reload langsung mendapatkan tampilan lirik terkini tanpa jeda.
- **Zero-Flicker Style Transitions**:
  - Konfigurasi tampilan OBS di-cache di `localStorage` (`obs_display_settings_<orgSlug>`) untuk memastikan tidak terjadi kedipan font atau warna saat browser source melakukan auto-refresh.
