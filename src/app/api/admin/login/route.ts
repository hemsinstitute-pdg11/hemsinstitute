import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 });
    }
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !publishableKey) return NextResponse.json({ error: "Konfigurasi Supabase Auth belum lengkap." }, { status: 503 });
    const auth = createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await auth.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.user || data.user.app_metadata?.role !== "super_admin") {
      return NextResponse.json({ error: "Akun tidak memiliki akses Super Admin atau kredensial salah." }, { status: 401 });
    }
    if (!data.session) return NextResponse.json({ error: "Sesi login tidak berhasil dibuat." }, { status: 401 });
    const response = NextResponse.json({ ok: true });
    const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: 60 * 60 };
    response.cookies.set("hi_admin_access", data.session.access_token, options);
    response.cookies.set("hi_admin_refresh", data.session.refresh_token, options);
    return response;
  } catch {
    return NextResponse.json({ error: "Login gagal. Silakan coba kembali." }, { status: 500 });
  }
}
