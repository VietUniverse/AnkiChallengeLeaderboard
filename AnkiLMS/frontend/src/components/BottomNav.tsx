"use client";

import React from "react";
import { Home, BookOpen, Layers, Trophy, User } from "lucide-react";
import { ModuleTab } from "./Sidebar";

interface BottomNavProps {
  activeTab: ModuleTab;
  onTabChange: (tab: ModuleTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const items = [
    { id: "home" as ModuleTab, label: "Trang chủ", icon: Home },
    { id: "hangeul" as ModuleTab, label: "Học tập", icon: BookOpen },
    { id: "review" as ModuleTab, label: "Ôn Anki", icon: Layers },
    { id: "leaderboard" as ModuleTab, label: "Xếp hạng", icon: Trophy },
    { id: "profile" as ModuleTab, label: "Hồ sơ", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b1329]/95 backdrop-blur-md border-t border-[#19284d] px-2 py-2 flex items-center justify-around select-none">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
              isActive ? "text-blue-400 bg-blue-500/10 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
