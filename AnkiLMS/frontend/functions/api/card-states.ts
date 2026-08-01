import { Env, jsonResponse, errorResponse, authenticateRequest } from "./_utils";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const user = await authenticateRequest(request, env);

    if (!user) {
      return jsonResponse({ cardStates: [] });
    }

    const url = new URL(request.url);
    const deckId = url.searchParams.get("deckId");

    let query = "SELECT * FROM card_states WHERE user_id = ?";
    const params: any[] = [user.id];

    if (deckId) {
      query += " AND deck_id = ?";
      params.push(deckId);
    }

    const rows = await env.DB.prepare(query).bind(...params).all();
    return jsonResponse({ cardStates: rows.results || [] });
  } catch (e: any) {
    return errorResponse("Lỗi lấy trạng thái thẻ: " + e.message, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const user = await authenticateRequest(request, env);

    if (!user) {
      return errorResponse("Chưa đăng nhập.", 401);
    }

    const body = (await request.json()) as {
      deckId: string;
      cardId: number;
      interval: number;
      easeFactor: number;
      dueDate: string;
      reps: number;
      lapses: number;
      state: string;
    };

    const id = `cs_${user.id}_${body.deckId}_${body.cardId}`;

    await env.DB.prepare(
      `INSERT INTO card_states (id, user_id, deck_id, card_id, interval, ease_factor, due_date, reps, lapses, state, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id, deck_id, card_id) DO UPDATE SET
         interval = excluded.interval,
         ease_factor = excluded.ease_factor,
         due_date = excluded.due_date,
         reps = excluded.reps,
         lapses = excluded.lapses,
         state = excluded.state,
         updated_at = CURRENT_TIMESTAMP`
    ).bind(
      id,
      user.id,
      body.deckId,
      body.cardId,
      body.interval,
      body.easeFactor,
      body.dueDate,
      body.reps,
      body.lapses,
      body.state
    ).run();

    return jsonResponse({ success: true });
  } catch (e: any) {
    return errorResponse("Lỗi lưu trạng thái thẻ: " + e.message, 500);
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return jsonResponse({}, 200);
};
