import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-server";
export const dynamic = "force-dynamic";
function jakartaDate() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (type: string) => parts.find(p => p.type === type)?.value || "";
  return get("year") + "-" + get("month") + "-" + get("day");
}
function clock(v: string | null) { return v ? new Date(v).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" }) : "—"; }
export default async function AttendanceAdminPage() {
  const db = getSupabaseAdmin(), today = jakartaDate();
  const [{ count: teacherCount }, { count: presentCount }, { data: rows, error }, { data: settings }] = await Promise.all([
    db.from("attendance_teachers").select("id", { count: "exact", head: true }).eq("is_active", true),
    db.from("attendance_records").select("id", { count: "exact", head: true }).eq("work_date", today),
    db.from("attendance_records").select("id,work_date,check_in_at,check_out_at,check_in_distance_m,check_out_distance_m,attendance_teachers(teacher_code,full_name)").order("work_date", { ascending: false }).order("check_in_at", { ascending: false }).limit(100),
    db.from("attendance_settings").select("location_verified,radius_m").eq("id", 1).single()
  ]);
  return <div className="admin-content">
    <div className="admin-heading"><div><span className="admin-eyebrow">MANAJEMEN SDM</span><h1>Absensi Guru</h1><p>Monitoring kehadiran masuk dan pulang.</p></div><div className="flex flex-wrap gap-2"><Link className="admin-link-button admin-primary" href="/admin/attendance/settings">Pengaturan Lokasi</Link><Link className="admin-link-button admin-secondary" href="/admin/teachers">Data Guru</Link></div></div>
    <section className="admin-stat-grid"><article className="admin-stat"><span>Guru Aktif</span><strong>{teacherCount ?? 0}</strong><small>Akun terdaftar</small></article><article className="admin-stat"><span>Hadir Hari Ini</span><strong>{presentCount ?? 0}</strong><small>Dari {teacherCount ?? 0} guru aktif</small></article><article className="admin-stat"><span>Belum Hadir</span><strong>{Math.max(0,(teacherCount ?? 0)-(presentCount ?? 0))}</strong><small>Belum check-in hari ini</small></article><article className="admin-stat"><span>Geofence</span><strong>{settings?.radius_m ?? 50} m</strong><small>{settings?.location_verified ? "Lokasi aktif" : "Menunggu verifikasi lokasi"}</small></article></section>
    <section className="admin-panel"><div className="admin-panel-head"><div><h2>Riwayat Absensi</h2><p>100 catatan terbaru</p></div></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Tanggal</th><th>ID Guru</th><th>Nama Guru</th><th>Masuk</th><th>Pulang</th><th>Jarak GPS</th></tr></thead><tbody>{(rows || []).map((r: any)=><tr key={r.id}><td>{r.work_date}</td><td>{r.attendance_teachers?.teacher_code || "—"}</td><td>{r.attendance_teachers?.full_name || "—"}</td><td>{clock(r.check_in_at)}</td><td>{clock(r.check_out_at)}</td><td>{r.check_in_distance_m != null ? Math.round(r.check_in_distance_m) + " m" : "—"}</td></tr>)}{!rows?.length&&<tr><td colSpan={6} className="admin-empty">Belum ada catatan absensi.</td></tr>}</tbody></table></div>{error&&<p className="admin-error">Gagal memuat riwayat absensi.</p>}</section>
  </div>;
}
