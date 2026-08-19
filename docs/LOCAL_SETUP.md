# Panduan Penggunaan & Setup di Komputer Lokal (Local Venue Guide)

Dokumen ini berisi panduan lengkap instalasi, pengoperasian panggung (*live stage*), jaringan lokal Wi-Fi (LAN), serta prosedur sinkronisasi data dari Cloud VPS ke Komputer Lokal untuk **PentasLirik**.

---

## 📋 1. Persyaratan Sistem (Prerequisites)

PentasLirik berjalan **100% di dalam kontainer Docker**, sehingga Anda **TIDAK PERLU** menginstal PHP, Composer, Node.js, atau MySQL secara native di komputer host.

* **Sistem Operasi**: Windows 10/11 (dengan WSL 2), macOS (Apple Silicon / Intel), atau Linux (Ubuntu/Debian/Fedora).
* **Software Wajib**:
  * [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows / macOS) atau Docker Engine + Docker Compose Plugin (Linux).
  * [Git](https://git-scm.com/).
* **Spesifikasi Minimal**: 2 Cores CPU, 4 GB RAM, 5 GB ruang disk kosong.

---

## 🚀 2. Langkah Instalasi Pertama Kali (Initial Setup)

### **Langkah 2.1: Clone Repositori**
Buka Terminal (Linux/macOS) atau PowerShell (Windows), lalu jalankan:

```bash
# 1. Clone repository dari GitHub
git clone https://github.com/MarcYovian/pentas-lirik.git

# 2. Masuk ke direktori repositori
cd pentas-lirik
```

---

### **Langkah 2.2: Buat File Konfigurasi Environment (`.env`)**
Salin file konfigurasi template `.env.example`:

```bash
# Linux / macOS / Git Bash:
cp backend/.env.example backend/.env

# Windows PowerShell:
copy backend\.env.example backend\.env
```

> 💡 **Catatan**: Nilai bawaan pada `.env.example` sudah disesuaikan untuk lingkungan lokal (`APP_URL=http://localhost`, `REVERB_HOST=localhost`, port `80`), sehingga Anda dapat langsung melanjutkan tanpa perlu mengubah file `.env`.

---

### **Langkah 2.3: Nyalakan Kontainer Docker Lokal**
Jalankan seluruh layanan aplikasi lokal (Frontend React, Backend Laravel API, WebSocket Reverb, MySQL 8.4, Redis, dan Nginx Gateway):

```bash
docker compose up -d --build frontend backend mysql redis nginx
```
*(Tunggu beberapa menit hingga proses build dan download image Docker selesai).*

---

### **Langkah 2.4: Inisialisasi Database & Generate Key**
Jalankan perintah inisialisasi Laravel langsung di dalam container `backend`:

```bash
# 1. Generate Application Key (Kunci Enkripsi)
docker compose exec backend php artisan key:generate

# 2. Jalankan Migrasi Database & Seeder Data Awal (Akun & Lagu Contoh)
docker compose exec backend php artisan migrate:fresh --seed
```

---

## 🌐 3. Akses Aplikasi & Akun Default

Setelah instalasi selesai, buka browser Anda:

| Layanan | URL Browser | Keterangan |
| :--- | :--- | :--- |
| **Dashboard Operator** | [http://localhost](http://localhost) | Antarmuka kontrol lirik live, pustaka lagu & rundown |
| **Overlay Layar OBS Studio** | [http://localhost/display](http://localhost/display) | Tampilan transparan untuk Browser Source OBS Studio |

### **Akun Login Bawaan (Default Seeders)**:
* 👤 **Admin**: `admin@pentaslirik.local` | Password: `password`
* 👤 **Operator**: `operator@pentaslirik.local` | Password: `password`

---

## 📱 4. Penggunaan di Panggung & Jaringan Lokal (Wi-Fi / LAN)

Anda dapat mengontrol PentasLirik dari **iPad / Tablet Android / HP Operator** yang terhubung ke jaringan Wi-Fi lokal yang sama tanpa memerlukan koneksi internet:

```mermaid
graph TD
    subgraph Host Komputer Lokal (Laptop Operator / OBS PC)
        Docker["Docker Stack PentasLirik<br/>(IP: 192.168.1.50:80)"]
        OBS["OBS Studio Browser Source<br/>(http://localhost/display)"]
        Docker --> OBS
    end

    subgraph Perangkat Panggung (Wi-Fi LAN)
        Tablet["iPad / Tablet Operator<br/>(http://192.168.1.50)"]
        HP["Smartphone Vocalist / WL<br/>(http://192.168.1.50)"]
    end

    Tablet -- Wi-Fi Local Control --> Docker
    HP -- Wi-Fi View --> Docker
```

### **Langkah Akses Multi-Device di Jaringan Lokal**:
1. Cari alamat IP lokal komputer Anda:
   * **Windows**: Jalankan `ipconfig` di PowerShell (lihat `IPv4 Address`, misal: `192.168.1.50`).
   * **macOS / Linux**: Jalankan `ifconfig` atau `ip a` (misal: `192.168.1.50`).
2. Buka browser di iPad/Tablet/HP yang terhubung ke Wi-Fi yang sama, lalu akses:
   ```
   http://192.168.1.50
   ```
3. Login menggunakan akun operator. Anda kini dapat memindahkan bait lirik langsung dari tablet!

---

## ☁️ 5. Sinkronisasi Data dari Cloud VPS ke Komputer Lokal (Hybrid Mode)

Jika Anda mempersiapkan lirik lagu dan rundown acara di server VPS online, Anda dapat menarik (*sync*) seluruh data ke komputer lokal venue hanya dengan 1 klik:

1. Buka dashboard lokal di [http://localhost](http://localhost).
2. Di kolom **Pustaka Lagu**, klik tombol **"Tarik Data VPS (Sync)"**.
3. Masukkan:
   * **URL Server VPS**: misal `https://lyrics.domainanda.com`
   * **Email & Password Akun VPS** (atau menggunakan API Token).
4. Centang cakupan data yang ingin disinkronkan:
   * ☑️ **Pustaka Lagu & Bait Lirik**
   * ☑️ **Rundown Acara (Setlists)**
   * ☑️ **Preset Styling Tampilan OBS**
5. Pilih strategi konflik:
   * *Lewati yang Sudah Ada (Skip)*: Menjaga lagu lokal yang sudah ada.
   * *Timpa yang Sudah Ada (Overwrite)*: Memperbarui isi lirik lokal sesuai data VPS.
6. Klik **Mulai Sinkronisasi**. Dalam beberapa detik seluruh data di komputer lokal Anda akan sama persis dengan server cloud!

---

## 📦 6. Memperbarui Kode Aplikasi (Update Code from GitHub)

Jika ada pembaruan fitur atau bugfix di repositori GitHub:

```bash
cd /path/ke/pentas-lirik

# 1. Tarik kode terbaru
git pull origin main

# 2. Rebuild container Frontend & Backend
docker compose up -d --build frontend backend

# 3. Jalankan migrasi database (jika ada struktur tabel baru)
docker compose exec backend php artisan migrate --force
```

> 💡 **Informasi**: Data lagu, setlist, dan akun lokal Anda **TIDAK AKAN HILANG** saat update kode karena tersimpan aman di Docker Volume (`sail-mysql`).

---

## 🛠️ 7. Perintah Pemeliharaan Harian (Daily Maintenance)

```bash
# Menyalakan seluruh stack PentasLirik
docker compose up -d frontend backend mysql redis nginx

# Menghentikan aplikasi sementara (tanpa menghapus data)
docker compose stop

# Menyalakan kembali aplikasi yang di-stop
docker compose start

# Mematikan seluruh kontainer
docker compose down

# Membersihkan cache aplikasi backend
docker compose exec backend php artisan optimize:clear

# Melihat status seluruh kontainer
docker compose ps
```

---

*Dokumen ini merupakan panduan resmi pengoperasian PentasLirik di lingkungan komputer lokal dan panggung live venue.*
