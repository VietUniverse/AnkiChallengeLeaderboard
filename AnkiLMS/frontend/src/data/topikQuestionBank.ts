export interface TopikQuestion {
  id: number;
  section: "reading" | "listening" | "grammar";
  level: "TOPIK I (Sơ cấp)" | "TOPIK II (Trung cấp)";
  passage?: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-indexed
  explanation: string;
}

export const TOPIK_QUESTION_BANK: TopikQuestion[] = [
  {
    id: 1,
    section: "reading",
    level: "TOPIK I (Sơ cấp)",
    passage: "저는 오늘 도서관에 갔습니다. 도서관에서 한국어 책을 읽었습니다. 책이 아주 재미있었습니다.",
    question: "이 사람은 오늘 도서관에서 무엇을 했습니까?",
    options: [
      "친구를 만났습니다.",
      "한국어 책을 읽었습니다.",
      "공부하지 않고 잤습니다.",
      "음식을 먹었습니다."
    ],
    correctAnswer: 1,
    explanation: "Đoạn văn ghi rõ: '도서관에서 한국어 책을 읽었습니다' (Tôi đã đọc sách tiếng Hàn ở thư viện)."
  },
  {
    id: 2,
    section: "reading",
    level: "TOPIK I (Sơ cấp)",
    passage: "내일은 제 생일입니다. 그래서 친구들과 함께 맛있는 음식을 먹으려고 합니다. 케이크도 살 것입니다.",
    question: "이 사람은 내일 무엇을 할 예정입니까?",
    options: [
      "생일 파티를 하고 친구들과 음식을 먹습니다.",
      "혼자 집에 있습니다.",
      "학교에 시험을 보러 갑니다.",
      "여행을 떠납니다."
    ],
    correctAnswer: 0,
    explanation: "Nhân vật sẽ đón sinh nhật vào ngày mai ('내일은 제 생일입니다') và ăn ngon cùng bạn bè."
  },
  {
    id: 3,
    section: "grammar",
    level: "TOPIK I (Sơ cấp)",
    question: "다음 빈칸에 들어갈 가장 알맞은 것을 고르십시오: '저는 식당(  ) 밥을 먹습니다.'",
    options: ["에", "에서", "을", "과"],
    correctAnswer: 1,
    explanation: "Điền trợ từ chỉ nơi chốn diễn ra hành động: '에서' (ở/tại nhà hàng)."
  },
  {
    id: 4,
    section: "grammar",
    level: "TOPIK I (Sơ cấp)",
    question: "다음 빈칸에 들어갈 가장 알맞은 것을 고르십시오: '날씨가 아주 (  ).'",
    options: ["춥습니다", "추워서", "추우면", "춥고"],
    correctAnswer: 0,
    explanation: "Đuôi câu trần thuật trang trọng kết thúc ở thì hiện tại: '춥습니다' (Rất lạnh)."
  },
  {
    id: 5,
    section: "listening",
    level: "TOPIK I (Sơ cấp)",
    passage: "남: 이 사과 얼마예요?\n여: 한 개에 천 원입니다.",
    question: "여자는 무엇을 하고 있습니까?",
    options: [
      "사과 가격을 안내하고 있습니다.",
      "사과를 먹고 있습니다.",
      "사과를 씻고 있습니다.",
      "사과를 버리고 있습니다."
    ],
    correctAnswer: 0,
    explanation: "Người phụ nữ trả lời giá quả táo: '1,000 won / 1 quả'."
  },
  {
    id: 6,
    section: "grammar",
    level: "TOPIK I (Sơ cấp)",
    question: "다음 빈칸에 들어갈 가장 알맞은 것을 고르십시오: '한국어를 (  ) 한국으로 여행을 가고 싶어요.'",
    options: ["배우면", "배워서", "배우고", "배우지만"],
    correctAnswer: 1,
    explanation: "'배워서' (Học rồi/vì học nên Muốn đi du lịch Hàn Quốc)."
  },
  {
    id: 7,
    section: "reading",
    level: "TOPIK I (Sơ cấp)",
    passage: "저는 주말에 산에 갑니다. 산에서 등산을 하면 기분이 아주 좋아집니다. 공기도 깨끗합니다.",
    question: "이 사람은 왜 산에 갑니까?",
    options: [
      "등산을 하면 기분이 좋아지고 공기가 깨끗해서",
      "산에서 쇼핑을 하기 위해",
      "친구를 기다리기 위해",
      "일을 하기 위해"
    ],
    correctAnswer: 0,
    explanation: "Nhân vật thích đi núi vì leo núi làm tâm trạng tốt hơn và không khí sạch."
  },
  {
    id: 8,
    section: "grammar",
    level: "TOPIK I (Sơ cấp)",
    question: "다음 중 의미가 반대인 단어 쌍은 무엇입니까?",
    options: [
      "크다 - 작다",
      "좋다 - 예쁘다",
      "오다 - 가다 (X)",
      "빠르다 - 느리다"
    ],
    correctAnswer: 0,
    explanation: "'크다' (to/lớn) trái nghĩa với '작다' (nhỏ/bé)."
  }
];
