import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { requireAdminApi } from "@/lib/admin-api-auth";
const text = (v: unknown, max: number) => typeof v === "string" ? v.trim().slice(0, max) : "";
const slugify = (v: string) => v.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
function validate(body: any) {
  const name = text(body?.name, 160);
  const category_id = text(body?.category_id, 64);
  const slug = slugify(text(body?.slug, 180) || name);
  const price = body?.price === "" || body?.price == null ? null : Number(body.price);
  const total_meetings = body?.total_meetings === "" || body?.total_meetings == null ? null : Number(body.total_meetings);
  if (!name || !category_id || !slug) return { error: "Nama program, kategori, dan slug wajib diisi." };
  if (price !== null && (!Number.isFinite(price) || price < 0)) return { error: "Biaya harus berupa angka nol atau lebih." };
  if (total_meetings !== null && (!Number.isInteger(total_meetings) || total_meetings < 0)) return { error: "Jumlah pertemuan harus berupa bilangan bulat nol atau lebih." };
  return { value: { name, category_id, slug, description: text(body.description, 5000) || null, target_audience: text(body.target_audience, 500) || null, course_level: text(body.course_level, 100) || null, duration: text(body.duration, 100) || null, total_meetings, price, learning_method: text(body.learning_method, 40) || null, image_url: text(body.image_url, 1000) || null, is_active: body.is_active === true } };
}
export async function POST(req: NextRequest) {
  const auth = await requireAdminApi(req); if (auth.response) return auth.response;
  try { const body = await req.json(); const parsed = validate(body); if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { data, error } = await getSupabaseAdmin().from("programs").insert(parsed.value!).select("id").single();
    if (error) return NextResponse.json({ error: error.code === "23505" ? "Slug program sudah digunakan. Ubah slug atau nama program." : "Program gagal disimpan. Periksa kategori dan data yang diisi." }, { status: error.code === "23505" ? 409 : 400 });
    return NextResponse.json({ ok: true, id: data.id });
  } catch { return NextResponse.json({ error: "Permintaan tidak dapat diproses." }, { status: 400 }); }
}
export async function PUT(req: NextRequest) {
  const auth = await requireAdminApi(req); if (auth.response) return auth.response;
  try { const body = await req.json(); const id = text(body?.id, 64); if (!id) return NextResponse.json({ error: "ID program tidak valid." }, { status: 400 });
    const parsed = validate(body); if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { data, error } = await getSupabaseAdmin().from("programs").update(parsed.value!).eq("id", id).select("id").maybeSingle();
    if (error) return NextResponse.json({ error: error.code === "23505" ? "Slug program sudah digunakan." : "Program gagal diperbarui." }, { status: error.code === "23505" ? 409 : 400 });
    if (!data) return NextResponse.json({ error: "Program tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Permintaan tidak dapat diproses." }, { status: 400 }); }
}
export async function DELETE(req: NextRequest) {
  const auth = await requireAdminApi(req); if (auth.response) return auth.response;
  try { const body = await req.json(); const id = text(body?.id, 64); if (!id) return NextResponse.json({ error: "ID program tidak valid." }, { status: 400 });
    const db = getSupabaseAdmin();
    const { count, error: countError } = await db.from("registrations").select("id", { count: "exact", head: true }).eq("program_id", id);
    if (countError) return NextResponse.json({ error: "Tidak dapat memeriksa riwayat pendaftaran." }, { status: 500 });
    if ((count || 0) > 0) return NextResponse.json({ error: "Program tidak dapat dihapus karena sudah memiliki riwayat pendaftaran. Ubah status menjadi Draft jika program tidak lagi dibuka." }, { status: 409 });
    const { error } = await db.from("programs").delete().eq("id", id);
    if (error) return NextResponse.json({ error: "Program gagal dihapus. Periksa jadwal atau relasi data terkait." }, { status: 409 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Permintaan tidak dapat diproses." }, { status: 400 }); }
}
