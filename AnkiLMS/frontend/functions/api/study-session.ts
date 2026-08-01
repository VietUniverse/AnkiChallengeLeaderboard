import { Env, jsonResponse, errorResponse, authenticateRequest } from "./_utils";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const user = await authenticateRequest(request, env);

    if (!user) {
      return errorResponse("Chưa đăng nhập.", 401);
    }

    const body = (await request.json()) as {
      module: string;
      cardsReviewed?: number;
      correctCount?: number;
      xpEarned?: number;
      durationSeconds?: number;
    };

    const xpEarned = Math.max(0, body.xpEarned || 10);
    const durationMinutes = Math.ceil((body.durationSeconds || 60) / 60);
    const sessionId = "ses_" + crypto.randomUUID().substring(0, 8);

    await env.DB.prepare(
      `INSERT INTO study_sessions (id, user_id, module, cards_reviewed, correct_count, xp_earned, duration_seconds)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      sessionId,
      user.id,
      body.module || "general",
      body.cardsReviewed || 0,
      body.correctCount || 0,
      xpEarned,
      body.durationSeconds || 0
    ).run();

    // Update user XP & Level
    const newXp = user.xp + xpEarned;
    const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

    await env.DB.prepare(
      `UPDATE users SET xp = ?, level = ? WHERE id = ?`
    ).bind(newXp, newLevel, user.id).run();

    // Check checkin status for today
    const now = new Date();
    const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const todayStr = vnTime.toISOString().split("T")[0];

    const checkin = await env.DB.prepare(
      "SELECT id, time_spent_minutes, cards_reviewed FROM checkins WHERE user_id = ? AND checkin_date = ?"
    ).bind(user.id, todayStr).first<{ id: string; time_spent_minutes: number; cards_reviewed: number }>();

    if (checkin) {
      await env.DB.prepare(
        `UPDATE checkins
         SET time_spent_minutes = time_spent_minutes + ?,
             cards_reviewed = cards_reviewed + ?,
             xp_earned = xp_earned + ?
         WHERE id = ?`
      ).bind(durationMinutes, body.cardsReviewed || 0, xpEarned, checkin.id).run();
    }

    return jsonResponse({
      success: true,
      xpEarned,
      user: {
        id: user.id,
        xp: newXp,
        level: newLevel,
        gems: user.gems,
      },
    });
  } catch (e: any) {
    return errorResponse("Lỗi lưu phiên học: " + e.message, 500);
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return jsonResponse({}, 200);
};
