import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { requireAdminApi } from "@/lib/admin-api-auth";
export async function POST(req: NextRequest) {
  const auth = await requireAdminApi(req);
  if (auth.response) return auth.response;
  try {
    const body = await req.json();
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const teacherCode = typeof body.teacherCode === "string" ? body.teacherCode.trim().toUpperCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!fullName || !email || !teacherCode || password.length < 8 || !/^[A-Z0-9_-]{3,30}$/.test(teacherCode)) return NextResponse.json({ error: "Lengkapi nama, email, ID guru (3-30 karakter), dan password minimal 8 karakter." }, { status: 400 });
    const db = getSupabaseAdmin();
    const { data: existing } = await db.from("attendance_teachers").select("id").eq("teacher_code", teacherCode).maybeSingle();
    if (existing) return NextResponse.json({ error: "ID guru sudah digunakan." }, { status: 409 });
    const { data: created, error: createError } = await db.auth.admin.createUser({ email, password, email_confirm: true, app_metadata: { role: "teacher" }, user_metadata: { full_name: fullName } });
    if (createError || !created.user) return NextResponse.json({ error: createError?.message || "Akun guru gagal dibuat." }, { status: 400 });
    const { error: profileError } = await db.from("attendance_teachers").insert({ auth_user_id: created.user.id, teacher_code: teacherCode, full_name: fullName, email, is_active: true });
    if (profileError) { await db.auth.admin.deleteUser(created.user.id); return NextResponse.json({ error: "Profil guru gagal disimpan: " + profileError.message }, { status: 400 }); }
    return NextResponse.json({ ok: true, message: "Akun guru berhasil dibuat." });
  } catch { return NextResponse.json({ error: "Permintaan tidak dapat diproses." }, { status: 500 }); }
}
