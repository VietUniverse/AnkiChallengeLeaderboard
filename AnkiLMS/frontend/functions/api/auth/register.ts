import { Env, jsonResponse, errorResponse, hashPassword, UserRow } from "../_utils";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const body = (await request.json()) as { email?: string; password?: string; name?: string };

    if (!body.email || !body.password) {
      return errorResponse("Vui lòng nhập Email và Mật khẩu đầy đủ.");
    }

    const email = body.email.trim().toLowerCase();
    const name = (body.name || email.split("@")[0]).trim();
    const password = body.password.trim();

    if (password.length < 6) {
      return errorResponse("Mật khẩu phải từ 6 ký tự trở lên.");
    }

    // Check if email already exists
    const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (existing) {
      return errorResponse("Email này đã được đăng ký tài khoản!");
    }

    const userId = "usr_" + crypto.randomUUID().substring(0, 8);
    const passHash = await hashPassword(password);

    await env.DB.prepare(
      `INSERT INTO users (id, email, password_hash, name, streak, xp, gems, level)
       VALUES (?, ?, ?, ?, 1, 50, 100, 1)`
    ).bind(userId, email, passHash, name).run();

    // Create session token
    const token = "token_" + crypto.randomUUID();
    await env.SESSIONS.put(token, JSON.stringify({ userId, email, name }), {
      expirationTtl: 86400 * 30, // 30 days
    });

    const user = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first<UserRow>();

    return jsonResponse({
      token,
      user: {
        id: user?.id,
        email: user?.email,
        name: user?.name,
        avatar_url: user?.avatar_url,
        streak: user?.streak || 1,
        longest_streak: user?.longest_streak || 1,
        xp: user?.xp || 50,
        gems: user?.gems || 100,
        level: user?.level || 1,
      },
    });
  } catch (e: any) {
    return errorResponse("Lỗi server: " + e.message, 500);
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return jsonResponse({}, 200);
};
