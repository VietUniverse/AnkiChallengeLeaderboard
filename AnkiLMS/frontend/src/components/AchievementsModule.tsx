"use client";

import React from "react";
import { Award, Lock, CheckCircle2, Trophy } from "lucide-react";
import { ACHIEVEMENTS_DATA } from "../data/achievementsData";
import { UserProfile } from "../lib/apiClient";

interface AchievementsModuleProps {
  currentUser: UserProfile | null;
}

export const AchievementsModule: React.FC<AchievementsModuleProps> = ({ currentUser }) => {
  const currentStreak = currentUser?.streak || 0;
  const currentLevel = currentUser?.level || 1;
  const currentXp = currentUser?.xp || 0;

  const isUnlocked = (reqValue: number, category: string): boolean => {
    if (category === "streak") return currentStreak >= reqValue;
    if (category === "level") return currentLevel >= reqValue;
    // Sử dụng XP làm proxy cho learning progress (ước tính: 10 XP per card reviewed)
    if (category === "learning") {
      const estimatedCards = Math.floor(currentXp / 10);
      return estimatedCards >= reqValue;
    }
    if (category === "social") return currentLevel >= reqValue;
    return false;
  };

  const getProgress = (reqValue: number, category: string): number => {
    if (category === "streak") return Math.min(currentStreak, reqValue);
    if (category === "level") return Math.min(currentLevel, reqValue);
    if (category === "learning") return Math.min(Math.floor(currentXp / 10), reqValue);
    if (category === "social") return Math.min(currentLevel, reqValue);
    return 0;
  };

  const unlockedCount = ACHIEVEMENTS_DATA.filter((b) => isUnlocked(b.reqValue, b.category)).length;

  return (
    <div className="space-y-6 animate-fadeIn pb-24 max-w-4xl mx-auto select-none">
      {/* Banner */}
      <div className="card-duo p-6 bg-gradient-to-r from-purple-950/40 via-slate-900 to-blue-950/40 border-purple-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center text-2xl font-black">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Mốc Thưởng & Huy Hiệu HaechiVN</h2>
            <p className="text-xs text-slate-400">Tích lũy Streak, Level và XP để mở khóa huy hiệu danh giá</p>
          </div>
        </div>

        <div className="text-center px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800">
          <p className="text-lg font-black text-amber-400">{unlockedCount}/{ACHIEVEMENTS_DATA.length}</p>
          <p className="text-[10px] font-bold text-slate-400">Đã mở khóa</p>
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {ACHIEVEMENTS_DATA.map((badge) => {
          const unlocked = isUnlocked(badge.reqValue, badge.category);
          const progress = getProgress(badge.reqValue, badge.category);
          const progressPercent = Math.min(100, Math.round((progress / badge.reqValue) * 100));

          return (
            <div
              key={badge.id}
              className={`card-duo p-5 flex items-start gap-4 transition-all ${
                unlocked
                  ? "bg-slate-900 border-amber-400/50 shadow-lg shadow-amber-500/5"
                  : "bg-slate-950/60 border-slate-800 opacity-70"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                  unlocked ? "bg-amber-500/20 border border-amber-400/50" : "bg-slate-800 text-slate-500"
                }`}
              >
                {unlocked ? badge.icon : <Lock className="w-5 h-5 text-slate-500" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className={`text-sm font-black truncate ${unlocked ? "text-white" : "text-slate-400"}`}>
                    {badge.name}
                  </h3>
                  {unlocked && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-2">{badge.description}</p>

                {/* Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${unlocked ? "bg-emerald-400" : "bg-blue-500"}`}
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <div className="text-[10px] font-bold font-mono text-slate-500 mt-1">
                  {unlocked ? (
                    <span className="text-emerald-400 font-bold">✅ Đã đạt mốc</span>
                  ) : (
                    <span>{progress}/{badge.reqValue} ({progressPercent}%)</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
