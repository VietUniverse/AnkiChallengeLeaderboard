"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, ModuleTab } from "../components/Sidebar";
import { BottomNav } from "../components/BottomNav";
import { Header } from "../components/Header";
import { DownloadBanner } from "../components/DownloadBanner";
import { HangeulModule } from "../components/HangeulModule";
import { VocabularySRSModule } from "../components/VocabularySRSModule";
import { DictationModule } from "../components/DictationModule";
import { ShadowingModule } from "../components/ShadowingModule";
import { TopikExamModule } from "../components/TopikExamModule";
import { AnkiImporter } from "../components/AnkiImporter";
import { AuthModal } from "../components/AuthModal";
import { LeaderboardModule } from "../components/LeaderboardModule";
import { AchievementsModule } from "../components/AchievementsModule";
import { ProfileModule } from "../components/ProfileModule";
import { AnkiDeck } from "../lib/ankiParser";
import { ApiClient, UserProfile } from "../lib/apiClient";
import { Flame, Zap, Layers, Trophy, Calendar, Sparkles, Crown } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ModuleTab>("home");
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authRegisterMode, setAuthRegisterMode] = useState(false);
  const [userDecks, setUserDecks] = useState<AnkiDeck[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [heatmapData, setHeatmapData] = useState<{ checkin_date: string; time_spent_minutes: number; xp_earned: number }[]>([]);
  const [checkinMessage, setCheckinMessage] = useState<string | null>(null);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authToken = params.get("auth_token");
    const authError = params.get("auth_error");
    
    if (authToken) {
      localStorage.setItem("haechivn_auth_token", authToken);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (authError) {
      setAuthErrorMessage(decodeURIComponent(authError));
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => setAuthErrorMessage(null), 8000);
    }

    async function loadInitialData() {
      const user = await ApiClient.fetchMe();
      setCurrentUser(user);
      const decks = ApiClient.getSavedDecks();
      setUserDecks(decks);

      if (user) {
        const heatmap = await ApiClient.getHeatmapData();
        setHeatmapData(heatmap);
      }
    }
    loadInitialData();
  }, []);

  const handleOpenAuth = (register?: boolean) => {
    setAuthRegisterMode(!!register);
    setIsAuthOpen(true);
  };

  const handleDeckImported = (deck: AnkiDeck) => {
    const updated = [...userDecks, deck];
    setUserDecks(updated);
    ApiClient.saveDecks(updated);
    setIsImporterOpen(false);
  };

  const handleCheckin = async () => {
    if (!currentUser) {
      handleOpenAuth(false);
      return;
    }
    try {
      const res = await ApiClient.checkin();
      setCheckinMessage(res.message);
      if (res.user) {
        setCurrentUser((prev) => ({ ...prev, ...res.user } as UserProfile));
      }
      const updatedHeatmap = await ApiClient.getHeatmapData();
      setHeatmapData(updatedHeatmap);
      setTimeout(() => setCheckinMessage(null), 4000);
    } catch (e: any) {
      setCheckinMessage("⚠️ " + (e.message || "Vui lòng đăng nhập để điểm danh"));
      setTimeout(() => setCheckinMessage(null), 4000);
    }
  };

  const handleLogout = async () => {
    await ApiClient.logout();
    setCurrentUser(null);
    setHeatmapData([]);
    setActiveTab("home");
  };

  const renderHeatmapGrid = () => {
    const days = [];
    const today = new Date();
    for (let i = 90; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const match = heatmapData.find((h) => h.checkin_date === dateStr);

      let colorClass = "bg-[#16274e] border-[#1f376d]";
      if (match) {
        if (match.time_spent_minutes >= 45) colorClass = "bg-emerald-400 border-emerald-300 shadow-sm shadow-emerald-400/40";
        else if (match.time_spent_minutes >= 30) colorClass = "bg-emerald-500 border-emerald-400";
        else if (match.time_spent_minutes >= 15) colorClass = "bg-emerald-600 border-emerald-500";
        else colorClass = "bg-emerald-800 border-emerald-700";
      }

      days.push(
        <div
          key={dateStr}
          title={`${dateStr}: ${match ? `${match.time_spent_minutes} phút, +${match.xp_earned} XP` : "Chưa học"}`}
          className={`w-3.5 h-3.5 rounded-sm border ${colorClass} transition-transform hover:scale-125 cursor-pointer`}
        />
      );
    }
    return days;
  };

  return (
    <div className="flex h-screen bg-[#0b1329] text-white overflow-hidden font-sans select-none">
      {/* Sidebar Desktop – truyền ĐỦ props */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenImporter={() => setIsImporterOpen(true)}
        onOpenAuth={handleOpenAuth}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content View */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          currentUser={currentUser}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
        />

        <main className={`flex-1 p-2 md:p-4 w-full ${activeTab === "dictation" ? "max-w-none" : "max-w-6xl mx-auto"}`}>
          <DownloadBanner />

          {checkinMessage && (
            <div className="mb-4 p-4 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-300 font-bold text-xs flex items-center justify-between animate-fadeIn">
              <span>{checkinMessage}</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
          )}

          {authErrorMessage && (
            <div className="mb-4 p-4 rounded-2xl bg-rose-500/20 border border-rose-500 text-rose-300 font-bold text-xs flex items-center justify-between animate-fadeIn">
              <span>Đăng nhập thất bại: {authErrorMessage === "missing_config" ? "Chưa cấu hình Google OAuth Client ID/Secret" : authErrorMessage}</span>
            </div>
          )}

          {/* ========== TAB CONTENT ROUTER ========== */}

          {activeTab === "home" && (
            <div className="space-y-8 animate-fadeIn">
              {/* Hero Banner */}
              <div className="card-duo p-6 bg-gradient-to-r from-[#13244e] via-[#162a5b] to-[#1d3572] border-[#274893] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-3 z-10 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Hệ Thống Học Tiếng Hàn Chuẩn Anki SRS</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                    Chào mừng đến với <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">HaechiVN</span>
                  </h1>
                  <p className="text-xs md:text-sm text-slate-300 max-w-xl leading-relaxed">
                    Học từ vựng lặp lại ngắt quãng Anki, luyện nghe chính tả, Shadowing chuẩn giọng Seoul và thử sức với ngân hàng đề thi TOPIK.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <button onClick={() => setActiveTab("review")} className="btn-duo btn-duo-primary px-6 py-3 text-xs flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      <span>Ôn Tập Thẻ Từ Vựng ngay</span>
                    </button>
                    <button onClick={handleCheckin} className="btn-duo btn-duo-orange px-6 py-3 text-xs flex items-center gap-2">
                      <Flame className="w-4 h-4" />
                      <span>ĐIỂM DANH NGAY (+50 XP)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Heatmap & Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card-duo p-5 bg-[#0f1b38] border-[#1e3466]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <h3 className="text-sm font-black text-white">Tiến Độ Học Tập 90 Ngày Gần Nhất</h3>
                    </div>
                    <span className="text-[11px] text-slate-400 font-bold">{heatmapData.length} ngày đã ghi nhận</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">{renderHeatmapGrid()}</div>
                  <div className="mt-4 flex items-center justify-between text-[10px] text-slate-400 font-semibold border-t border-slate-800/80 pt-3">
                    <span>Ít học</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-sm bg-[#16274e]"></div>
                      <div className="w-2.5 h-2.5 rounded-sm bg-emerald-800"></div>
                      <div className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></div>
                      <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400"></div>
                    </div>
                    <span>Học nhiều</span>
                  </div>
                </div>

                <div className="card-duo p-5 bg-[#0f1b38] border-[#1e3466] flex flex-col justify-between space-y-4">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" /> Thống Kê Cá Nhân
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#132247] border border-[#1e3a70]">
                      <span className="text-xs text-slate-400 font-bold flex items-center gap-2">
                        <Flame className="w-4 h-4 text-amber-400 fill-amber-400" /> Chuỗi Streak
                      </span>
                      <span className="text-sm font-black text-amber-400">{currentUser?.streak || 0} ngày</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#132247] border border-[#1e3a70]">
                      <span className="text-xs text-slate-400 font-bold flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-400 fill-blue-400" /> Tổng XP
                      </span>
                      <span className="text-sm font-black text-blue-400">{currentUser?.xp || 0} XP</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#132247] border border-[#1e3a70]">
                      <span className="text-xs text-slate-400 font-bold flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-purple-400" /> Cấp độ (Level)
                      </span>
                      <span className="text-sm font-black text-purple-400">Level {currentUser?.level || 1}</span>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab("leaderboard")} className="w-full py-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/40 text-xs font-bold hover:bg-blue-600/30 transition-colors">
                    Xem Bảng Xếp Hạng
                  </button>
                </div>
              </div>

              {/* Module Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div onClick={() => setActiveTab("hangeul")} className="card-duo card-duo-hover p-6 bg-[#0f1b38] border-[#1e3466] cursor-pointer space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black">가</div>
                  <h3 className="text-base font-black text-white">Bảng Chữ Cái Hangeul</h3>
                  <p className="text-xs text-slate-400">Học toàn bộ Nguyên âm, Phụ âm và Quy tắc ghép vần tiếng Hàn</p>
                </div>
                <div onClick={() => setActiveTab("review")} className="card-duo card-duo-hover p-6 bg-[#0f1b38] border-[#1e3466] cursor-pointer space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black"><Layers className="w-5 h-5" /></div>
                  <h3 className="text-base font-black text-white">Từ Vựng SRS Anki</h3>
                  <p className="text-xs text-slate-400">Thuật toán SM-2 lặp lại ngắt quãng tự động tính interval ôn tập</p>
                </div>
                <div onClick={() => setActiveTab("topik")} className="card-duo card-duo-hover p-6 bg-[#0f1b38] border-[#1e3466] cursor-pointer space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black"><Trophy className="w-5 h-5" /></div>
                  <h3 className="text-base font-black text-white">Đề Thi TOPIK I / II</h3>
                  <p className="text-xs text-slate-400">Thi thử trực tuyến có timer đếm ngược và giải thích chi tiết</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "hangeul" && <HangeulModule />}
          {activeTab === "review" && <VocabularySRSModule userDecks={userDecks} />}
          {activeTab === "dictation" && <DictationModule />}
          {activeTab === "shadowing" && <ShadowingModule />}
          {activeTab === "topik" && <TopikExamModule />}
          {activeTab === "leaderboard" && <LeaderboardModule currentUser={currentUser} />}
          {activeTab === "achievements" && <AchievementsModule currentUser={currentUser} />}
          {activeTab === "profile" && <ProfileModule currentUser={currentUser} onOpenAuth={handleOpenAuth} onLogout={handleLogout} />}

          {/* Pricing page */}
          {activeTab === "pricing" && (
            <div className="card-duo p-12 text-center max-w-xl mx-auto my-12 space-y-4 animate-fadeIn">
              <Crown className="w-16 h-16 text-amber-400 mx-auto" />
              <h2 className="text-2xl font-black text-white">Nâng Cấp HaechiVN PRO</h2>
              <p className="text-xs text-slate-400">Gói PRO sẽ bao gồm: Không giới hạn thẻ Anki, AI Speaking, bộ đề TOPIK đầy đủ, và nhiều hơn nữa.</p>
              <p className="text-sm font-black text-amber-400">Đang phát triển – Sắp ra mắt!</p>
              <button onClick={() => setActiveTab("home")} className="btn-duo btn-duo-primary px-6 py-2.5 text-xs">Quay Về Trang Chủ</button>
            </div>
          )}

          {/* Placeholder views */}
          {["community", "chat", "feedback", "shop", "affiliate", "aispeaking"].includes(activeTab) && (
            <div className="card-duo p-12 text-center max-w-xl mx-auto my-12 space-y-4 animate-fadeIn select-none">
              <div className="w-16 h-16 rounded-3xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center text-2xl mx-auto">✨</div>
              <h2 className="text-xl font-black text-white capitalize">Tính Năng Đang Phát Triển</h2>
              <p className="text-xs text-slate-400">Phân hệ này đang được đội ngũ kĩ sư HaechiVN hoàn thiện và sẽ ra mắt trong bản cập nhật tiếp theo!</p>
              <button onClick={() => setActiveTab("home")} className="btn-duo btn-duo-primary px-6 py-2.5 text-xs">Quay Về Trang Chủ</button>
            </div>
          )}
        </main>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <AnkiImporter isOpen={isImporterOpen} onClose={() => setIsImporterOpen(false)} onImportSuccess={handleDeckImported} />
      <AuthModal isOpen={isAuthOpen} initialRegisterMode={authRegisterMode} onClose={() => setIsAuthOpen(false)} onSuccess={(user) => { setCurrentUser(user); setIsAuthOpen(false); }} />
    </div>
  );
}
