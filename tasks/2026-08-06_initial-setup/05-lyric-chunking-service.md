# TASK-05: Lyric Chunking Parser Service ✅ [SELESAI]

## 🎯 Goal
Mengimplementasikan service backend untuk memparsing teks lirik mentah yang memuat tag pembatas (seperti `[VERSE 1]`, `[CHORUS]`) menjadi record `LyricChunk` yang terstruktur.

## 📄 Blueprint References
- [PRD.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/PRD.md) - Section: FR-03 Song & Lyric Management
- [FEATURES.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/FEATURES.md) - Section: Content Management Chunking Rules

## 📁 Target Files
- `backend/app/Services/LyricParserService.php`
- `backend/tests/Unit/LyricParserServiceTest.php`

## 📝 Detailed Requirements
1. **Parsing Rules Implementation:**
   - Input: String teks lirik mentah multi-line.
   - Aturan Pembagian (Chunking):
     - Baris yang diawali dan diakhiri dengan tanda kurung siku (e.g. `[VERSE 1]`, `[CHORUS]`, `[BRIDGE]`) dianggap sebagai `label` chunk.
     - Seluruh baris lirik di bawah label tersebut sampai sebelum label berikutnya (atau akhir teks) dianggap sebagai `content` chunk.
     - Label sendiri (`[LABEL]`) digunakan sebagai nama/tombol di UI Operator, tetapi isi teks lirik di bawahnya yang dikirim ke OBS display.
   - Edge Cases Handling:
     - Teks tanpa tag `[LABEL]` sama sekali: Seluruh teks lirik dianggap sebagai 1 chunk tunggal dengan label default `[LYRICS]`.
     - Teks kosong: Mengembalikan array kosong.
     - Tag berturut-turut tanpa isi lirik: Diabaikan atau diberi warning validation.
2. **Automated Unit Testing:**
   - Buat unit test PHPUnit/Pest di `tests/Unit/LyricParserServiceTest.php` untuk memverifikasi parser terhadap berbagai variasi format lirik mentah.

## ✅ Acceptance Criteria
- [x] Service `LyricParserService` berhasil menguraikan teks lirik mentah menjadi struktur data `label`, `content`, dan `order`.
- [x] Method `parseAndSync(Song $song, string $raw)` berhasil menyinkronkan data chunk di database secara transactional.
- [x] Semua unit test (`LyricParserServiceTest`) lari dan bernilai pass (5 tests passed, 22 assertions).
