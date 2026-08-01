"use client";

import React from "react";
import { User, Flame, Zap, Gem, Trophy, Calendar, LogOut, Mail, ShieldCheck } from "lucide-react";
import { UserProfile, ApiClient } from "../lib/apiClient";

interface ProfileModuleProps {
  currentUser: UserProfile | null;
  onOpenAuth: (isRegisterMode?: boolean) => void;
  onLogout: () => void;
}

export const ProfileModule: React.FC<ProfileModuleProps> = ({ currentUser, onOpenAuth, onLogout }) => {
  if (!currentUser) {
    return (
      <div className="card-duo p-8 text-center max-w-md mx-auto my-12 select-none">
        <User className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-xl font-black text-white mb-2">Chưa Đăng Nhập</h2>
        <p className="text-xs text-slate-400 mb-6">Đăng nhập để xem hồ sơ cá nhân và quản lý tiến độ học tập</p>
        <button
          onClick={() => onOpenAuth(false)}
          className="btn-duo btn-duo-primary px-6 py-3 text-xs w-full"
        >
          Đăng Nhập Ngay
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-24 max-w-3xl mx-auto select-none">
      {/* Main Profile Header Card */}
      <div className="card-duo p-6 bg-slate-900 border-slate-700 flex flex-col sm:flex-row items-center gap-6">
        {currentUser.avatar_url ? (
          <img
            src={currentUser.avatar_url}
            alt={currentUser.name}
            className="w-20 h-20 rounded-3xl object-cover border-2 border-blue-500 shadow-xl"
          />
        ) : (
          <div className="w-20 h-20 rounded-3xl bg-blue-600 text-white font-black text-3xl flex items-center justify-center border-2 border-blue-400 shadow-xl">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-black text-white">{currentUser.name}</h2>
              <p className="text-xs font-mono text-slate-400 flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                <Mail className="w-3.5 h-3.5" /> {currentUser.email}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-xs hover:bg-rose-500/20 flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center sm:justify-start gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-extrabold text-xs border border-blue-500/30">
              Level {currentUser.level || 1}
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-xs border border-amber-500/30">
              Hội Viên HaechiVN
            </span>
          </div>
        </div>
      </div>

      {/* Profile Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="card-duo p-4 bg-slate-900 border-slate-800 text-center">
          <Flame className="w-6 h-6 text-amber-400 fill-amber-400 mx-auto mb-1" />
          <p className="text-xl font-black text-white">{currentUser.streak || 0}</p>
          <p className="text-[11px] text-slate-400 font-bold">Ngày Streak</p>
        </div>

        {/* XP */}
        <div className="card-duo p-4 bg-slate-900 border-slate-800 text-center">
          <Zap className="w-6 h-6 text-blue-400 fill-blue-400 mx-auto mb-1" />
          <p className="text-xl font-black text-white">{currentUser.xp || 0}</p>
          <p className="text-[11px] text-slate-400 font-bold">Tổng XP</p>
        </div>

        {/* Gems */}
        <div className="card-duo p-4 bg-slate-900 border-slate-800 text-center">
          <Gem className="w-6 h-6 text-emerald-400 fill-emerald-400 mx-auto mb-1" />
          <p className="text-xl font-black text-white">{currentUser.gems || 100}</p>
          <p className="text-[11px] text-slate-400 font-bold">Kim Cương 💎</p>
        </div>

        {/* Longest Streak */}
        <div className="card-duo p-4 bg-slate-900 border-slate-800 text-center">
          <Trophy className="w-6 h-6 text-purple-400 mx-auto mb-1" />
          <p className="text-xl font-black text-white">{currentUser.longest_streak || currentUser.streak || 1}</p>
          <p className="text-[11px] text-slate-400 font-bold">Streak Dài Nhất</p>
        </div>
      </div>
    </div>
  );
};
