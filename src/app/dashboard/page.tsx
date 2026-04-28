import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import DashboardClient from "./DashboardClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — HidupKita",
  description: "Pantau progress pencapaian Anda dan pasangan.",
};

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Find partner_id (Check both directions)
  const { data: p1 } = await supabase
    .from("partnership")
    .select("partner_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: p2 } = await supabase
    .from("partnership")
    .select("user_id")
    .eq("partner_id", user.id)
    .maybeSingle();

  const partnerId = p1?.partner_id || p2?.user_id || null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar email={user.email ?? "Pengguna"} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Pantau progress pencapaian Anda dan pasangan.
          </p>
        </div>
        <DashboardClient userId={user.id} partnerId={partnerId} />
      </main>
    </div>
  );
}
