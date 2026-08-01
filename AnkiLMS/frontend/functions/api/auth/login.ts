import { Env, jsonResponse, errorResponse, hashPassword, UserRow } from "../_utils";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const body = (await request.json()) as { email?: string; password?: string };

    if (!body.email || !body.password) {
      return errorResponse("Vui lòng nhập Email và Mật khẩu.");
    }

    const email = body.email.trim().toLowerCase();
    const password = body.password.trim();

    const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first<UserRow>();
    if (!user) {
      return errorResponse("Tài khoản email này chưa tồn tại.");
    }

    if (user.password_hash) {
      const passHash = await hashPassword(password);
      if (passHash !== user.password_hash) {
        return errorResponse("Mật khẩu không chính xác.");
      }
    }

    // Create session token
    const token = "token_" + crypto.randomUUID();
    await env.SESSIONS.put(token, JSON.stringify({ userId: user.id, email: user.email, name: user.name }), {
      expirationTtl: 86400 * 30, // 30 days
    });

    return jsonResponse({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        streak: user.streak,
        longest_streak: user.longest_streak,
        xp: user.xp,
        gems: user.gems,
        level: user.level,
        last_checkin_date: user.last_checkin_date,
      },
    });
  } catch (e: any) {
    return errorResponse("Lỗi server: " + e.message, 500);
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return jsonResponse({}, 200);
};
