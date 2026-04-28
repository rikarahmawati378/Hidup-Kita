"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export type GoalKecil = {
  id: string;
  nama: string;
  total_xp: number;
};

export type GoalBesar = {
  id: string;
  nama: string;
  target_xp: number;
  goal_kecil: GoalKecil[];
};

export default function DashboardClient({
  userId,
  partnerId,
}: {
  userId: string;
  partnerId: string | null;
}) {
  const [activeTab, setActiveTab] = useState<"me" | "partner">("me");
  const [myGoals, setMyGoals] = useState<GoalBesar[]>([]);
  const [partnerGoals, setPartnerGoals] = useState<GoalBesar[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // Fetch my goals
    const { data: myData } = await supabase
      .from("goal_besar")
      .select(
        `
        *,
        goal_kecil (
          id,
          nama,
          total_xp
        )
      `
      )
      .eq("user_id", userId)
      .order("id", { ascending: false });

    if (myData) setMyGoals(myData as unknown as GoalBesar[]);

    // Fetch partner goals if partner exists
    if (partnerId) {
      const { data: pData } = await supabase
        .from("goal_besar")
        .select(
          `
          *,
          goal_kecil (
            id,
            nama,
            total_xp
          )
        `
        )
        .eq("user_id", partnerId)
        .order("id", { ascending: false });

      if (pData) setPartnerGoals(pData as unknown as GoalBesar[]);
    }

    setLoading(false);
  };

  const renderGoals = (goals: GoalBesar[], isPartner: boolean) => {
    if (goals.length === 0) {
      return (
        <div className="text-center py-16 border-2 border-dashed border-garden-sage/20 rounded-3xl bg-white/50 shadow-sm mt-6">
          <p className="text-garden-brown-light text-sm mb-4">
            {isPartner
              ? "Pasangan belum membuat goal. 🌱"
              : "Belum ada goal yang sedang dikerjakan. Ayo mulai! 🌿"}
          </p>
          {!isPartner && (
            <Link
              href="/goals"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-garden-sage hover:bg-green-700 text-white text-sm font-bold transition-all shadow-md shadow-garden-sage/20"
            >
              Buat Goal Sekarang
            </Link>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        {goals.map((gb) => {
          // Calculate total xp from all goal_kecil
          const totalXp =
            gb.goal_kecil?.reduce((sum, gk) => sum + (gk.total_xp || 0), 0) || 0;
          const progressPercent = Math.min(
            100,
            Math.max(0, (totalXp / gb.target_xp) * 100)
          );

          return (
            <div
              key={gb.id}
              className="bg-white rounded-3xl border border-garden-sage/10 p-6 shadow-xl shadow-garden-sage/5 hover:shadow-garden-sage/10 transition-all duration-300"
            >
              <div className="mb-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-garden-brown line-clamp-1">
                    {gb.nama}
                  </h3>
                  <span className="text-2xl">🌱</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-garden-brown-light mb-2 px-1">
                  <span>Progress Keseluruhan</span>
                  <span className="text-garden-sage font-extrabold">
                    {Math.floor(progressPercent)}% ({totalXp} / {gb.target_xp} ✨)
                  </span>
                </div>
                <div className="w-full bg-garden-sage-light rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-garden-sage to-green-400 h-3 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Goal Kecil List */}
              <div className="space-y-4 mt-8">
                <h4 className="text-xs font-bold text-garden-brown-light uppercase tracking-widest px-1">
                  Langkah Kecil 🌿
                </h4>
                {!gb.goal_kecil || gb.goal_kecil.length === 0 ? (
                  <p className="text-xs text-garden-brown-light italic px-1">
                    Belum ada langkah kecil.
                  </p>
                ) : (
                  gb.goal_kecil.map((gk) => {
                    const gkXp = gk.total_xp || 0;
                    const level = Math.floor(gkXp / 100) + 1;
                    const xpCurrentLevel = gkXp % 100;
                    const gkPercent = xpCurrentLevel;

                    return (
                      <div
                        key={gk.id}
                        className="bg-garden-sage-light/30 rounded-2xl p-4 border border-garden-sage/10"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-bold text-garden-brown line-clamp-1">
                            {gk.nama}
                          </span>
                          <span className="text-xs font-bold text-garden-sage bg-white px-2.5 py-1 rounded-lg border border-garden-sage/20 shadow-sm flex items-center gap-1">
                            ⭐ Lv. {level}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-white rounded-full h-2 overflow-hidden shadow-inner">
                            <div
                              className="bg-gradient-to-r from-garden-sage/60 to-garden-sage h-2 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${gkPercent}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] font-bold text-garden-brown-light w-10 text-right">
                            {xpCurrentLevel}/100 ✨
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="pb-10">
      {/* Tabs */}
      <div className="flex border-b border-garden-sage/10 mb-2">
        <button
          onClick={() => setActiveTab("me")}
          className={`pb-4 px-8 text-sm font-bold transition-all relative ${
            activeTab === "me"
              ? "text-garden-sage"
              : "text-garden-brown-light hover:text-garden-brown"
          }`}
        >
          Progressku
          {activeTab === "me" && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-garden-sage rounded-t-full shadow-[0_-2px_8px_rgba(156,175,136,0.5)]"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab("partner")}
          className={`pb-4 px-8 text-sm font-bold transition-all relative ${
            activeTab === "partner"
              ? "text-garden-sage"
              : "text-garden-brown-light hover:text-garden-brown"
          }`}
        >
          Progress Pasangan
          {activeTab === "partner" && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-garden-sage rounded-t-full shadow-[0_-2px_8px_rgba(156,175,136,0.5)]"></div>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-garden-sage"></div>
        </div>
      ) : (
        <div>
          {activeTab === "me" && renderGoals(myGoals, false)}

          {activeTab === "partner" &&
            (partnerId ? (
              renderGoals(partnerGoals, true)
            ) : (
              <div className="text-center py-20 border-2 border-dashed border-garden-sage/20 rounded-3xl bg-white/50 shadow-sm mt-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-garden-sage-light mb-4">
                  <span className="text-3xl">👫</span>
                </div>
                <p className="text-garden-brown font-medium">
                  Belum terhubung dengan pasangan.
                </p>
                <p className="text-garden-brown-light text-sm mt-1">
                  Hubungkan akun untuk saling menyemangati!
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
