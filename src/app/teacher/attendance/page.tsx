import { requireTeacher } from "@/lib/teacher-auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import TeacherAttendancePanel from "@/components/teacher-attendance-panel";
export const dynamic = "force-dynamic";
export default async function TeacherAttendancePage() {
  const { teacher } = await requireTeacher();
  const db = getSupabaseAdmin();
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const value = (type: string) => parts.find(p => p.type === type)?.value || "";
  const today = value("year") + "-" + value("month") + "-" + value("day");
  const [{ data: record }, { data: settings }] = await Promise.all([
    db.from("attendance_records").select("work_date,check_in_at,check_out_at").eq("teacher_id", teacher.id).eq("work_date", today).maybeSingle(),
    db.from("attendance_settings").select("address,radius_m,location_verified").eq("id", 1).single()
  ]);
  return <main className="min-h-screen bg-slate-50 p-4 sm:p-8"><div className="mx-auto max-w-3xl space-y-5">
    <header className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold tracking-widest text-blue-700">HEM'S INSTITUTE</p><h1 className="text-2xl font-bold text-slate-900">Absensi Guru</h1><p className="text-sm text-slate-500">Portal kehadiran harian</p></div><form action="/api/teacher/logout" method="post"><button className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium">Keluar</button></form></header>
    <TeacherAttendancePanel teacher={{ fullName: teacher.full_name, code: teacher.teacher_code }} initialRecord={record || null} settings={settings || null} />
  </div></main>;
}
