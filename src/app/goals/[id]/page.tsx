import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import GoalKecilList from "./GoalKecilList";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase
    .from("goal_besar")
    .select("nama")
    .eq("id", params.id)
    .single();

  return {
    title: `${data?.nama || "Detail Goal"} — HidupKita`,
  };
}

export default async function GoalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: goalBesar } = await supabase
    .from("goal_besar")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!goalBesar) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col">
        <p className="text-gray-500 mb-4">Goal tidak ditemukan.</p>
        <Link
          href="/goals"
          className="text-blue-500 hover:text-blue-600 font-medium text-sm"
        >
          &larr; Kembali ke Daftar Goal
        </Link>
      </div>
    );
  }

  // Fetch list of goal_kecil
  const { data: goalKecilList } = await supabase
    .from("goal_kecil")
    .select("*")
    .eq("goal_besar_id", params.id)
    .order("id", { ascending: true });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar email={user.email ?? "Pengguna"} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Link
          href="/goals"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mb-6 group"
        >
          <svg
            className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Kembali ke Daftar Goal
        </Link>

        {/* Header Goal Besar */}
        <div className="mb-8 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/60 shadow-sm relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-50 rounded-full blur-3xl" />
          
          <div className="relative">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {goalBesar.nama}
            </h1>
            <p className="text-gray-500 mt-2 font-medium text-sm">
              Target XP: <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{goalBesar.target_xp}</span>
            </p>
            
            <div className="mt-6 max-w-md">
              <div className="flex justify-between text-xs font-medium text-gray-600 mb-2">
                <span>Progress</span>
                <span className="text-blue-600">{goalBesar.progress || 0}% Selesai</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 relative"
                  style={{ width: `${goalBesar.progress || 0}%` }}
                >
                  <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 w-full h-full transform -skew-x-12 translate-x-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* List Goal Kecil */}
        <GoalKecilList
          initialData={goalKecilList || []}
          goalBesarId={params.id}
          userId={user.id}
        />
      </main>
    </div>
  );
}
