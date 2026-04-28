import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const email = user.email ?? "Pengguna";
  const currentHour = new Date().getHours();
  let greeting = "Selamat pagi";
  if (currentHour >= 12 && currentHour < 15) greeting = "Selamat siang";
  else if (currentHour >= 15 && currentHour < 18) greeting = "Selamat sore";
  else if (currentHour >= 18 || currentHour < 5) greeting = "Selamat malam";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar email={email} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <p className="text-sm text-gray-500 mb-1">{greeting} 👋</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Selamat datang, {email}
          </h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Pantau kebiasaan harianmu dan bangun rutinitas yang lebih baik.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200/60 p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-500">Kebiasaan Aktif</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-xs text-gray-400 mt-1">Belum ada kebiasaan</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/60 p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-500">Streak Terpanjang</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">0 <span className="text-sm font-normal text-gray-400">hari</span></p>
            <p className="text-xs text-gray-400 mt-1">Mulai streak-mu!</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/60 p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-500">Hari Ini</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">0<span className="text-sm font-normal text-gray-400">/0</span></p>
            <p className="text-xs text-gray-400 mt-1">Selesai hari ini</p>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-2xl border border-gray-200/60 p-8 sm:p-12 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 mb-5">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Belum ada kebiasaan
          </h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            Mulai perjalananmu dengan menambahkan kebiasaan pertama. Lacak
            progres harianmu dan bangun rutinitas yang konsisten.
          </p>
          <button
            id="add-habit-button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-medium transition-all duration-200 hover:bg-blue-600 shadow-sm shadow-blue-500/25 hover:shadow-md hover:shadow-blue-500/25"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Kebiasaan
          </button>
        </div>
      </main>
    </div>
  );
}
