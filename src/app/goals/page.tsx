import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import GoalsList from "./GoalsList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Goals — HidupKita",
  description: "Manajemen Goal Besar dan progress Anda.",
};

export default async function GoalsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch goal_besar for the user
  const { data: goals } = await supabase
    .from("goal_besar")
    .select("*")
    .eq("user_id", user.id)
    .order("id", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar email={user.email ?? "Pengguna"} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Daftar Goal
          </h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Kelola tujuan jangka panjang dan pantau progressmu.
          </p>
        </div>

        <GoalsList initialGoals={goals || []} userId={user.id} />
      </main>
    </div>
  );
}
