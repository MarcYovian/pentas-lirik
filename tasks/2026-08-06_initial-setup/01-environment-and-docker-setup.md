# TASK-01: Docker Environment & Reverse Proxy Setup ✅ [SELESAI]

## 🎯 Goal
Menyiapkan konfigurasi containerization menggunakan Laravel Sail (Docker PHP 8.4, MySQL, Redis) dan Nginx Reverse Proxy untuk seluruh ekosistem PentasLirik.

## 📄 Blueprint References
- [ARCHITECTURE.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/ARCHITECTURE.md) - Section: Deployment Strategy & High-Level Architecture Diagram
- [PRD.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/PRD.md) - Section: Deployment & Tech Stack

## 📁 Target Files
- `backend/compose.yaml` (Laravel Sail composition)
- `docker/nginx/nginx.conf`
- `frontend/Dockerfile`
- `.env.example`

## 📝 Detailed Requirements
1. **Laravel Sail Docker Stack (`backend/compose.yaml`):**
   - Service `laravel.test` (PHP 8.4 / Laravel 13).
   - Service `mysql` (MySQL 8.4 container).
   - Service `redis` (Redis container).
   - Expose Reverb Port 8080.
2. **Reverse Proxy Configuration (Nginx):**
   - Proxy `/api/*` ke backend container Sail (Port 80).
   - Proxy `/ws` & `/app` WebSocket upgrade requests ke Laravel Reverb (Port 8080).
   - Proxy `/` ke Frontend React App (Port 5173).

## ✅ Acceptance Criteria
- [x] `./vendor/bin/sail up -d` menjalankan stack backend (Laravel, MySQL, Redis) di dalam container.
- [x] Nginx `docker/nginx/nginx.conf` mengarahkan traffic API dan WebSocket ke container Sail dengan lancar.
