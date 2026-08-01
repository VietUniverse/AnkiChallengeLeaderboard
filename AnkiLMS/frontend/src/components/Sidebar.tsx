"use client";

import React, { useState } from "react";
import {
  Home,
  BookOpen,
  Headphones,
  Repeat,
  BookText,
  Mic,
  GraduationCap,
  Gamepad2,
  Brain,
  MessageSquare,
  Trophy,
  MessagesSquare,
  MessageSquareHeart,
  ShoppingBag,
  Gift,
  Crown,
  ChevronsLeft,
  ChevronsRight,
  Upload,
  LogOut,
  Award,
  User,
} from "lucide-react";

export type ModuleTab =
  | "home"
  | "hangeul"
  | "review"
  | "dictation"
  | "shadowing"
  | "aispeaking"
  | "topik"
  | "leaderboard"
  | "achievements"
  | "community"
  | "chat"
  | "feedback"
  | "shop"
  | "affiliate"
  | "pricing"
  | "profile";

interface SidebarProps {
  activeTab: ModuleTab;
  onTabChange: (tab: ModuleTab) => void;
  onOpenImporter: () => void;
  onOpenAuth: (isRegisterMode?: boolean) => void;
  currentUser: any;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenImporter,
  onOpenAuth,
  currentUser,
  onLogout,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const mainNav = [
    { id: "home" as ModuleTab, label: "Trang chủ", icon: Home },
    { id: "hangeul" as ModuleTab, label: "Bảng Hangeul", icon: BookOpen },
    { id: "review" as ModuleTab, label: "Từ vựng SRS / Ôn Anki", icon: Brain },
    { id: "dictation" as ModuleTab, label: "Luyện nghe chính tả", icon: Headphones },
    { id: "shadowing" as ModuleTab, label: "Shadowing", icon: Repeat },
    { id: "aispeaking" as ModuleTab, label: "Nói cùng AI", icon: Mic, badge: "AI" },
    { id: "topik" as ModuleTab, label: "Luyện thi TOPIK I/II", icon: GraduationCap, badge: "HOT" },
  ];

  const communityNav = [
    { id: "leaderboard" as ModuleTab, label: "Bảng xếp hạng", icon: Trophy },
    { id: "achievements" as ModuleTab, label: "Huy hiệu & Mốc thưởng", icon: Award },
    { id: "community" as ModuleTab, label: "Cộng đồng Haechi", icon: MessageSquare },
    { id: "chat" as ModuleTab, label: "Phòng Trò chuyện", icon: MessagesSquare },
    { id: "feedback" as ModuleTab, label: "Góp ý & Đánh giá", icon: MessageSquareHeart },
  ];

  const otherNav = [
    { id: "shop" as ModuleTab, label: "Cửa hàng Đổi quà", icon: ShoppingBag },
    { id: "affiliate" as ModuleTab, label: "Mời bạn bè", icon: Gift, badge: "MỚI" },
    { id: "pricing" as ModuleTab, label: "Nâng cấp PRO", icon: Crown },
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col border-r-2 border-[#19284d] bg-[#0b1329] h-screen sticky top-0 justify-between z-30 select-none transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* HaechiVN Brand Header */}
      <div
        onClick={() => onTabChange("home")}
        className="flex h-16 items-center border-b-2 border-[#19284d] px-4 shrink-0 justify-between cursor-pointer hover:bg-[#132247] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/30 border border-blue-400/40 shrink-0">
            해
          </div>
          {!collapsed && (
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight block leading-none">
                HaechiVN
              </span>
              <span className="text-[9px] font-bold text-sky-400 tracking-wider">Tiếng Hàn & Anki LMS</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Anki Import Quick Button */}
        {!collapsed ? (
          <button
            onClick={onOpenImporter}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 active:translate-y-[1px] border-b-4 border-indigo-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Upload className="w-4 h-4 animate-bounce text-yellow-300" />
            <span>Kéo Thả Thẻ Anki (.apkg)</span>
          </button>
        ) : (
          <button
            onClick={onOpenImporter}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:brightness-110 text-white flex items-center justify-center"
            title="Import Anki"
          >
            <Upload className="w-4 h-4" />
          </button>
        )}

        {/* Main Section */}
        <nav className="space-y-1">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-xs transition-all duration-150 border-2 ${
                  isActive
                    ? "bg-[#2563eb]/20 border-[#2563eb]/60 text-[#38bdf8] shadow-sm"
                    : "border-transparent text-[#8b9bb4] hover:bg-[#132247] hover:border-[#1e3a70] hover:text-white"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="tracking-normal">{item.label}</span>}
                </div>
                {!collapsed && item.badge && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-gradient-to-r from-rose-500 to-amber-500 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Divider & Community Section */}
        <div className="pt-2 border-t border-[#19284d]">
          {!collapsed && (
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#64748b]">
              CỘNG ĐỒNG & XẾP HẠNG
            </p>
          )}
          <div className="space-y-1 mt-1">
            {communityNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-xs transition-all border-2 ${
                    isActive
                      ? "bg-[#2563eb]/20 border-[#2563eb]/60 text-[#38bdf8]"
                      : "border-transparent text-[#8b9bb4] hover:bg-[#132247] hover:border-[#1e3a70] hover:text-white"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider & Other Section */}
        <div className="pt-2 border-t border-[#19284d]">
          <div className="space-y-1">
            {otherNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-xs transition-all border-2 ${
                    isActive
                      ? "bg-[#2563eb]/20 border-[#2563eb]/60 text-[#38bdf8]"
                      : "border-transparent text-[#8b9bb4] hover:bg-[#132247] hover:border-[#1e3a70] hover:text-white"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                  {!collapsed && item.badge && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-gradient-to-r from-rose-500 to-amber-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Action Area: Login / User Profile */}
      <div className="p-3 space-y-2 border-t-2 border-[#19284d] bg-[#090f1d] shrink-0">
        {currentUser ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#132247] border border-[#1e3a70]">
            <button
              onClick={() => onTabChange("profile")}
              className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity"
            >
              {currentUser.avatar_url ? (
                <img src={currentUser.avatar_url} alt={currentUser.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
                  {currentUser.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              {!collapsed && (
                <div className="min-w-0">
                  <span className="font-bold text-xs text-white block truncate">{currentUser.name}</span>
                  <span className="text-[10px] text-amber-400 font-semibold block">
                    Lv.{currentUser.level || 1} • {currentUser.xp || 0} XP
                  </span>
                </div>
              )}
            </button>
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors shrink-0"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onOpenAuth(false)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] active:translate-y-[1px] border-b-4 border-[#1e40af] text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all"
          >
            {collapsed ? <User className="w-4 h-4 mx-auto" /> : "ĐĂNG NHẬP HAECHIVN"}
          </button>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-1.5 text-xs font-bold text-[#8b9bb4] hover:text-white transition-colors"
        >
          {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
          {!collapsed && <span>{collapsed ? "Mở rộng" : "Thu gọn"}</span>}
        </button>
      </div>
    </aside>
  );
};
