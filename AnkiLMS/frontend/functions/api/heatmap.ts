import { Env, jsonResponse, errorResponse, authenticateRequest } from "./_utils";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const user = await authenticateRequest(request, env);

    if (!user) {
      return jsonResponse({ checkins: [] });
    }

    // Fetch checkins for user in the last 90 days
    const rows = await env.DB.prepare(
      `SELECT checkin_date, xp_earned, time_spent_minutes, cards_reviewed
       FROM checkins
       WHERE user_id = ?
       ORDER BY checkin_date DESC
       LIMIT 90`
    ).bind(user.id).all();

    return jsonResponse({
      checkins: rows.results || [],
    });
  } catch (e: any) {
    return errorResponse("Lỗi lấy dữ liệu heatmap: " + e.message, 500);
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return jsonResponse({}, 200);
};
