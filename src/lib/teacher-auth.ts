import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase-server";
function getAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase Auth belum dikonfigurasi.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
export async function requireTeacher() {
  const jar = await cookies();
  const token = jar.get("hi_teacher_access")?.value;
  if (!token) redirect("/teacher/login");
  const { data, error } = await getAuthClient().auth.getUser(token);
  if (error || !data.user || data.user.app_metadata?.role !== "teacher") redirect("/teacher/login");
  const db = getSupabaseAdmin();
  const { data: teacher, error: profileError } = await db.from("attendance_teachers").select("id,teacher_code,full_name,email,is_active").eq("auth_user_id", data.user.id).maybeSingle();
  if (profileError || !teacher || !teacher.is_active) redirect("/teacher/login");
  return { user: data.user, teacher };
}
export async function getTeacherForApi(token: string | undefined) {
  if (!token) return null;
  const { data, error } = await getAuthClient().auth.getUser(token);
  if (error || !data.user || data.user.app_metadata?.role !== "teacher") return null;
  const db = getSupabaseAdmin();
  const { data: teacher } = await db.from("attendance_teachers").select("id,teacher_code,full_name,email,is_active").eq("auth_user_id", data.user.id).maybeSingle();
  if (!teacher || !teacher.is_active) return null;
  return { user: data.user, teacher };
}
