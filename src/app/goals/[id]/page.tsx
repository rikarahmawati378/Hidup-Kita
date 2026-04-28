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
      <div className="min-h-screen bg-garden-bg flex items-center justify-center flex-col p-4 text-center">
        <div className="text-6xl mb-6">🏜️</div>
        <p className="text-garden-brown font-bold text-xl mb-4">Goal tidak ditemukan.</p>
        <Link
          href="/goals"
          className="text-garden-sage hover:text-green-700 font-bold text-sm bg-white px-6 py-3 rounded-2xl shadow-sm border border-garden-sage/10"
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
    <div className="min-h-screen bg-garden-bg pb-20">
      <Navbar email={user.email ?? "Pengguna"} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Link
          href="/goals"
          className="inline-flex items-center text-sm font-bold text-garden-brown-light hover:text-garden-sage transition-all mb-8 group"
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
              strokeWidth={3}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Kembali ke Daftar Goal
        </Link>

        {/* Header Goal Besar */}
        <div className="mb-10 bg-white p-8 sm:p-12 rounded-[2.5rem] border border-garden-sage/10 shadow-xl shadow-garden-sage/5 relative overflow-hidden border-b-8 border-b-garden-sage">
          {/* Decorative background element */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-garden-sage-light/50 rounded-full blur-3xl animate-pulse" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🌱</span>
              <h1 className="text-3xl sm:text-4xl font-black text-garden-brown tracking-tight">
                {goalBesar.nama}
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-4 mb-10">
              <span className="text-sm font-bold text-garden-brown-light">Target XP:</span>
              <span className="text-garden-sage bg-garden-sage-light px-4 py-1.5 rounded-full font-black text-sm border border-garden-sage/10 shadow-sm">
                {goalBesar.target_xp} ✨
              </span>
            </div>
            
            <div className="max-w-xl">
              <div className="flex justify-between text-xs font-black text-garden-brown-light mb-3 px-1 uppercase tracking-widest">
                <span>Total Progress</span>
                <span className="text-garden-sage">{goalBesar.progress || 0}% Selesai ✨</span>
              </div>
              <div className="w-full bg-garden-sage-light rounded-full h-4 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-garden-sage to-green-400 h-4 rounded-full transition-all duration-1000 ease-out relative"
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
