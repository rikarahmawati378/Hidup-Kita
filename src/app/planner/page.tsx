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
    .select("id, nama, goal_besar_id")
    .eq("user_id", user.id)
    .order("nama", { ascending: true });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar email={user.email ?? "Pengguna"} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Planner
          </h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Rencanakan kegiatan harianmu dan kaitkan dengan langkah kecil (goal).
          </p>
        </div>
        <PlannerClient userId={user.id} goalKecilList={goalKecilList || []} />
      </main>
    </div>
  );
}
