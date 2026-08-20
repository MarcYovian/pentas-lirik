# Product Requirements Document (PRD)
## Multi-Tenancy, Team Management & Self-Service Registration

- **Fitur**: Sistem Organisasi/Komunitas Multi-Tenant, Kode Undangan, Approval Queue, Profil Mandiri, dan Portal Super Admin.
- **Tanggal Rilis**: 2026-08-20
- **Versi**: v1.3.0

---

### 1. Latar Belakang & Masalah
Sebelumnya, PentasLirik hanya beroperasi dalam mode single-tenant global, di mana semua pustaka lagu dan rundown tergabung menjadi satu. Ketika digunakan oleh beberapa tim pelayanan, gereja cabang, atau komunitas berbeda di satu server VPS, data saling bercampur dan tidak ada pemisahan hak akses antar-tim.

---

### 2. Tujuan & Solusi
1. **Multi-Tenancy Penuh**: Setiap organisasi/komunitas memiliki pustaka lagu, rundown setlist, dan preset tampilan OBS yang terisolasi 100%.
2. **Self-Service Registration**: Pengguna baru dapat mendaftarkan organisasi baru secara mandiri dan langsung menjadi Admin aktif dengan *Starter Pack* lagu.
3. **Invite Code & Approval Queue**: Calon anggota dapat bergabung menggunakan kode undangan unik tim dan menunggu persetujuan Admin tim sebelum aktif.
4. **Self-Service Profile & Password**: Pengguna dapat mengubah nama, email, dan password sendiri.
5. **Super Admin Server Portal**: Pemilik server dapat memonitor statistik penggunaan global server dan direktori organisasi.
6. **Scoped OBS URLs**: Setiap organisasi memiliki link OBS Browser Source sendiri (`/display?org=slug`).
