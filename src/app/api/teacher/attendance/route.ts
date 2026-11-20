import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { getTeacherForApi } from "@/lib/teacher-auth";
export const dynamic = "force-dynamic";
function jakartaDate() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value || "";
  return get("year") + "-" + get("month") + "-" + get("day");
}
function distanceMeters(aLat: number, aLng: number, bLat: number, bLng: number) {
  const rad = (v: number) => (v * Math.PI) / 180;
  const dLat = rad(bLat - aLat), dLng = rad(bLng - aLng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
export async function POST(req: NextRequest) {
  const session = await getTeacherForApi(req.cookies.get("hi_teacher_access")?.value);
  if (!session) return NextResponse.json({ error: "Sesi guru tidak valid. Silakan login kembali." }, { status: 401 });
  try {
    const body = await req.json();
    const action = body.action;
    const latitude = Number(body.latitude), longitude = Number(body.longitude), accuracy = Number(body.accuracy);
    if (!["check_in", "check_out"].includes(action) || !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
      latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180 || !Number.isFinite(accuracy) || accuracy <= 0 || accuracy > 100) {
      return NextResponse.json({ error: "Data lokasi tidak valid atau akurasi GPS lebih buruk dari 100 meter. Coba lagi di area terbuka." }, { status: 400 });
    }
    const db = getSupabaseAdmin();
    const { data: settings, error: settingsError } = await db.from("attendance_settings").select("*").eq("id", 1).single();
    if (settingsError || !settings?.location_verified || settings.latitude === null || settings.longitude === null) return NextResponse.json({ error: "Titik lokasi lembaga belum diverifikasi admin. Hubungi admin Hem's Institute." }, { status: 503 });
    const distance = distanceMeters(latitude, longitude, Number(settings.latitude), Number(settings.longitude));
    if (distance > Number(settings.radius_m)) return NextResponse.json({ error: "Anda berada di luar area absensi. Jarak saat ini " + Math.round(distance) + " m; batas " + settings.radius_m + " m." }, { status: 403 });
    const workDate = jakartaDate(), now = new Date().toISOString();
    if (action === "check_in") {
      const { data, error } = await db.from("attendance_records").insert({
        teacher_id: session.teacher.id, work_date: workDate, check_in_at: now,
        check_in_latitude: latitude, check_in_longitude: longitude, check_in_accuracy_m: accuracy, check_in_distance_m: distance
      }).select("id,work_date,check_in_at,check_out_at").single();
      if (error) {
        if (error.code === "23505") return NextResponse.json({ error: "Absensi masuk hari ini sudah tercatat." }, { status: 409 });
        return NextResponse.json({ error: "Absensi masuk gagal disimpan." }, { status: 500 });
      }
      return NextResponse.json({ ok: true, record: data, message: "Absensi masuk berhasil." });
    }
    const { data, error } = await db.from("attendance_records").update({
      check_out_at: now, check_out_latitude: latitude, check_out_longitude: longitude,
      check_out_accuracy_m: accuracy, check_out_distance_m: distance, updated_at: now
    }).eq("teacher_id", session.teacher.id).eq("work_date", workDate).is("check_out_at", null).not("check_in_at", "is", null)
      .select("id,work_date,check_in_at,check_out_at").maybeSingle();
    if (error) return NextResponse.json({ error: "Absensi pulang gagal disimpan." }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Belum ada absensi masuk hari ini atau absensi pulang sudah tercatat." }, { status: 409 });
    return NextResponse.json({ ok: true, record: data, message: "Absensi pulang berhasil." });
  } catch { return NextResponse.json({ error: "Permintaan absensi tidak dapat diproses." }, { status: 500 }); }
}
