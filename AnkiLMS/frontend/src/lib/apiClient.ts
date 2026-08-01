import { AnkiDeck } from "./ankiParser";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  streak: number;
  longest_streak?: number;
  xp: number;
  gems: number;
  level: number;
  last_checkin_date?: string;
}

const LOCAL_STORAGE_TOKEN_KEY = "haechivn_auth_token";
const LOCAL_STORAGE_USER_KEY = "haechivn_user_profile";
const LOCAL_STORAGE_DECKS_KEY = "haechivn_decks";

export class ApiClient {
  public static getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
  }

  public static setSession(token: string, user: UserProfile) {
    if (typeof window === "undefined") return;
    localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, token);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
  }

  public static getCurrentUser(): UserProfile | null {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  }

  public static async fetchMe(): Promise<UserProfile | null> {
    const token = this.getToken();
    if (!token) return this.getCurrentUser();

    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        return this.getCurrentUser();
      }
      const data = await res.json();
      if (data.user) {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(data.user));
        return data.user;
      }
    } catch (e) {
      console.warn("Offline or API error, fallback to local user");
    }
    return this.getCurrentUser();
  }

  public static async login(email: string, password?: string): Promise<UserProfile> {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: password || "123456" }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Đăng nhập thất bại");
    }
    this.setSession(data.token, data.user);
    return data.user;
  }

  public static async register(email: string, name: string, password?: string): Promise<UserProfile> {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password: password || "123456" }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Đăng ký thất bại");
    }
    this.setSession(data.token, data.user);
    return data.user;
  }

  public static loginWithGoogle() {
    window.location.href = "/api/auth/google";
  }

  public static async logout(): Promise<void> {
    const token = this.getToken();
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {}
    }
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  }

  public static async checkin(): Promise<{ alreadyCheckedIn: boolean; message: string; user?: UserProfile }> {
    const token = this.getToken();
    if (!token) {
      throw new Error("Vui lòng đăng nhập để điểm danh");
    }

    const res = await fetch("/api/checkin", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Điểm danh thất bại");
    if (data.user) {
      const currentUser = this.getCurrentUser();
      const updated = { ...currentUser, ...data.user };
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));
    }
    return data;
  }

  public static async getLeaderboard(): Promise<UserProfile[]> {
    try {
      const res = await fetch("/api/leaderboard");
      if (res.ok) {
        const data = await res.json();
        return data.leaderboard || [];
      }
    } catch (e) {}
    // Trả mảng rỗng – không dùng dữ liệu giả
    return [];
  }

  public static async getHeatmapData(): Promise<{ checkin_date: string; time_spent_minutes: number; xp_earned: number }[]> {
    const token = this.getToken();
    if (!token) return [];
    try {
      const res = await fetch("/api/heatmap", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        return data.checkins || [];
      }
    } catch (e) {}
    return [];
  }

  public static async recordStudySession(moduleName: string, cardsReviewed: number, correctCount: number, xpEarned: number, durationSeconds: number) {
    const token = this.getToken();
    const user = this.getCurrentUser();
    if (user) {
      user.xp += xpEarned;
      user.level = Math.floor(Math.sqrt(user.xp / 100)) + 1;
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    }

    if (!token) return;
    try {
      await fetch("/api/study-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          module: moduleName,
          cardsReviewed,
          correctCount,
          xpEarned,
          durationSeconds,
        }),
      });
    } catch (e) {}
  }

  public static saveDecks(decks: AnkiDeck[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(LOCAL_STORAGE_DECKS_KEY, JSON.stringify(decks));
  }

  public static getSavedDecks(): AnkiDeck[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(LOCAL_STORAGE_DECKS_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }
}
