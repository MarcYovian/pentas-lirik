# Panduan Instalasi Lokal Tanpa Docker (Native Host Setup)

Panduan ini menjelaskan cara menginstal dan menjalankan **PentasLirik** secara langsung (*native*) di komputer lokal (Windows, macOS, atau Linux) tanpa menggunakan Docker.

---

## 📋 1. Kebutuhan Software di Komputer Host

Sebelum memulai, pastikan software berikut sudah terpasang di komputer Anda:

1. **PHP 8.2 atau lebih baru** (disarankan **PHP 8.3 / 8.4**):
   - Pastikan ekstensi berikut aktif di `php.ini`:
     `pdo_mysql`, `pdo_sqlite`, `mbstring`, `openssl`, `bcmath`, `curl`, `ctype`, `fileinfo`, `json`, `tokenizer`, `xml`, `pcntl` (Linux/macOS).
2. **[Composer](https://getcomposer.org/)** (Package manager PHP).
3. **[Node.js](https://nodejs.org/) (v18, v20, atau v22)** dan **npm**.
4. **Database (Pilih salah satu)**:
   - **SQLite (Paling Mudah)**: Bawaan PHP, tidak perlu menginstal server database tambahan.
   - **MySQL / MariaDB**: Melalui [Laragon](https://laragon.org/) (Windows), [XAMPP](https://www.apachefriends.org/), atau MySQL Native.

---

## 🚀 2. Langkah Instalasi Langkah Demi Langkah

### **Langkah 1: Clone Repositori**
```bash
git clone https://github.com/MarcYovian/pentas-lirik.git
cd pentas-lirik
```

---

### **Langkah 2: Setup Backend (Laravel 13 API)**

1. Buka direktori backend:
   ```bash
   cd backend
   ```

2. Salin file konfigurasi environment:
   ```bash
   cp .env.example .env
   ```

3. Install dependensi PHP via Composer:
   ```bash
   composer install
   ```

4. Generate Application Key (Kunci Enkripsi):
   ```bash
   php artisan key:generate
   ```

5. **Konfigurasi Database di file `backend/.env`**:

   * **Opsi A: Menggunakan SQLite (Rekomendasi - Super Simpel & Cepat)**
     Buat file database kosong:
     ```bash
     # Linux / macOS / Git Bash:
     touch database/database.sqlite

     # Windows PowerShell:
     New-Item database\database.sqlite -ItemType File
     ```
     Lalu ubah baris database di `backend/.env`:
     ```dotenv
     DB_CONNECTION=sqlite
     # Kosongkan atau komentari DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD
     
     CACHE_STORE=file
     SESSION_DRIVER=file
     QUEUE_CONNECTION=sync

     # Konfigurasi WebSocket Reverb Lokal
     REVERB_APP_ID=pentaslirik
     REVERB_APP_KEY=pentaslirik_key
     REVERB_APP_SECRET=pentaslirik_secret
     REVERB_HOST=127.0.0.1
     REVERB_PORT=8080
     REVERB_SCHEME=http
     ```

   * **Opsi B: Menggunakan MySQL Lokal (Laragon / XAMPP / Native MySQL)**
     Buat database baru bernama `pentas_lirik` di phpMyAdmin / HeidiSQL, lalu sesuaikan `backend/.env`:
     ```dotenv
     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_DATABASE=pentas_lirik
     DB_USERNAME=root
     DB_PASSWORD=
     
     CACHE_STORE=file
     ```

6. Jalankan migrasi database dan buat data awal (Admin, lagu contoh, dll.):
   ```bash
   php artisan migrate:fresh --seed
   ```

---

### **Langkah 3: Setup Frontend (React 19 & Vite)**

1. Pindah ke direktori frontend:
   ```bash
   cd ../frontend
   ```

2. Install dependensi Node.js via npm:
   ```bash
   npm install
   ```

---

## 🏃 3. Menjalankan Aplikasi

Buka **3 jendela Terminal / Tab PowerShell terpisah**:

### **Terminal 1: Menjalankan Laravel API Server (Port 8000)**
```bash
cd backend
php artisan serve --port=8000
```

### **Terminal 2: Menjalankan WebSocket Server (Reverb) (Port 8080)**
```bash
cd backend
php artisan reverb:start --port=8080
```

### **Terminal 3: Menjalankan Frontend React Dashboard (Port 3000)**
```bash
cd frontend
npm run dev
```

---

## 🌐 4. Mengakses Aplikasi

Setelah ketiga proses berjalan:

| Layanan | URL Browser | Keterangan |
| :--- | :--- | :--- |
| **Dashboard Operator** | [http://localhost:3000](http://localhost:3000) | Kontrol lirik panggung, rundown acara, pustaka lagu |
| **Layar Overlay OBS Studio** | [http://localhost:3000/display](http://localhost:3000/display) | Browser Source transparan untuk OBS Studio |

### **Akun Login Bawaan**:
* **Admin**: `admin@pentaslirik.local` | Password: `password`
* **Operator**: `operator@pentaslirik.local` | Password: `password`

---

## 💡 Tips Praktis (Opsional): Menjalankan dengan 1 Perintah

Jika di Windows Anda menggunakan **Laragon**, Anda dapat langsung menekan tombol **"Start All"** di Laragon, lalu cukup jalankan `php artisan reverb:start` dan `npm run dev`.
