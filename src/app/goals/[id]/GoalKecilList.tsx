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
    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <svg
          className="w-5 h-5 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        Daftar Goal Kecil
      </h2>

      {/* Form Tambah Goal Kecil */}
      <form onSubmit={handleAdd} className="mb-8 flex gap-3">
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Tulis langkah kecil untuk mencapai goal ini..."
          required
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !nama.trim()}
          className="px-5 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors whitespace-nowrap shadow-sm shadow-blue-500/25"
        >
          {loading ? "Menambah..." : "Tambah"}
        </button>
      </form>

      {/* List Goal Kecil */}
      <div className="space-y-3">
        {goals.map((goal, index) => (
          <div
            key={goal.id}
            className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">
                {index + 1}
              </span>
              <span className="text-gray-800 text-sm">{goal.nama}</span>
            </div>
            <button
              onClick={() => handleDelete(goal.id)}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
              title="Hapus Goal Kecil"
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
          <div className="py-8 text-center text-gray-500 text-sm">
            Belum ada goal kecil yang ditambahkan.
          </div>
        )}
      </div>
    </div>
  );
}
