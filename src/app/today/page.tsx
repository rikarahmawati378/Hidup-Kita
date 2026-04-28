import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import TodayClient from "./TodayClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hari Ini — HidupKita",
  description: "Check-in kegiatan harianmu hari ini.",
};

export default async function TodayPage() {
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
        <TodayClient userId={user.id} goalKecilList={goalKecilList || []} />
      </main>
    </div>
  );
}
