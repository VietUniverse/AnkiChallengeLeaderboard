export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "streak" | "level" | "learning" | "social";
  reqValue: number;
}

export const ACHIEVEMENTS_DATA: AchievementBadge[] = [
  {
    id: "streak_3",
    name: "Khởi Đầu May Mắn",
    description: "Duy trì chuỗi học 3 ngày liên tiếp",
    icon: "🔥",
    category: "streak",
    reqValue: 3,
  },
  {
    id: "streak_7",
    name: "Tuần Đầu Tiên Tuân Thủ",
    description: "Học liên tục 7 ngày không ngắt quãng",
    icon: "⚡",
    category: "streak",
    reqValue: 7,
  },
  {
    id: "streak_30",
    name: "Chiến Binh Kiên Trì",
    description: "Đạt mốc Streak 30 ngày rực rỡ",
    icon: "🌟",
    category: "streak",
    reqValue: 30,
  },
  {
    id: "streak_100",
    name: "Huyền Thoại Anki",
    description: "Chinh phục 100 ngày Streak thần thánh",
    icon: "👑",
    category: "streak",
    reqValue: 100,
  },
  {
    id: "level_5",
    name: "Học Viên Tiềm Năng",
    description: "Đạt đến Cấp 5 (Level 5)",
    icon: "🌱",
    category: "level",
    reqValue: 5,
  },
  {
    id: "level_10",
    name: "Chuyên Gia Tiếng Hàn",
    description: "Đạt đến Cấp 10 (Level 10)",
    icon: "🎯",
    category: "level",
    reqValue: 10,
  },
  {
    id: "level_20",
    name: "Bậc Thầy Haechi",
    description: "Vượt qua mốc Cấp 20 (Level 20)",
    icon: "💎",
    category: "level",
    reqValue: 20,
  },
  {
    id: "cards_50",
    name: "Thuộc 50 Từ Vựng",
    description: "Ghi nhớ thành công 50 thẻ từ vựng Anki",
    icon: "📚",
    category: "learning",
    reqValue: 50,
  },
  {
    id: "hangeul_master",
    name: "Master Hangeul",
    description: "Hoàn thành toàn bộ bảng chữ cái Hàn Quốc",
    icon: "🇰🇷",
    category: "learning",
    reqValue: 40,
  },
  {
    id: "topik_pass",
    name: "Thử Thách TOPIK",
    description: "Hoàn thành 1 đề thi TOPIK với kết quả > 70%",
    icon: "📝",
    category: "learning",
    reqValue: 1,
  },
  {
    id: "dictation_hero",
    name: "Tai Nghe Siêu Cấp",
    description: "Hoàn thành 10 bài luyện nghe chính tả",
    icon: "🎧",
    category: "learning",
    reqValue: 10,
  },
];
