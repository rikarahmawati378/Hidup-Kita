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
    <div className="space-y-6">
      {/* Date Picker Card */}
      <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pilih Tanggal Rencana
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Tambah Kegiatan */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              Tambah Kegiatan
            </h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Jam
                </label>
                <input
                  type="text"
                  value={jam}
                  onChange={(e) => setJam(e.target.value)}
                  placeholder="06:30"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Deskripsi
                </label>
                <input
                  type="text"
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Hafalan Grammar"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tag Goal Kecil
                </label>
                <select
                  value={goalKecilId}
                  onChange={(e) => setGoalKecilId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
                className="w-full mt-2 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-all shadow-sm shadow-blue-500/25"
              >
                {loadingSubmit ? "Menyimpan..." : "Tambah Kegiatan"}
              </button>
            </form>
          </div>
        </div>

        {/* List Kegiatan */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm min-h-[400px]">
            <h2 className="text-lg font-semibold text-gray-900 mb-5 border-b border-gray-100 pb-4">
              Rencana untuk {displayDate}
            </h2>

            {loadingList ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : kegiatanList.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-gray-500 text-sm">
                  Belum ada kegiatan yang direncanakan.
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Mulai tambahkan jadwal Anda di form sebelah.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {kegiatanList.map((keg) => (
                  <div
                    key={keg.id}
                    className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/30 hover:bg-white hover:shadow-sm hover:border-gray-200 transition-all group"
                  >
                    <div className="flex-shrink-0 mt-0.5 text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                      {keg.jam}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-gray-900 font-medium leading-tight">
                        {keg.deskripsi}
                      </p>
                      {keg.goal_kecil?.nama && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-600">
                          <svg
                            className="w-3.5 h-3.5 text-amber-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                            />
                          </svg>
                          {keg.goal_kecil.nama}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(keg.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
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
