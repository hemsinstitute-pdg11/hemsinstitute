import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export async function requireAdminApi(req: NextRequest) {
  const token = req.cookies.get("hi_admin_access")?.value;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !url || !key) return { user: null, response: NextResponse.json({ error: "Sesi admin tidak valid. Silakan login kembali." }, { status: 401 }) };
  const auth = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await auth.auth.getUser(token);
  if (error || !data.user || data.user.app_metadata?.role !== "super_admin") return { user: null, response: NextResponse.json({ error: "Akses ditolak." }, { status: 403 }) };
  return { user: data.user, response: null };
}
