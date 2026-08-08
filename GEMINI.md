# PentasLirik - AI Agent Context & Rules

## 1. Deskripsi Proyek & Arsitektur
- **Deskripsi Singkat**: PentasLirik adalah sistem kontrol dan penayangan lirik lagu real-time berlatensi rendah untuk panggung live performance dan live streaming overlay (OBS Studio). Sistem memisahkan antara Dashboard Operator (Desktop/Mobile) dan Overlay Tampilan (OBS) yang disinkronkan melalui WebSockets.
- **Tech Stack & Environment Utama (Docker Native)**:
  - **Environment**: Seluruh alur pengembangan (*development*) dan *production* berjalan **sepenuhnya di dalam container Docker** via `docker-compose.yml`. Tidak ada binary `php`, `composer`, atau `node` yang diasumsikan terpasang di host OS.
  - **Backend**: Laravel 13.x (PHP 8.4 via Docker `php:8.4-cli-alpine`), Supervisor, Laravel Sanctum (Multi-device Auth), Laravel Reverb (WebSockets).
  - **Database & Cache**: **MySQL 8.4** (`pentas_lirik_mysql`) dan **Redis Alpine** (`pentas_lirik_redis`).
  - **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS v4, Framer Motion (`motion`), Lucide React.
  - **Reverse Proxy & Gateway**: **Nginx Alpine** (Port 80) & **Cloudflare Tunnel** (`cloudflared`).
  - **Testing**: PHPUnit 12.x (Backend di dalam container), Playwright (Frontend E2E).

---

## 2. Struktur Kontainer & Direktori Utama

### **Layanan Docker (`docker-compose.yml`)**
1. `backend` (`pentas_lirik_backend`): Laravel 13 API & Reverb WebSocket Server (Port 8080).
2. `mysql` (`pentas_lirik_mysql`): Database MySQL 8.4 (`sail-mysql`).
3. `redis` (`pentas_lirik_redis`): Redis Cache & Live Display State (`sail-redis`).
4. `frontend` (`pentas_lirik_frontend`): Production Build React SPA (Nginx).
5. `nginx` (`pentas_lirik_nginx`): Gateway Reverse Proxy (Port 80).
6. `cloudflared` (`pentas_lirik_cloudflared`): Cloudflare Tunnel Connector.

### **Struktur Direktori Repositori**
```
├── backend/                  # Application Engine (Laravel 13 API & Reverb Docker Container)
│   ├── app/                  # Controllers (Api/V1), Models, Events, Services
│   │   ├── Events/           # DisplayUpdateEvent, DisplayClearEvent, dll.
│   │   ├── Http/Controllers/ # REST API Controllers
│   │   ├── Models/           # Song, LyricChunk, Setlist, SetlistItem, DisplaySetting, User
│   │   └── Services/         # LyricParserService
│   ├── config/               # Sanctum, Reverb, & App Configuration
│   ├── database/             # Migrations, Seeders, Factories (MySQL 8.4)
│   ├── routes/               # api.php, web.php, channels.php
│   ├── Dockerfile            # Multi-stage PHP 8.4 CLI Alpine + Supervisor
│   └── tests/                # PHPUnit Test Suite
├── frontend/                 # Operator Dashboard & OBS Display Overlay (React 19)
│   ├── src/                  # React Source Code
│   │   ├── components/       # LiveControlPanel, OBSDisplay, SongLibrary, Navbar, dll.
│   │   │   ├── mobile/       # MobileStepper, SetlistQuickDrawer, MobileStanzaCard
│   │   │   └── settings/     # DisplaySettingsPanel, MiniOBSPreview, PresetSelector
│   │   ├── hooks/            # Custom React Hooks (useDisplaySettings, dll.)
│   │   ├── services/         # Client API Services
│   │   ├── types.ts          # Type Definitions (Song, Setlist, LiveState, dll.)
│   │   └── utils/            # Helper & Styling Utilities (styleUtils.ts)
│   ├── Dockerfile            # Multi-stage Node 22 Build -> Nginx Alpine
│   ├── e2e/                  # Playwright End-to-End Tests
│   └── server.ts             # Express Server & WebSocket Server Bridge
├── docker/                   # Konfigurasi Nginx Reverse Proxy Gateway
│   └── nginx/nginx.conf
├── docs/                     # Dokumentasi Fitur & Arsitektur Blueprints
│   └── feature/              # Feature History (2026-08-06 .. 2026-08-08)
├── tasks/                    # Pelacakan Task & PRD Milestones
└── docker-compose.yml        # Multi-container Docker Orchestration
```

---

## 3. Aturan Mutlak & Batasan (Guardrails)
- **Aturan Eksekusi Perintah (Docker Only)**:
  - DILARANG menjalankan perintah `php`, `composer`, `artisan`, `npm` secara langsung di host OS. Selalu eksekusi perintah melalui Docker Compose (misal: `docker compose exec backend php artisan ...`).
- **Aturan Keamanan**:
  - DILARANG MEMBACA, MENGUBAH, ATAU MEMAPARKAN file `.env`, `.env.example`, `.env.local`, atau kunci rahasia (*API keys* / database credentials).
  - DILARANG merusak alur autentikasi token Sanctum atau membatalkan session token pengguna lain secara tidak sengaja (pertahankan arsitektur *multi-device auth*).
- **Batasan Tampilan & Operasional Live**:
  - DILARANG mengubah skema payload WebSocket (`display:update`, `display:clear`, `INIT_STATE`) tanpa memperbarui backend ([Events](backend/app/Events)) dan frontend ([OBSDisplay.tsx](frontend/src/components/OBSDisplay.tsx)) secara simultan. Tampilan OBS DILARANG mengalami *blank flash* saat reload.
  - Minta persetujuan pengguna sebelum menambahkan paket dependensi baru di `composer.json` atau `package.json`.
  - Lakukan perubahan dalam skala kecil (*atomic changes*), selalu periksa ketersediaan tipe data sebelum menulis fungsi baru.

---

## 4. Konvensi Koding & Gaya Bahasa
- **Penamaan**:
  - `PascalCase` untuk Komponen React (`LiveControlPanel.tsx`), Class PHP, dan Interface TypeScript.
  - `camelCase` untuk fungsi, variabel JS/TS, dan kunci properti JSON API.
  - `snake_case` untuk nama kolom database MySQL Laravel, relasi Eloquent, dan endpoint route (`lyric_chunk_id`, `event_date`).
- **Kualitas Kode**:
  - Utamakan *Strict Type Safety* di TypeScript (hindari penggunaan `any`).
  - Patuhi standar PSR-12 / Laravel Pint pada backend PHP.
  - Pertahankan pemisahan logika bisnis (Gunakan `Services` seperti `LyricParserService` daripada menumpuk logika di Controller).

---

## 5. Metodologi Eksekusi Tugas (PRAR Workflow)
Setiap kali menyelesaikan tugas atau fitur baru di PentasLirik, jalankan siklus berikut:

1. **Perceive (Pahami)**: Periksa `docs/feature/` dan kode terkait di `backend/` serta `frontend/`.
2. **Reason (Rencanakan)**: Analisis dampak perubahan pada REST API, WebSocket payload, dan komponen UI.
3. **Act (Eksekusi)**: Tulis/ubah kode secara bertahap mulai dari Tipe/Model -> Controller/Service -> Frontend Component.
4. **Refine (Verifikasi)**: Jalankan PHPUnit test dan Linter via `docker compose exec` untuk memastikan tidak ada eror regresi.

---

## 6. Perintah Penting (Commands via Docker)

### **Docker Infrastructure**
- **Menjalankan Seluruh Environment**: `docker compose up -d`
- **Melihat Log Seluruh Container**: `docker compose logs -f`
- **Menghentikan Environment**: `docker compose down`

### **Backend (Laravel 13 di dalam Container `backend`)**
- **Jalankan Artisan Command**: `docker compose exec backend php artisan [command]`
- **Menjalankan Database Migration**: `docker compose exec backend php artisan migrate`
- **Menjalankan Test (PHPUnit)**: `docker compose exec backend php artisan test`
- **Code Formatter (Pint)**: `docker compose exec backend ./vendor/bin/pint`

### **Frontend (React / Node di dalam Container `frontend`)**
- **Linter & Type Check**: `docker compose exec frontend npm run lint`
- **Run E2E Tests (Playwright)**: `docker compose exec frontend npm run test:e2e`

---

## 7. Protokol Pembelajaran (Learning Protocol)
Jika terjadi bug, error runtime WebSocket, atau pengujian gagal saat pengembangan:
- Catat akar masalah, perubahan skema, dan solusinya ke dalam berkas `LEARNINGS.gemini.md`.
- Rujuk `LEARNINGS.gemini.md` sebelum mengerjakan fitur serupa di masa mendatang.
