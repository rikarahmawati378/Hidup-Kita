"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type GoalBesar = {
  id: string;
  user_id: string;
  nama: string;
  target_xp: number;
  progress?: number;
};

export default function GoalsList({
  initialGoals,
  userId,
}: {
  initialGoals: GoalBesar[];
  userId: string;
}) {
  const [goals, setGoals] = useState(initialGoals);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nama, setNama] = useState("");
  const [targetXp, setTargetXp] = useState(1000);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase
      .from("goal_besar")
      .insert({ user_id: userId, nama, target_xp: targetXp })
      .select()
      .single();

    if (!error && data) {
      setGoals([data, ...goals]);
      setIsModalOpen(false);
      setNama("");
      setTargetXp(1000);
      router.refresh();
    } else {
      console.error(error);
      alert("Gagal menambahkan goal.");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Hapus goal ini?")) return;

    setGoals(goals.filter((g) => g.id !== id));
    await supabase.from("goal_besar").delete().eq("id", id);
    router.refresh();
  };

  return (
    <div>
      {/* Tombol Tambah */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-medium transition-all duration-200 hover:bg-blue-600 shadow-sm shadow-blue-500/25"
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        Tambah Goal Besar
      </button>

      {/* Inline Form / Modal */}
      {isModalOpen && (
        <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-200/60 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Goal Besar Baru
          </h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nama Goal
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Belajar Next.js"
                required
                className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Target XP
              </label>
              <input
                type="number"
                value={targetXp}
                onChange={(e) => setTargetXp(Number(e.target.value))}
                min="1"
                required
                className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || !nama}
                className="px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Daftar Kartu Goal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => (
          <Link
            key={goal.id}
            href={`/goals/${goal.id}`}
            className="block bg-white rounded-2xl border border-gray-200/60 p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 relative group"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-900 line-clamp-2 pr-8">
                {goal.nama}
              </h3>
              <button
                onClick={(e) => handleDelete(goal.id, e)}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                title="Hapus Goal"
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
            <p className="text-xs font-medium text-blue-600 mb-4 bg-blue-50 w-fit px-2.5 py-1 rounded-md">
              Target: {goal.target_xp} XP
            </p>

            <div className="mt-auto">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Progress</span>
                <span>{goal.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${goal.progress || 0}%` }}
                ></div>
              </div>
            </div>
          </Link>
        ))}

        {goals.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-sm">
              Belum ada Goal Besar. Silakan tambah goal pertamamu!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
