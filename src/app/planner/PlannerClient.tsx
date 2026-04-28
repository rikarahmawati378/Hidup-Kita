"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export type GoalKecilDropdown = {
  id: string;
  nama: string;
  goal_besar_id: string;
};

export type Kegiatan = {
  id: string;
  user_id: string;
  tanggal: string;
  jam: string;
  deskripsi: string;
  goal_kecil_id: string | null;
  is_planned: boolean;
  completed: boolean;
  goal_kecil?: { nama: string } | null;
};

export default function PlannerClient({
  userId,
  goalKecilList,
}: {
  userId: string;
  goalKecilList: GoalKecilDropdown[];
}) {
  const supabase = createClient();

  // Default date to tomorrow
  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    // Format to YYYY-MM-DD
    const offset = d.getTimezoneOffset()
    d.setMinutes(d.getMinutes() - offset)
    return d.toISOString().split("T")[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTomorrowDate());
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Form states
  const [jam, setJam] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [goalKecilId, setGoalKecilId] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() => {
    fetchKegiatan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const fetchKegiatan = async () => {
    setLoadingList(true);
    const { data, error } = await supabase
      .from("kegiatan")
      .select(`
        *,
        goal_kecil (
          nama
        )
      `)
      .eq("user_id", userId)
      .eq("tanggal", selectedDate)
      .order("jam", { ascending: true });

    if (!error && data) {
      setKegiatanList(data as Kegiatan[]);
    }
    setLoadingList(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jam || !deskripsi) return;
    setLoadingSubmit(true);

    const { data, error } = await supabase
      .from("kegiatan")
      .insert({
        user_id: userId,
        tanggal: selectedDate,
        jam,
        deskripsi,
        goal_kecil_id: goalKecilId || null,
        is_planned: true,
        completed: false,
      })
      .select(`
        *,
        goal_kecil (
          nama
        )
      `)
      .single();

    if (!error && data) {
      // Optimistic insert and sort
      const newList = [...kegiatanList, data as Kegiatan].sort((a, b) =>
        a.jam.localeCompare(b.jam)
      );
      setKegiatanList(newList);
      setJam("");
      setDeskripsi("");
      setGoalKecilId("");
    } else {
      console.error(error);
      alert("Gagal menambahkan kegiatan.");
    }
    setLoadingSubmit(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus kegiatan ini?")) return;
    setKegiatanList(kegiatanList.filter((k) => k.id !== id));
    await supabase.from("kegiatan").delete().eq("id", id);
  };

  const displayDate = new Date(selectedDate).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      {/* Date Picker Card */}
      <div className="bg-white rounded-3xl border border-garden-sage/10 p-8 shadow-xl shadow-garden-sage/5 border-l-8 border-l-garden-sage animate-in slide-in-from-left-4">
        <label className="block text-sm font-bold text-garden-brown mb-3 ml-1">
          📅 Pilih Tanggal Rencana
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-garden-sage/30 bg-garden-sage-light/30 text-garden-brown font-bold text-sm focus:outline-none focus:ring-2 focus:ring-garden-sage/20 focus:border-garden-sage focus:bg-white transition-all shadow-inner"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Tambah Kegiatan */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-garden-sage/10 p-8 shadow-xl shadow-garden-sage/5 lg:sticky lg:top-24 border-t-8 border-t-garden-sage animate-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold text-garden-brown mb-6 flex items-center gap-2">
              <span>📝</span> Tambah Rencana
            </h2>
            <form onSubmit={handleAdd} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-garden-brown mb-2 ml-1">
                  Jam ⏰
                </label>
                <input
                  type="text"
                  value={jam}
                  onChange={(e) => setJam(e.target.value)}
                  placeholder="06:30"
                  required
                  className="w-full px-5 py-3 rounded-2xl border border-garden-sage/30 bg-garden-sage-light/30 text-garden-brown text-sm font-mono focus:outline-none focus:ring-2 focus:ring-garden-sage/20 focus:border-garden-sage focus:bg-white transition-all shadow-inner"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-garden-brown mb-2 ml-1">
                  Deskripsi 🌿
                </label>
                <input
                  type="text"
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Hafalan Grammar"
                  required
                  className="w-full px-5 py-3 rounded-2xl border border-garden-sage/30 bg-garden-sage-light/30 text-garden-brown text-sm focus:outline-none focus:ring-2 focus:ring-garden-sage/20 focus:border-garden-sage focus:bg-white transition-all shadow-inner"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-garden-brown mb-2 ml-1">
                  Tag Goal Kecil 🎯
                </label>
                <select
                  value={goalKecilId}
                  onChange={(e) => setGoalKecilId(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl border border-garden-sage/30 bg-garden-sage-light/30 text-garden-brown text-sm focus:outline-none focus:ring-2 focus:ring-garden-sage/20 focus:border-garden-sage focus:bg-white transition-all shadow-inner cursor-pointer"
                >
                  <option value="">-- Tanpa Tag --</option>
                  {goalKecilList.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nama}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={loadingSubmit || !jam || !deskripsi}
                className="w-full mt-4 py-4 rounded-2xl bg-garden-sage text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50 transition-all shadow-md shadow-garden-sage/20 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loadingSubmit ? "Menyimpan..." : "Simpan Rencana ✨"}
              </button>
            </form>
          </div>
        </div>

        {/* List Kegiatan */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-garden-sage/10 p-8 shadow-xl shadow-garden-sage/5 min-h-[500px]">
            <h2 className="text-xl font-bold text-garden-brown mb-6 border-b border-garden-sage/10 pb-5 flex items-center gap-2">
              <span>📅</span> Rencana untuk {displayDate}
            </h2>

            {loadingList ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-garden-sage"></div>
              </div>
            ) : kegiatanList.length === 0 ? (
              <div className="text-center py-24 border-2 border-dashed border-garden-sage/20 rounded-3xl bg-garden-sage-light/10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white mb-4 shadow-sm border border-garden-sage/5 text-3xl">
                  🍃
                </div>
                <p className="text-garden-brown font-semibold">
                  Belum ada kegiatan yang direncanakan.
                </p>
                <p className="text-garden-brown-light text-sm mt-2">
                  Mulai petualangan harimu dengan mengisi form di sebelah.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {kegiatanList.map((keg) => (
                  <div
                    key={keg.id}
                    className="flex items-start gap-5 p-5 rounded-2xl border border-garden-sage/5 bg-garden-sage-light/20 hover:bg-white hover:shadow-lg hover:shadow-garden-sage/5 hover:border-garden-sage/20 transition-all duration-300 group"
                  >
                    <div className="flex-shrink-0 mt-0.5 text-sm font-black text-garden-sage bg-white px-4 py-2 rounded-xl border border-garden-sage/10 shadow-sm font-mono">
                      {keg.jam}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-garden-brown font-bold leading-tight text-lg">
                        {keg.deskripsi}
                      </p>
                      {keg.goal_kecil?.nama && (
                        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[11px] font-bold text-garden-sage border border-garden-sage/10 shadow-sm">
                          <span className="text-amber-500">🎯</span>
                          {keg.goal_kecil.nama}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(keg.id)}
                      className="p-2.5 text-garden-brown-light hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"
                      title="Hapus Kegiatan"
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
