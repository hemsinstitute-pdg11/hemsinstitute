import { getSupabaseAdmin } from "@/lib/supabase-server";
import AdminTeacherManager from "@/components/admin-teacher-manager";
export const dynamic = "force-dynamic";
export default async function TeachersPage() {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("attendance_teachers").select("id,teacher_code,full_name,email,is_active").order("full_name");
  return <div className="admin-content"><div className="admin-heading"><div><span className="admin-eyebrow">ABSENSI</span><h1>Data Guru</h1><p>Kelola akun login dan identitas guru.</p></div></div>{error ? <div className="admin-error">Data guru belum dapat dimuat. Pastikan migrasi absensi sudah diterapkan.</div> : <AdminTeacherManager initialTeachers={data || []} />}</div>;
}
