import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { requireAdminApi } from "@/lib/admin-api-auth";
export async function GET(req: NextRequest) {
  const auth = await requireAdminApi(req);
  if (auth.response) return auth.response;
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("attendance_settings").select("*").eq("id", 1).single();
  if (error) return NextResponse.json({ error: "Pengaturan lokasi belum tersedia." }, { status: 500 });
  return NextResponse.json({ settings: data });
}
export async function PUT(req: NextRequest) {
  const auth = await requireAdminApi(req);
  if (auth.response) return auth.response;
  try {
    const body = await req.json();
    const latitude = Number(body.latitude), longitude = Number(body.longitude), accuracy = Number(body.accuracy);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180 || !Number.isFinite(accuracy) || accuracy <= 0 || accuracy > 50) {
      return NextResponse.json({ error: "Koordinat tidak valid atau akurasi GPS lebih buruk dari 50 meter. Ambil lokasi kembali di area terbuka." }, { status: 400 });
    }
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("attendance_settings").update({
      latitude, longitude, radius_m: 50, location_verified: true, updated_at: new Date().toISOString()
    }).eq("id", 1).select("*").single();
    if (error) return NextResponse.json({ error: "Lokasi gagal disimpan." }, { status: 500 });
    return NextResponse.json({ ok: true, settings: data });
  } catch { return NextResponse.json({ error: "Permintaan tidak dapat diproses." }, { status: 500 }); }
}
