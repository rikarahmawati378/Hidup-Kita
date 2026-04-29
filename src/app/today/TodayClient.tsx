"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export type GoalKecilDropdown = {
  id: string;
  nama: string;
  goal_besar_id: string;
  xp_per_kegiatan: number;
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
  replaced?: boolean;
  replaced_by_id?: string | null;
  goal_kecil?: {
    nama: string;
    goal_besar?: { nama: string };
  } | null;
};

type ToastState = {
  show: boolean;
  message: string;
};

export default function TodayClient({
  userId,
  goalKecilList,
}: {
  userId: string;
  goalKecilList: GoalKecilDropdown[];
}) {
  const supabase = createClient();

  const getTodayDate = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    d.setMinutes(d.getMinutes() - offset);
    return d.toISOString().split("T")[0];
  };

  const todayStr = getTodayDate();

  const displayDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [activeList, setActiveList] = useState<Kegiatan[]>([]);
  const [completedList, setCompletedList] = useState<Kegiatan[]>([]);
  const [loading, setLoading] = useState(true);

  // Toast state
  const [toast, setToast] = useState<ToastState>({ show: false, message: "" });

  // Replace form state mapping: keg_id -> { deskripsi, goal_kecil_id, jam }
  const [replaceForms, setReplaceForms] = useState<
    Record<
      string,
      { deskripsi: string; goal_kecil_id: string; jam: string }
    >
  >({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("kegiatan")
      .select(
        `
        *,
        goal_kecil (
          nama,
          goal_besar (
            nama
          )
        )
      `
      )
      .eq("user_id", userId)
      .eq("tanggal", todayStr)
      .order("jam", { ascending: true });

    if (!error && data) {
      const allKegiatan = data as Kegiatan[];
      // is_planned = true, completed = false, replaced != true
      const active = allKegiatan.filter(
        (k) => k.is_planned && !k.completed && !k.replaced
      );
      const completed = allKegiatan.filter((k) => k.completed);
      setActiveList(active);
      setCompletedList(completed);
    }
    setLoading(false);
  };

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 3000);
  };

  const handleSelesai = async (keg: Kegiatan) => {
    setSubmittingId(keg.id);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Sesi berakhir, silakan login kembali.");
      return;
    }

    // Update db
    const { error } = await supabase
      .from("kegiatan")
      .update({ completed: true })
      .eq("id", keg.id);

    if (!error) {
      // Call RPC if there's a goal tied
      if (keg.goal_kecil_id) {
        await supabase.rpc("award_xp", { keg_id: keg.id });
        const goalBesarName = keg.goal_kecil?.goal_besar?.nama || "Goal";
        showToast(`Mantap! +50 EXP masuk ke misi ${goalBesarName}`);
      } else {
        showToast(`Mantap! Kegiatan selesai.`);
      }

      // Update UI optimistically
      setActiveList(activeList.filter((k) => k.id !== keg.id));
      setCompletedList(
        [...completedList, { ...keg, completed: true }].sort((a, b) =>
          a.jam.localeCompare(b.jam)
        )
      );
    } else {
      alert("Gagal menyelesaikan kegiatan.");
    }
    setSubmittingId(null);
  };

  const toggleReplaceForm = (keg: Kegiatan) => {
    if (replaceForms[keg.id]) {
      const newForms = { ...replaceForms };
      delete newForms[keg.id];
      setReplaceForms(newForms);
    } else {
      setReplaceForms({
        ...replaceForms,
        [keg.id]: {
          deskripsi: keg.deskripsi,
          goal_kecil_id: keg.goal_kecil_id || "",
          jam: keg.jam,
        },
      });
    }
  };

  const handleReplaceChange = (id: string, field: string, value: string) => {
    setReplaceForms({
      ...replaceForms,
      [id]: {
        ...replaceForms[id],
        [field]: value,
      },
    });
  };

  const submitReplace = async (keg: Kegiatan) => {
    setSubmittingId(keg.id);
    const form = replaceForms[keg.id];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Sesi berakhir, silakan login kembali.");
      return;
    }

    // Insert kegiatan baru
    const { data: newKeg, error: insertError } = await supabase
      .from("kegiatan")
      .insert({
        user_id: user.id,
        tanggal: todayStr,
        jam: form.jam,
        deskripsi: form.deskripsi,
        goal_kecil_id: form.goal_kecil_id || null,
        is_planned: false,
        completed: true,
      })
      .select(
        `
        *,
        goal_kecil (
          nama,
          goal_besar (
            nama
          )
        )
      `
      )
      .single();

    if (!insertError && newKeg) {
      // Update rencana asli
      await supabase
        .from("kegiatan")
        .update({
          replaced: true,
          completed: true,
          replaced_by_id: newKeg.id,
        })
        .eq("id", keg.id);

      // Panggil RPC untuk EXP jika ada goal
      if (form.goal_kecil_id) {
        await supabase.rpc("award_xp", { keg_id: newKeg.id });
        const newGoalInfo = newKeg as Kegiatan;
        const goalBesarName =
          newGoalInfo.goal_kecil?.goal_besar?.nama || "Goal";
        showToast(`Mantap! +50 EXP masuk ke misi ${goalBesarName}`);
      } else {
        showToast(`Kegiatan berhasil diganti dan selesai.`);
      }

      // Refresh data to ensure exact sync
      await fetchData();
    } else {
      alert("Gagal mengganti kegiatan.");
    }
    setSubmittingId(null);
  };

  return (
    <div className="space-y-10 relative">
      {/* Toast Notification */}
      <div
        className={`fixed top-24 right-4 z-[60] transition-all duration-500 transform ${
          toast.show ? "translate-x-0 opacity-100 scale-100" : "translate-x-[120%] opacity-0 scale-90"
        }`}
      >
        <div className="bg-garden-peach/95 backdrop-blur-md text-garden-brown px-8 py-5 rounded-3xl shadow-2xl border-2 border-garden-peach/50 flex items-center gap-4 min-w-[300px]">
          <div className="bg-white rounded-full p-2 shadow-sm text-2xl">
            ✨
          </div>
          <span className="font-extrabold text-sm leading-snug">{toast.message}</span>
        </div>
      </div>

      <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-3xl sm:text-4xl font-black text-garden-brown tracking-tight">
          📅 Hari Ini
        </h1>
        <p className="text-garden-brown-light mt-3 text-lg font-bold flex items-center gap-2">
          <span className="w-8 h-0.5 bg-garden-sage rounded-full"></span>
          {displayDate}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-garden-sage"></div>
        </div>
      ) : (
        <>
          {/* Daftar Rencana Aktif */}
          <div className="animate-in fade-in duration-1000">
            <h2 className="text-xl font-bold text-garden-brown mb-6 border-b-2 border-garden-sage/10 pb-3 flex items-center gap-2">
              <span>🌿</span> Rencana Aktif
            </h2>
            {activeList.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-garden-sage/20 rounded-3xl bg-white/50 shadow-sm">
                <div className="text-4xl mb-4">🍃</div>
                <p className="text-garden-brown-light font-bold mb-6">
                  Belum ada rencana aktif untuk hari ini.
                </p>
                <Link
                  href="/planner"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-garden-sage text-white text-sm font-bold hover:bg-green-700 transition-all shadow-md shadow-garden-sage/20 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Yuk rencanakan di Planner! 📝
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {activeList.map((keg) => (
                  <div
                    key={keg.id}
                    className="bg-white rounded-3xl border border-garden-sage/10 p-6 shadow-xl shadow-garden-sage/5 hover:shadow-garden-sage/10 transition-all duration-300 border-l-[12px] border-l-garden-sage"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex items-start gap-5">
                        <div className="flex-shrink-0 mt-0.5 text-sm font-black text-garden-sage bg-garden-sage-light px-4 py-2 rounded-xl border border-garden-sage/10 shadow-sm font-mono">
                          {keg.jam}
                        </div>
                        <div>
                          <p className="text-garden-brown font-black leading-tight text-xl">
                            {keg.deskripsi}
                          </p>
                          {keg.goal_kecil?.nama && (
                            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-garden-sage-light/30 text-[11px] font-black text-garden-sage border border-garden-sage/10 shadow-sm">
                              <span className="text-amber-500">🎯</span>
                              {keg.goal_kecil.nama}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3 sm:ml-auto">
                        <button
                          onClick={() => toggleReplaceForm(keg)}
                          disabled={submittingId === keg.id}
                          className="px-5 py-3 rounded-2xl text-sm font-bold text-garden-brown bg-garden-peach/30 hover:bg-garden-peach/50 transition-all flex items-center gap-2 shadow-sm transform active:scale-95"
                        >
                          <span className="text-lg">🔄</span>
                          Ganti
                        </button>
                        <button
                          onClick={() => handleSelesai(keg)}
                          disabled={submittingId === keg.id}
                          className="px-6 py-3 rounded-2xl text-sm font-bold text-white bg-garden-sage hover:bg-green-700 transition-all shadow-md shadow-garden-sage/20 flex items-center gap-2 transform active:scale-95"
                        >
                          <span className="text-lg">✅</span>
                          Selesai
                        </button>
                      </div>
                    </div>

                    {/* Inline Form Ganti */}
                    {replaceForms[keg.id] && (
                      <div className="mt-8 pt-8 border-t border-garden-sage/10 animate-in slide-in-from-top-4">
                        <h4 className="text-sm font-black text-garden-brown mb-5 flex items-center gap-2">
                          <span>🔄</span> Kegiatan Aktual (Ganti Rencana)
                        </h4>
                        <div className="flex flex-col lg:flex-row gap-4">
                          <input
                            type="text"
                            value={replaceForms[keg.id].jam}
                            onChange={(e) =>
                              handleReplaceChange(keg.id, "jam", e.target.value)
                            }
                            className="w-full lg:w-28 px-4 py-3 rounded-xl border border-garden-sage/30 bg-garden-sage-light/30 text-garden-brown font-bold text-sm focus:ring-2 focus:ring-garden-sage/20 focus:border-garden-sage focus:bg-white transition-all shadow-inner font-mono"
                            placeholder="Jam"
                          />
                          <input
                            type="text"
                            value={replaceForms[keg.id].deskripsi}
                            onChange={(e) =>
                              handleReplaceChange(
                                keg.id,
                                "deskripsi",
                                e.target.value
                              )
                            }
                            className="w-full lg:flex-1 px-4 py-3 rounded-xl border border-garden-sage/30 bg-garden-sage-light/30 text-garden-brown font-bold text-sm focus:ring-2 focus:ring-garden-sage/20 focus:border-garden-sage focus:bg-white transition-all shadow-inner"
                            placeholder="Apa yang sebenarnya kamu lakukan? 🌿"
                          />
                          <select
                            value={replaceForms[keg.id].goal_kecil_id}
                            onChange={(e) =>
                              handleReplaceChange(
                                keg.id,
                                "goal_kecil_id",
                                e.target.value
                              )
                            }
                            className="w-full lg:w-56 px-4 py-3 rounded-xl border border-garden-sage/30 bg-garden-sage-light/30 text-garden-brown font-bold text-sm focus:ring-2 focus:ring-garden-sage/20 focus:border-garden-sage focus:bg-white transition-all shadow-inner cursor-pointer"
                          >
                            <option value="">-- Tanpa Tag --</option>
                            {goalKecilList.map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.nama}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => submitReplace(keg)}
                            disabled={
                              submittingId === keg.id ||
                              !replaceForms[keg.id].deskripsi ||
                              !replaceForms[keg.id].jam
                            }
                            className="px-6 py-3 bg-garden-brown text-white text-sm font-bold rounded-xl hover:bg-black transition-all flex-shrink-0 disabled:opacity-50 transform active:scale-95 shadow-lg shadow-black/10"
                          >
                            {submittingId === keg.id
                              ? "Menyimpan..."
                              : "Simpan & Selesai ✨"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Riwayat Selesai */}
          {completedList.length > 0 && (
            <div className="mt-16 pb-12 animate-in fade-in duration-1000 delay-300">
              <h2 className="text-xl font-bold text-garden-brown-light mb-6 border-b border-garden-sage/10 pb-3 flex items-center gap-2">
                <span>🏆</span> Riwayat Selesai Hari Ini
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedList.map((keg) => (
                  <div
                    key={keg.id}
                    className="flex items-start gap-4 p-5 rounded-3xl border border-garden-sage/5 bg-white/40 opacity-60 hover:opacity-100 transition-all duration-300 group shadow-sm"
                  >
                    <div className="flex-shrink-0 mt-0.5 text-xs font-bold text-garden-brown-light bg-garden-sage-light/50 px-3 py-1.5 rounded-xl border border-garden-sage/10 font-mono">
                      {keg.jam}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-garden-brown font-bold leading-tight line-through">
                        {keg.deskripsi}
                      </p>
                      {keg.goal_kecil?.nama && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-[10px] font-bold text-garden-sage border border-garden-sage/5 shadow-sm">
                          <span>✨</span>
                          {keg.goal_kecil.nama}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
