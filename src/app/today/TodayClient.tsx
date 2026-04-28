"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

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

    // Insert kegiatan baru
    const { data: newKeg, error: insertError } = await supabase
      .from("kegiatan")
      .insert({
        user_id: userId,
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
    <div className="space-y-8 relative">
      {/* Toast Notification */}
      <div
        className={`fixed top-20 right-4 z-50 transition-all duration-300 transform ${
          toast.show ? "translate-x-0 opacity-100" : "translate-x-[120%] opacity-0"
        }`}
      >
        <div className="bg-blue-600 text-white px-6 py-3.5 rounded-xl shadow-lg flex items-center gap-3">
          <div className="bg-blue-500 rounded-full p-1">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Hari Ini
        </h1>
        <p className="text-gray-500 mt-2 text-sm sm:text-base font-medium">
          {displayDate}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Daftar Rencana Aktif */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">
              Rencana Aktif
            </h2>
            {activeList.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-white shadow-sm">
                <p className="text-gray-500 text-sm mb-4">
                  Belum ada rencana aktif untuk hari ini.
                </p>
                <Link
                  href="/planner"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm shadow-blue-500/25"
                >
                  Yuk rencanakan di Planner!
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeList.map((keg) => (
                  <div
                    key={keg.id}
                    className="bg-white rounded-2xl border border-gray-200/60 p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-0.5 text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                          {keg.jam}
                        </div>
                        <div>
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
                      </div>
                      <div className="flex gap-2 sm:ml-auto">
                        <button
                          onClick={() => toggleReplaceForm(keg)}
                          disabled={submittingId === keg.id}
                          className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 transition-colors flex items-center gap-2"
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
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          Ganti
                        </button>
                        <button
                          onClick={() => handleSelesai(keg)}
                          disabled={submittingId === keg.id}
                          className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors shadow-sm shadow-blue-500/25 flex items-center gap-2"
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Selesai
                        </button>
                      </div>
                    </div>

                    {/* Inline Form Ganti */}
                    {replaceForms[keg.id] && (
                      <div className="mt-5 pt-5 border-t border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                          Kegiatan Aktual (Ganti Rencana)
                        </h4>
                        <div className="flex flex-col md:flex-row gap-3">
                          <input
                            type="text"
                            value={replaceForms[keg.id].jam}
                            onChange={(e) =>
                              handleReplaceChange(keg.id, "jam", e.target.value)
                            }
                            className="w-full md:w-24 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                            className="w-full md:flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="Deskripsi kegiatan aktual"
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
                            className="w-full md:w-48 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex-shrink-0 disabled:opacity-50"
                          >
                            {submittingId === keg.id
                              ? "Menyimpan..."
                              : "Simpan & Selesai"}
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
            <div className="mt-12">
              <h2 className="text-lg font-semibold text-gray-500 mb-4 border-b border-gray-200/60 pb-2">
                Riwayat Selesai Hari Ini
              </h2>
              <div className="space-y-3">
                {completedList.map((keg) => (
                  <div
                    key={keg.id}
                    className="flex items-start gap-4 p-4 rounded-xl border border-gray-200/60 bg-gray-50 opacity-75"
                  >
                    <div className="flex-shrink-0 mt-0.5 text-sm font-semibold text-gray-500 bg-gray-200/50 px-3 py-1.5 rounded-lg border border-gray-200">
                      {keg.jam}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-gray-500 font-medium leading-tight line-through">
                        {keg.deskripsi}
                      </p>
                      {keg.goal_kecil?.nama && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-200/50 text-xs font-medium text-gray-500">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
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
