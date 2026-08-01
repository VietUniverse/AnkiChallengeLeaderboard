import { Env, jsonResponse, errorResponse } from "../_utils";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const clientId = env.GOOGLE_CLIENT_ID;
  const siteUrl = env.SITE_URL || new URL(request.url).origin;

  if (!clientId) {
    return errorResponse("GOOGLE_CLIENT_ID chưa được cấu hình trong Cloudflare Environment Variables.", 500);
  }

  const redirectUri = `${siteUrl}/api/auth/callback`;
  const scope = encodeURIComponent("openid email profile");
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${scope}&access_type=online&prompt=select_account`;

  return Response.redirect(authUrl, 302);
};
