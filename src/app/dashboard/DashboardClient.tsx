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
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-white shadow-sm mt-6">
          <p className="text-gray-500 text-sm mb-4">
            {isPartner
              ? "Pasangan belum membuat goal."
              : "Belum ada goal yang sedang dikerjakan."}
          </p>
          {!isPartner && (
            <Link
              href="/goals"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm shadow-blue-500/25"
            >
              Buat Goal Sekarang
            </Link>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
              className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                  {gb.nama}
                </h3>
                <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
                  <span>Progress Keseluruhan</span>
                  <span className="text-blue-600">
                    {Math.floor(progressPercent)}% ({totalXp} / {gb.target_xp} XP)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Goal Kecil List */}
              <div className="space-y-3 mt-6">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Langkah Kecil
                </h4>
                {!gb.goal_kecil || gb.goal_kecil.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">
                    Belum ada langkah kecil.
                  </p>
                ) : (
                  gb.goal_kecil.map((gk) => {
                    const gkXp = gk.total_xp || 0;
                    const level = Math.floor(gkXp / 100) + 1;
                    const xpCurrentLevel = gkXp % 100;
                    const gkPercent = xpCurrentLevel; // because 100 xp per level

                    return (
                      <div
                        key={gk.id}
                        className="bg-gray-50 rounded-xl p-3 border border-gray-100"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700 line-clamp-1">
                            {gk.nama}
                          </span>
                          <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                            Lv. {level}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-amber-400 h-1.5 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${gkPercent}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] font-medium text-gray-400 w-8 text-right">
                            {xpCurrentLevel}/100
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
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("me")}
          className={`pb-4 px-6 text-sm font-medium transition-colors relative ${
            activeTab === "me"
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Progressku
          {activeTab === "me" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab("partner")}
          className={`pb-4 px-6 text-sm font-medium transition-colors relative ${
            activeTab === "partner"
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Progress Pasangan
          {activeTab === "partner" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full"></div>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div>
          {activeTab === "me" && renderGoals(myGoals, false)}

          {activeTab === "partner" &&
            (partnerId ? (
              renderGoals(partnerGoals, true)
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-white shadow-sm mt-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">
                  Belum terhubung dengan pasangan.
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
