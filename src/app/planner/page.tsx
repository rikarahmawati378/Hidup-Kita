import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import PlannerClient from "./PlannerClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planner — HidupKita",
  description: "Rencanakan kegiatan harianmu dan kaitkan dengan goal.",
};

export default async function PlannerPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all goal_kecil belonging to the user for the dropdown
  const { data: goalKecilList } = await supabase
    .from("goal_kecil")
    .select("id, nama, goal_besar_id, xp_per_kegiatan, goal_besar!inner(user_id)")
    .eq("goal_besar.user_id", user.id)
    .order("nama", { ascending: true });

  return (
    <div className="min-h-screen bg-garden-bg pb-20">
      <Navbar email={user.email ?? "Pengguna"} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-3xl sm:text-4xl font-black text-garden-brown tracking-tight">
            📝 Planner
          </h1>
          <p className="text-garden-brown-light mt-3 text-lg font-bold flex items-center gap-2">
            <span className="w-8 h-0.5 bg-garden-sage rounded-full"></span>
            Rancang harimu untuk mencapai impian besar.
          </p>
        </div>

        <PlannerClient userId={user.id} goalKecilList={goalKecilList || []} />
      </main>
    </div>
  );
}
