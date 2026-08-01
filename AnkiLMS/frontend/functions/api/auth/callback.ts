import { Env, jsonResponse, errorResponse, UserRow } from "../_utils";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const siteUrl = env.SITE_URL || url.origin;

    if (!code) {
      return Response.redirect(`${siteUrl}/?auth_error=no_code`, 302);
    }

    const clientId = env.GOOGLE_CLIENT_ID;
    const clientSecret = env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${siteUrl}/api/auth/callback`;

    if (!clientId || !clientSecret) {
      return Response.redirect(`${siteUrl}/?auth_error=missing_config`, 302);
    }

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      return Response.redirect(`${siteUrl}/?auth_error=token_failed`, 302);
    }

    const tokenData = (await tokenRes.json()) as { access_token: string; id_token: string };

    // Fetch user info from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      return Response.redirect(`${siteUrl}/?auth_error=userinfo_failed`, 302);
    }

    const googleUser = (await userRes.json()) as { id: string; email: string; name: string; picture?: string };

    const email = googleUser.email.toLowerCase();
    let user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first<UserRow>();

    if (!user) {
      const userId = "usr_" + crypto.randomUUID().substring(0, 8);
      await env.DB.prepare(
        `INSERT INTO users (id, email, password_hash, name, avatar_url, streak, xp, gems, level)
         VALUES (?, ?, NULL, ?, ?, 1, 50, 100, 1)`
      ).bind(userId, email, googleUser.name, googleUser.picture || null).run();

      user = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first<UserRow>();
    } else if (googleUser.picture && !user.avatar_url) {
      await env.DB.prepare("UPDATE users SET avatar_url = ? WHERE id = ?").bind(googleUser.picture, user.id).run();
    }

    if (!user) {
      return Response.redirect(`${siteUrl}/?auth_error=db_error`, 302);
    }

    // Create session token
    const token = "token_" + crypto.randomUUID();
    await env.SESSIONS.put(token, JSON.stringify({ userId: user.id, email: user.email, name: user.name }), {
      expirationTtl: 86400 * 30, // 30 days
    });

    // Redirect user to frontend home page with token param
    return Response.redirect(`${siteUrl}/?auth_token=${encodeURIComponent(token)}`, 302);
  } catch (e: any) {
    const siteUrl = env.SITE_URL || new URL(context.request.url).origin;
    return Response.redirect(`${siteUrl}/?auth_error=${encodeURIComponent(e.message)}`, 302);
  }
};
