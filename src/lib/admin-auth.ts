import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export async function requireSuperAdmin() {
  const jar = await cookies();
  const accessToken = jar.get("hi_admin_access")?.value;
  if (!accessToken) redirect("/admin/login");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Supabase Auth belum dikonfigurasi.");
  const auth = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await auth.auth.getUser(accessToken);
  if (error || !data.user || data.user.app_metadata?.role !== "super_admin") redirect("/admin/login");
  return data.user;
}
