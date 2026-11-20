import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase-server";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return NextResponse.json({ error: "Konfigurasi Supabase belum lengkap." }, { status: 503 });
    const auth = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await auth.auth.signInWithPassword({ email, password });
    if (error || !data.user || data.user.app_metadata?.role !== "teacher" || !data.session) return NextResponse.json({ error: "Email/password salah atau akun bukan akun guru aktif." }, { status: 401 });
    const db = getSupabaseAdmin();
    const { data: teacher } = await db.from("attendance_teachers").select("id,is_active").eq("auth_user_id", data.user.id).maybeSingle();
    if (!teacher || !teacher.is_active) return NextResponse.json({ error: "Akun guru belum diaktifkan. Hubungi admin." }, { status: 403 });
    const response = NextResponse.json({ ok: true });
    const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: 60 * 60 };
    response.cookies.set("hi_teacher_access", data.session.access_token, options);
    response.cookies.set("hi_teacher_refresh", data.session.refresh_token, options);
    return response;
  } catch { return NextResponse.json({ error: "Login gagal. Silakan coba kembali." }, { status: 500 }); }
}
