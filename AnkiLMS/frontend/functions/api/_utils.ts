export interface Env {
  DB: D1Database;
  SESSIONS: KVNamespace;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  SITE_URL?: string;
}

export interface UserRow {
  id: string;
  email: string;
  password_hash: string | null;
  name: string;
  avatar_url: string | null;
  streak: number;
  longest_streak: number;
  xp: number;
  gems: number;
  level: number;
  last_checkin_date: string | null;
  created_at: string;
}

export function jsonResponse(data: any, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      ...headers,
    },
  });
}

export function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}

// Password Hashing via SHA-256 (Web Crypto API)
export async function hashPassword(password: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(password + "_haechivn_salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Session Auth Helper
export async function authenticateRequest(request: Request, env: Env): Promise<UserRow | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) return null;

  try {
    const sessionDataStr = await env.SESSIONS.get(token);
    if (!sessionDataStr) return null;
    const sessionData = JSON.parse(sessionDataStr);

    const user = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(sessionData.userId).first<UserRow>();
    return user || null;
  } catch (e) {
    return null;
  }
}
