# Studio Film AI

Aplikasi web "Cinematic Series Director" untuk produksi film/seri dengan bantuan AI.

## Tech Stack

- Vite + React 18 + TypeScript
- Tailwind CSS
- Supabase (database)
- Lucide React (ikon)

## Menjalankan Lokal

```bash
npm install
npm run dev
```

Salin `.env.example` menjadi `.env` dan isi kredensial Supabase Anda.

## Database

Skema ada di `supabase/migrations/`. Jalankan file SQL tersebut secara berurutan di SQL Editor Supabase.

## Integrasi Bekal

Versi ini menggunakan penyimpanan lokal otomatis di IndexedDB jika konfigurasi Supabase tidak tersedia. Tidak perlu membuat `.env` untuk penggunaan lokal. Detail build, penyimpanan, batas browser dan pengujian ada di `../docs/FILM-STUDIO.md`.
