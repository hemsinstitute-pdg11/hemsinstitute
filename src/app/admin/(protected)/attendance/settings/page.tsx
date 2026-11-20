import { getSupabaseAdmin } from "@/lib/supabase-server";
import AdminAttendanceLocation from "@/components/admin-attendance-location";
export const dynamic = "force-dynamic";
export default async function AttendanceSettingsPage() {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("attendance_settings").select("*").eq("id", 1).single();
  return <div className="admin-content"><div className="admin-heading"><div><span className="admin-eyebrow">ABSENSI / KONFIGURASI</span><h1>Pengaturan Lokasi</h1><p>Atur titik pusat dan radius geofencing absensi.</p></div></div>{error || !data ? <div className="admin-error">Pengaturan belum tersedia. Terapkan migrasi database 002_online_attendance.sql.</div> : <AdminAttendanceLocation initial={data} />}</div>;
}
