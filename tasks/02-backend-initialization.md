# TASK-02: Backend Initialization (Laravel 13 via Sail, Reverb, Redis) ✅ [SELESAI]

## 🎯 Goal
Menginisialisasi framework Laravel di folder `/backend` menggunakan Laravel Sail (Docker PHP 8.4), menginstal package dependency utama (Sanctum, Reverb, Redis, MySQL), serta mengonfigurasi koneksi database dan event broadcasting.

## 📄 Blueprint References
- [PRD.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/PRD.md) - Section: Technology Stack & Rationale
- [ARCHITECTURE.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/ARCHITECTURE.md) - Section: Backend API (Laravel 13 via Sail) & WebSocket Server

## 📁 Target Files
- `backend/composer.json`
- `backend/config/broadcasting.php`
- `backend/config/database.php`
- `backend/config/reverb.php`
- `backend/.env`

## 📝 Detailed Requirements & Executed Steps
1. **Laravel Installation via Sail:**
   ```bash
   curl -s https://laravel.build/backend | bash
   ```
2. **Laravel Sail Provisioning:**
   ```bash
   docker run --rm \
       -u "$(id -u):$(id -g)" \
       -v "$(pwd):/var/www/html" \
       -w /var/www/html \
       laravelsail/php84-composer:latest \
       composer require laravel/sail --dev

   docker run --rm \
       -u "$(id -u):$(id -g)" \
       -v "$(pwd):/var/www/html" \
       -w /var/www/html \
       laravelsail/php84-composer:latest \
       php artisan sail:install --with=mysql,redis
   ```
3. **Environment Startup & Reverb Installation:**
   ```bash
   ./vendor/bin/sail up -d
   ./vendor/bin/sail artisan migrate
   ./vendor/bin/sail composer require laravel/reverb
   ./vendor/bin/sail artisan reverb:install
   ./vendor/bin/sail artisan vendor:publish --tag=reverb-config
   ./vendor/bin/sail artisan reverb:start
   ```

## ✅ Acceptance Criteria
- [x] App Laravel 13 berjalan di dalam container Docker via `./vendor/bin/sail`.
- [x] Service Reverb terpasang dan dapat dijalankan via `./vendor/bin/sail artisan reverb:start`.
- [x] Backend terhubung ke service container MySQL dan Redis yang dikelola oleh Sail.
