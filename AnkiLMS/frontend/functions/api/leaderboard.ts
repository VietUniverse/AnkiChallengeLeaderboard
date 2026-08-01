import { Env, jsonResponse, errorResponse } from "./_utils";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { env } = context;

    // Fetch top 20 users by XP
    const topUsers = await env.DB.prepare(
      `SELECT id, name, avatar_url, xp, streak, level, gems, created_at
       FROM users
       ORDER BY xp DESC
       LIMIT 20`
    ).all();

    return jsonResponse({
      leaderboard: topUsers.results || [],
    });
  } catch (e: any) {
    return errorResponse("Lỗi lấy bảng xếp hạng: " + e.message, 500);
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return jsonResponse({}, 200);
};
