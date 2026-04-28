"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export type GoalKecil = {
  id: string;
  goal_besar_id: string;
  user_id: string;
  nama: string;
};

export default function GoalKecilList({
  initialData,
  goalBesarId,
  userId,
}: {
  initialData: GoalKecil[];
  goalBesarId: string;
  userId: string;
}) {
  const [goals, setGoals] = useState(initialData);
  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("goal_kecil")
      .insert({ user_id: userId, goal_besar_id: goalBesarId, nama })
      .select()
      .single();

    if (!error && data) {
      setGoals([...goals, data]);
      setNama("");
      router.refresh();
    } else {
      console.error(error);
      alert("Gagal menambahkan goal kecil.");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus goal kecil ini?")) return;
    setGoals(goals.filter((g) => g.id !== id));
    await supabase.from("goal_kecil").delete().eq("id", id);
    router.refresh();
  };

  return (
    <div className="bg-white rounded-3xl border border-garden-sage/10 shadow-xl shadow-garden-sage/5 p-8">
      <h2 className="text-xl font-bold text-garden-brown mb-8 flex items-center gap-2">
        <span className="text-2xl">🌱</span>
        Langkah Kecil 🌿
      </h2>

      {/* Form Tambah Goal Kecil */}
      <form onSubmit={handleAdd} className="mb-10 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Tulis langkah kecil untuk mencapai goal ini..."
          required
          className="flex-1 px-5 py-3 rounded-2xl border border-garden-sage/30 bg-garden-sage-light/30 text-garden-brown text-sm focus:outline-none focus:ring-2 focus:ring-garden-sage/20 focus:border-garden-sage focus:bg-white transition-all shadow-inner"
        />
        <button
          type="submit"
          disabled={loading || !nama.trim()}
          className="px-8 py-3 rounded-2xl bg-garden-sage text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50 transition-all whitespace-nowrap shadow-md shadow-garden-sage/20 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? "Menambah..." : "Tambah Misi ✨"}
        </button>
      </form>

      {/* List Goal Kecil */}
      <div className="space-y-4">
        {goals.map((goal, index) => (
          <div
            key={goal.id}
            className="flex items-center justify-between p-5 rounded-2xl border border-garden-sage/5 bg-garden-sage-light/20 hover:bg-garden-sage-light/40 transition-all duration-300 group shadow-sm"
          >
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-garden-sage text-xs font-black shadow-sm border border-garden-sage/10">
                {index + 1}
              </span>
              <span className="text-garden-brown font-semibold text-sm sm:text-base">{goal.nama}</span>
            </div>
            <button
              onClick={() => handleDelete(goal.id)}
              className="p-2.5 text-garden-brown-light hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200"
              title="Hapus Misi"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        ))}

        {goals.length === 0 && (
          <div className="py-12 text-center bg-garden-sage-light/10 rounded-3xl border-2 border-dashed border-garden-sage/10">
            <div className="text-3xl mb-3">🍃</div>
            <p className="text-garden-brown-light text-sm font-medium">
              Belum ada misi kecil untuk goal ini. 
              <br/>Yuk buat satu!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
