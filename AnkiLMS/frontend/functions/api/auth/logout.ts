import { Env, jsonResponse } from "../_utils";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      if (token) {
        await env.SESSIONS.delete(token);
      }
    }
    return jsonResponse({ success: true, message: "Đã đăng xuất" });
  } catch (e: any) {
    return jsonResponse({ success: true });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return jsonResponse({}, 200);
};
