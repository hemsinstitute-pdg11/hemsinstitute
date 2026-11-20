"use client";
import { useState } from "react";
type RecordData = { work_date: string; check_in_at: string | null; check_out_at: string | null } | null;
type Props = { teacher: { fullName: string; code: string }; initialRecord: RecordData; settings: { address: string; radius_m: number; location_verified: boolean } | null };
function time(value?: string | null) { return value ? new Date(value).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--"; }
export default function TeacherAttendancePanel({ teacher, initialRecord, settings }: Props) {
  const [record, setRecord] = useState<RecordData>(initialRecord), [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(""), [error, setError] = useState("");
  async function punch(action: "check_in" | "check_out") {
    setBusy(true); setMessage(""); setError("");
    if (!navigator.geolocation) { setError("Browser ini tidak mendukung GPS."); setBusy(false); return; }
    navigator.geolocation.getCurrentPosition(async position => {
      try {
        const response = await fetch("/api/teacher/attendance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
          action, latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy
        }) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Absensi gagal.");
        setRecord(result.record); setMessage(result.message || "Absensi berhasil.");
      } catch (e) { setError(e instanceof Error ? e.message : "Absensi gagal."); }
      finally { setBusy(false); }
    }, err => { setError(err.code === 1 ? "Izin lokasi ditolak. Aktifkan izin lokasi untuk browser." : "Lokasi tidak dapat dibaca. Aktifkan GPS dan coba lagi."); setBusy(false); },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  }
  const canIn = !record?.check_in_at, canOut = Boolean(record?.check_in_at) && !record?.check_out_at;
  return <section className="space-y-5">
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200"><p className="text-sm text-slate-500">Selamat datang</p><h2 className="text-xl font-bold text-slate-900">{teacher.fullName}</h2><div className="mt-3 flex flex-wrap gap-2 text-sm"><span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">ID Guru: {teacher.code}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{new Date().toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span></div></div>
    <div className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-emerald-200 bg-white p-5"><p className="text-sm font-semibold text-emerald-700">ABSEN MASUK</p><p className="mt-2 text-3xl font-bold text-slate-900">{time(record?.check_in_at)}</p><p className="mt-1 text-xs text-slate-500">{record?.check_in_at ? "Tercatat hari ini" : "Belum tercatat"}</p></div><div className="rounded-2xl border border-blue-200 bg-white p-5"><p className="text-sm font-semibold text-blue-700">ABSEN PULANG</p><p className="mt-2 text-3xl font-bold text-slate-900">{time(record?.check_out_at)}</p><p className="mt-1 text-xs text-slate-500">{record?.check_out_at ? "Tercatat hari ini" : "Belum tercatat"}</p></div></div>
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3"><div><h3 className="font-semibold text-slate-900">Verifikasi lokasi</h3><p className="text-sm text-slate-500">{settings?.address || "Lokasi lembaga belum diatur"}</p></div><p className="text-sm text-slate-600">Radius yang diizinkan: <strong>{settings?.radius_m ?? 50} meter</strong></p>
      {!settings?.location_verified && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Titik lokasi belum diverifikasi admin. Absensi belum dapat digunakan.</p>}
      {message && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-2"><button onClick={() => punch("check_in")} disabled={busy || !canIn || !settings?.location_verified} className="rounded-xl bg-emerald-600 px-4 py-4 font-semibold text-white disabled:opacity-40">{busy ? "Memeriksa GPS..." : "Absen Masuk"}</button><button onClick={() => punch("check_out")} disabled={busy || !canOut || !settings?.location_verified} className="rounded-xl bg-blue-700 px-4 py-4 font-semibold text-white disabled:opacity-40">{busy ? "Memeriksa GPS..." : "Absen Pulang"}</button></div>
      <p className="text-xs leading-5 text-slate-500">Lokasi hanya diminta saat tombol absensi ditekan. Aktifkan GPS dan izinkan akses lokasi. Sistem menolak data GPS dengan akurasi di atas 50 meter atau posisi di luar radius.</p>
    </div>
  </section>;
}
