# 🎤 PentasLirik

> **Sistem Kontrol & Penayangan Lirik Lagu Real-Time Berlatensi Rendah untuk Panggung Live Performance & Overlay Live Streaming (OBS Studio).**

![PentasLirik Banner](https://img.shields.io/badge/Laravel-13.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-100%25_Offline_Cache-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)

---

## 📑 Daftar Isi

- [✨ Fitur Utama](#-fitur-utama)
- [🌐 Penggunaan: Mode Online vs Mode Offline](#-penggunaan-mode-online-vs-mode-offline)
  - [1. Mode Online (Cloud VPS / Internet)](#1-mode-online-cloud-vps--internet)
  - [2. Mode Offline (PWA di Laptop / Tablet)](#2-mode-offline-pwa-di-laptop--tablet)
  - [3. Mode Panggung Mandiri (Local Docker / LAN Wi-Fi)](#3-mode-panggung-mandiri-local-docker--lan-wi-fi)
- [🚀 Panduan Memulai Cepat (Quick Start Docker)](#-panduan-memulai-cepat-quick-start-docker)
- [📱 Pengoperasian di Panggung (Wi-Fi LAN Multi-Device)](#-pengoperasian-di-panggung-wi-fi-lan-multi-device)
- [☁️ Sinkronisasi Hybrid (Cloud VPS ke Laptop Panggung)](#️-sinkronisasi-hybrid-cloud-vps-ke-laptop-panggung)
- [⌨️ Keyboard Shortcuts & Emergency Controls](#️-keyboard-shortcuts--emergency-controls)
- [🛠️ Default Akun Login](#️-default-akun-login)
- [📚 Dokumentasi Teknis](#-dokumentasi-teknis)

---

## ✨ Fitur Utama

- 🏢 **Multi-Tenancy & Organisasi Mandiri**: Isolasi pustaka lagu, rundown setlist, dan preset styling untuk masing-masing gereja/komunitas/tim. Dilengkapi *Invite Code*, *Approval Queue*, dan *Starter Pack*.
- ⚡ **Real-Time WebSocket Sync (< 50ms)**: Sinkronisasi instan antara Dashboard Operator dan Layar OBS Studio menggunakan Laravel Reverb & Redis.
- 🎨 **OBS Display Customizer**: Kustomisasi font, ukuran, warna teks, background box transparan, padding, dan preset profil display khusus per-organisasi (`/display?org=slug`).
- 📶 **PWA & 100% Offline Cache (IndexedDB)**: Tetap dapat dibuka dan dioperasikan saat koneksi internet panggung tiba-tiba terputus.
- 📱 **Mobile-First Operator UI**: Tampilan responsif khusus tablet/smartphone dengan *Thumb Stepper Bar* dan *Quick Drawer*.
- 🔄 **Hybrid VPS-to-Local Sync**: Menarik seluruh lagu, rundown, dan preset dari server cloud ke laptop lokal hanya dengan 1 klik.
- 🛡️ **Keamanan Berlapis**: Proteksi Anti-IDOR, Anti-Privilege Escalation, sanitasi XSS/SQLi, dan multi-device authentication (Sanctum).

---

## 🌐 Penggunaan: Mode Online vs Mode Offline

PentasLirik dirancang fleksibel untuk mendukung 3 skenario operasional:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ARSITEKTUR OPERASIONAL                           │
├────────────────────────────────┬────────────────────────────────────────────┤
│ ☁️ ONLINE CLOUD                │ 📶 OFFLINE / LOCAL VENUE                   │
│ - Server VPS Online            │ - PWA Offline App (IndexedDB)              │
│ - Cloudflare Zero Trust Tunnel │ - Local Docker (Wi-Fi LAN Panggung)        │
│ - Akses tim dari mana saja     │ - Mandiri tanpa butuh akses internet       │
└────────────────────────────────┴────────────────────────────────────────────┘
```

---

### 1. Mode Online (Cloud VPS / Internet)
**Cocok untuk:** Tim multimedia yang ingin mempersiapkan lirik dari rumah, live streaming multi-lokasi, atau kolaborasi tim.

* **Cara Kerja**: Aplikasi di-deploy di server Cloud VPS menggunakan Docker + Cloudflare Tunnel.
* **Keuntungan**:
  * Operator bisa login dari laptop/HP di mana saja via domain (misal `https://lyrics.gereja.org`).
  * Layar OBS Studio di gereja/studio cukup memasukkan URL Browser Source `https://lyrics.gereja.org/display?org=nama-tim`.

---

### 2. Mode Offline (PWA di Laptop / Tablet)
**Cocok untuk:** Operator panggung / Worship Leader di tempat yang **tidak memiliki koneksi internet**.

* **Cara Kerja**:
  1. Saat komputer/laptop masih terhubung ke internet (misal saat persiapan), buka website PentasLirik di Chrome atau Edge.
  2. Klik tombol hijau **"Install App"** di pojok kanan atas Navbar.
  3. Aplikasi PentasLirik akan terpasang di Desktop / Start Menu.
  4. Seluruh lagu dan setlist **otomatis tersimpan ke database lokal (IndexedDB)**.
* **Saat di Panggung (Tanpa Internet)**:
  * Buka icon aplikasi PentasLirik di Desktop. Aplikasi akan terbuka seketika tanpa error jaringan.
  * Status di Navbar akan otomatis bertuliskan **`📶 Offline Cache`**.
  * Operator dapat menjalankan lirik lagu bait per bait secara offline dengan tombol Spasi atau klik layar.

---

### 3. Mode Panggung Mandiri (Local Docker / LAN Wi-Fi)
**Cocok untuk:** Ibadah/Konser live di gedung gereja tanpa internet, di mana **OBS Studio berjalan di laptop yang sama** dan **Operator ingin mengontrol dari iPad/HP via Wi-Fi lokal**.

* **Cara Kerja**:
  1. Pasang Docker Desktop di laptop gereja.
  2. Jalankan `docker compose up -d`.
  3. Hubungkan Laptop, iPad, dan HP ke router Wi-Fi lokal yang sama (tanpa perlu ada paket data/internet).
  4. Di OBS Studio: Tambahkan Browser Source `http://localhost/display`.
  5. Di iPad Operator: Buka browser ke `http://192.168.1.50` (IP lokal laptop).

---

## 🚀 Panduan Memulai Cepat (Quick Start Docker)

### **1. Clone Repositori**
```bash
git clone https://github.com/MarcYovian/pentas-lirik.git
cd pentas-lirik
```

### **2. Setup Environment**
```bash
# Salin konfigurasi environment
cp backend/.env.example backend/.env
```

### **3. Nyalakan Kontainer Docker**

**Untuk Mode Development (Lokal dengan Hot Reload / HMR):**
```bash
docker compose up -d --build
```

**Untuk Mode Production (Server VPS / Production Stack):**
```bash
# Pastikan network cloudflare_net sudah dibuat jika menggunakan global tunnel
docker network create cloudflare_net || true

# Jalankan production compose
docker compose -f docker-compose.prod.yml up -d --build
```

### **4. Inisialisasi Database**
```bash
# Generate key aplikasi Laravel
docker compose exec backend php artisan key:generate

# Migrasi tabel dan buat data awal
docker compose exec backend php artisan migrate:fresh --seed
```

### **5. Buka di Browser**
* **Dashboard Operator**: [http://localhost](http://localhost)
* **Overlay Display OBS Studio**: [http://localhost/display](http://localhost/display)

---

## 📱 Pengoperasian di Panggung (Wi-Fi LAN Multi-Device)

```mermaid
graph TD
    subgraph Laptop Multimedia / Host OBS (IP: 192.168.1.50)
        DockerStack["PentasLirik Local Stack<br/>(Port 80)"]
        OBS["OBS Studio Browser Source<br/>(http://localhost/display)"]
        DockerStack --> OBS
    end

    subgraph Perangkat Panggung via Wi-Fi Lokal
        Tablet["iPad / Tablet Operator<br/>(http://192.168.1.50)"]
        Smartphone["HP Worship Leader / Vocalist<br/>(http://192.168.1.50)"]
    end

    Tablet -. Kontrol Live .-> DockerStack
    Smartphone -. Monitor Lirik .-> DockerStack
```

1. Cari IP lokal komputer Anda:
   * **Windows**: Buka PowerShell, ketik `ipconfig` (lihat `IPv4 Address`, contoh `192.168.1.50`).
   * **macOS / Linux**: Buka Terminal, ketik `ifconfig` atau `ip a`.
2. Di iPad / Tablet / HP operator, buka browser dan akses `http://192.168.1.50`.
3. Login sebagai operator dan kontrol lirik dari mana saja di atas panggung!

---

## ☁️ Sinkronisasi Hybrid (Cloud VPS ke Laptop Panggung)

Jika Anda mempersiapkan lirik di Cloud VPS dan ingin membawanya ke laptop lokal venue:

1. Buka dashboard lokal di [http://localhost](http://localhost).
2. Di kolom **Pustaka Lagu**, klik tombol **"Tarik Data VPS (Sync)"**.
3. Masukkan URL server VPS (misal `https://lyrics.gereja.org`) dan akun login Anda.
4. Pilih data yang ingin disinkronkan (Lagu, Setlist Rundown, Preset OBS).
5. Klik **Mulai Sinkronisasi**. Dalam hitungan detik seluruh data lokal akan sama persis dengan server cloud!

---

## ⌨️ Keyboard Shortcuts & Emergency Controls

| Tombol / Tombol Pintas | Aksi |
| :--- | :--- |
| <kbd>Space</kbd> / <kbd>Enter</kbd> | Pindah ke bait lirik berikutnya (*Next Chunk*) |
| <kbd>Backspace</kbd> / <kbd>Esc</kbd> / <kbd>C</kbd> | **Kosongkan Layar Seketika (*Emergency Clear Screen*)** |
| <kbd>1</kbd> s/d <kbd>9</kbd> | Langsung tayangkan bait ke-1 hingga ke-9 lagu yang aktif |
| <kbd>Ctrl</kbd> + <kbd>F</kbd> | Fokus cepat ke kolom pencarian lagu |
| <kbd>Ctrl</kbd> + <kbd>N</kbd> | Buka modal tambah lagu baru |

---

## 🛠️ Default Akun Login

Setelah menjalankan `php artisan migrate:fresh --seed`, Anda dapat langsung masuk dengan akun:

| Role | Email | Password | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@pentaslirik.local` | `password` | Akses penuh, manajemen organisasi & anggota |
| **Operator** | `operator@pentaslirik.local` | `password` | Kontrol lirik live, pustaka lagu, rundown setlist |

---

## 📚 Dokumentasi Teknis

- 📖 **[Panduan Penggunaan Lokal & Panggung (LOCAL_SETUP.md)](./docs/LOCAL_SETUP.md)**
- 💻 **[Panduan Instalasi Native Tanpa Docker](./docs/MANUAL_LOCAL_SETUP_WITHOUT_DOCKER.md)**
- 🔒 **[Dokumentasi Multi-Tenancy & Arsitektur](./docs/feature/2026-08-20_multi-tenancy-and-team-management/ARCHITECTURE.md)**
- ☁️ **[Panduan Deployment Cloud VPS (DEPLOYMENT.md)](./docs/feature/2026-08-06_initial-setup/DEPLOYMENT.md)**

---

## 📄 Lisensi

Proyek ini dirilis di bawah lisensi [MIT License](LICENSE).
