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
        className="mb-8 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-garden-sage text-white text-sm font-bold transition-all duration-200 hover:bg-green-700 shadow-md shadow-garden-sage/20 transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <span className="text-lg">🌱</span>
        Tambah Goal Besar
      </button>

      {/* Inline Form / Modal */}
      {isModalOpen && (
        <div className="mb-10 p-8 bg-white rounded-3xl border border-garden-sage/10 shadow-xl shadow-garden-sage/5 animate-in slide-in-from-top-4">
          <h2 className="text-xl font-bold text-garden-brown mb-6 flex items-center gap-2">
            <span>🌿</span> Goal Besar Baru
          </h2>
          <form onSubmit={handleAdd} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-garden-brown mb-2 ml-1">
                Nama Goal
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Belajar Berkebun"
                required
                className="w-full px-4 py-3 rounded-xl border border-garden-sage/30 bg-garden-sage-light/30 text-garden-brown text-sm focus:outline-none focus:ring-2 focus:ring-garden-sage/20 focus:border-garden-sage focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-garden-brown mb-2 ml-1">
                Target XP ✨
              </label>
              <input
                type="number"
                value={targetXp}
                onChange={(e) => setTargetXp(Number(e.target.value))}
                min="1"
                required
                className="w-full px-4 py-3 rounded-xl border border-garden-sage/30 bg-garden-sage-light/30 text-garden-brown text-sm focus:outline-none focus:ring-2 focus:ring-garden-sage/20 focus:border-garden-sage focus:bg-white transition-all"
              />
            </div>
            <div className="flex gap-4 justify-end mt-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-sm font-bold text-garden-brown-light hover:text-garden-brown transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || !nama}
                className="px-6 py-2.5 rounded-xl bg-garden-sage text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50 transition-all shadow-md shadow-garden-sage/20"
              >
                {loading ? "Menyimpan..." : "Simpan Goal"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Daftar Kartu Goal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => (
          <Link
            key={goal.id}
            href={`/goals/${goal.id}`}
            className="block bg-white rounded-3xl border border-garden-sage/10 p-6 shadow-lg shadow-garden-sage/5 hover:shadow-garden-sage/10 hover:border-garden-sage/30 transition-all duration-300 relative group transform hover:-translate-y-1"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-garden-brown text-lg line-clamp-2 pr-8 leading-tight">
                {goal.nama}
              </h3>
              <button
                onClick={(e) => handleDelete(goal.id, e)}
                className="absolute top-5 right-5 p-2 text-garden-brown-light hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200"
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
            
            <div className="flex items-center gap-2 mb-6">
               <span className="text-xs font-bold text-garden-sage bg-garden-sage-light px-3 py-1.5 rounded-full border border-garden-sage/10 shadow-sm">
                Target: {goal.target_xp} ✨
              </span>
            </div>

            <div className="mt-auto">
              <div className="flex justify-between text-xs font-bold text-garden-brown-light mb-2 px-1">
                <span>Progress</span>
                <span className="text-garden-sage">{goal.progress || 0}%</span>
              </div>
              <div className="w-full bg-garden-sage-light rounded-full h-2.5 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-garden-sage to-green-400 h-2.5 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${goal.progress || 0}%` }}
                ></div>
              </div>
            </div>
          </Link>
        ))}

        {goals.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white/50 rounded-3xl border-2 border-dashed border-garden-sage/20">
            <div className="text-4xl mb-4">🎯</div>
            <p className="text-garden-brown font-medium">
              Belum ada Goal Besar. 
            </p>
            <p className="text-garden-brown-light text-sm mt-1">
              Silakan tambah goal pertamamu untuk mulai berpetualang!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
