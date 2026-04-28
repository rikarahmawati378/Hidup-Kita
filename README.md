<<<<<<< HEAD
# HidupKita — Habit Tracker

Aplikasi habit tracker minimalis yang dibangun dengan **Next.js 14** (App Router), **Supabase Auth**, dan **Tailwind CSS**. Siap deploy ke **Netlify**.

## ✨ Fitur

- 🔐 Autentikasi email/password via Supabase
- 🛡️ Middleware proteksi rute (redirect otomatis ke login)
- 📊 Dashboard dengan greeting & statistik
- 🎯 **Manajemen Goal**: Tambah, pantau, dan hapus Goal Besar beserta langkah-langkah Goal Kecil
- 📅 **Planner Harian**: Jadwalkan kegiatan harian, tagging dengan Goal Kecil
- ✅ **Check-in Hari Ini**: Pantau rencana hari ini, tandai Selesai, atau Ganti rencana (Reality Checker), dengan notifikasi EXP otomatis
- 👫 **Duo Dashboard**: Pantau progress EXP dan Level gabungan dari seluruh goal Anda dan juga Pasangan di satu tempat.
- 📱 **Mobile-First Navigation**: Bottom Tab Bar khusus untuk HP agar navigasi lebih jempol-friendly.
- 🎨 UI minimalis terinspirasi Notion/Linear
- 📱 Responsif (mobile-friendly)
- 🚀 Siap deploy ke Netlify

## 🛠️ Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| Next.js 14 | Framework React (App Router) |
| Supabase | Autentikasi & Database |
| Tailwind CSS | Styling |
| @supabase/ssr | Manajemen session (cookie-based) |
| @netlify/plugin-nextjs | Deploy ke Netlify |

## 🚀 Cara Memulai

### 1. Clone & Install

```bash
git clone <repo-url>
cd hidup-kita
npm install
```

### 2. Setup Environment Variables

Salin file `.env.local.example` menjadi `.env.local` dan isi dengan kredensial Supabase Anda:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Setup Supabase

Pastikan Anda sudah:
1. Membuat project di [supabase.com](https://supabase.com)
2. Mengaktifkan **Email Auth** di Authentication > Providers
3. Membuat user di Authentication > Users (atau via Sign Up)

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📁 Struktur Proyek

```
src/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout (Inter font, metadata)
│   ├── page.tsx             # Root redirect to /dashboard
│   ├── dashboard/
│   │   ├── page.tsx         # Halaman Duo Dashboard (Server)
│   │   └── DashboardClient.tsx # Komponen Progress Visual (Client)
│   ├── login/
│   │   ├── layout.tsx       # Login metadata
│   │   └── page.tsx         # Login form
│   └── goals/
│       ├── page.tsx         # Halaman Daftar Goal Besar (Server)
│       ├── GoalsList.tsx    # List Goal Besar (Client)
│       └── [id]/
│           ├── page.tsx     # Halaman Detail Goal (Server)
│           └── GoalKecilList.tsx # List Goal Kecil (Client)
│   ├── planner/
│   │   ├── page.tsx         # Halaman Planner (Server)
│   │   └── PlannerClient.tsx # Komponen Interaktif Planner (Client)
│       ├── today/
│       ├── page.tsx         # Halaman Hari Ini (Server)
│       └── TodayClient.tsx  # Komponen Check-in Hari Ini (Client)
├── components/
│   ├── Navbar.tsx           # Navbar Desktop
│   ├── BottomNav.tsx        # Navigasi Mobile (Bottom Tab)
│   ├── LayoutWrapper.tsx    # Wrapper layout untuk padding mobile
│   └── Toast.tsx            # (Opsional) Notifikasi EXP
├── middleware.ts            # Auth middleware
└── utils/
    └── supabase/
        ├── client.ts        # Browser Supabase client
        ├── server.ts        # Server Supabase client
        └── middleware.ts    # Middleware session helper
```

## 🌐 Deploy ke Netlify

1. Push kode ke GitHub/GitLab
2. Hubungkan repo di [Netlify](https://app.netlify.com)
3. Tambahkan environment variables di Netlify dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy otomatis!

Konfigurasi build sudah ada di `netlify.toml`.

## 📝 Lisensi

MIT
=======
# Hidup-Kita
Aplikasi Manajemen Hidup Suami Istri
>>>>>>> 15c1b3c29a5c7d236ec4875b265301c801e76856
