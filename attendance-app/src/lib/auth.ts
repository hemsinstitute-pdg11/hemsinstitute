import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authClient, db } from "@/lib/db";
export async function currentUser(role: "teacher" | "attendance_admin") {
  const jar = await cookies();
  const token = jar.get("hi_attendance_access")?.value;
  if (!token) return null;
  const { data, error } = await authClient().auth.getUser(token);
  if (error || !data.user || data.user.app_metadata?.role !== role) return null;
  const client = db();
  const table = role === "teacher" ? "attendance_teachers" : "attendance_admins";
  const { data: profile } = await client.from(table).select("*").eq("auth_user_id", data.user.id).maybeSingle();
  if (!profile?.is_active) return null;
  return { user: data.user, profile };
}
export async function requireUser(role: "teacher" | "attendance_admin") {
  const result = await currentUser(role);
  if (!result) redirect(role === "teacher" ? "/teacher/login" : "/admin/login");
  return result;
}
export async function apiUser(token: string | undefined, role: "teacher" | "attendance_admin") {
  if (!token) return null;
  const { data, error } = await authClient().auth.getUser(token);
  if (error || !data.user || data.user.app_metadata?.role !== role) return null;
  const table = role === "teacher" ? "attendance_teachers" : "attendance_admins";
  const { data: profile } = await db().from(table).select("*").eq("auth_user_id", data.user.id).maybeSingle();
  if (!profile?.is_active) return null;
  return { user: data.user, profile };
}
