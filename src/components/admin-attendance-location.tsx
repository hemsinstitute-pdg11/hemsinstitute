"use client";
import { useState } from "react";
type Settings = { address: string; latitude: number | null; longitude: number | null; radius_m: number; location_verified: boolean };
export default function AdminAttendanceLocation({ initial }: { initial: Settings }) {
  const [settings, setSettings] = useState(initial), [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(""), [error, setError] = useState("");
  function capture() {
    setBusy(true); setMessage(""); setError("");
    if (!navigator.geolocation) { setError("Browser tidak mendukung GPS."); setBusy(false); return; }
    navigator.geolocation.getCurrentPosition(async position => {
      try {
        const response = await fetch("/api/admin/attendance/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
          latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy
        }) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Gagal menyimpan lokasi.");
        setSettings(result.settings); setMessage("Titik lokasi lembaga berhasil disimpan dan diverifikasi.");
      } catch (e) { setError(e instanceof Error ? e.message : "Gagal menyimpan lokasi."); }
      finally { setBusy(false); }
    }, () => { setError("Tidak dapat mengambil lokasi. Izinkan akses lokasi dan pastikan Anda berada di area lembaga."); setBusy(false); },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  }
  return <section className="max-w-3xl space-y-5"><div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
    <h2 className="font-semibold text-slate-900">Titik pusat geofencing</h2><p className="text-sm text-slate-600">{settings.address}</p>
    <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Latitude</p><strong>{settings.latitude ?? "Belum diatur"}</strong></div><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Longitude</p><strong>{settings.longitude ?? "Belum diatur"}</strong></div></div>
    <p className="text-sm">Radius absensi: <strong>{settings.radius_m} meter</strong></p>
    <p className={"text-sm font-semibold " + (settings.location_verified ? "text-emerald-700" : "text-amber-700")}>{settings.location_verified ? "Lokasi sudah diverifikasi" : "Lokasi belum diverifikasi — absensi masih terkunci"}</p>
    {message && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <button onClick={capture} disabled={busy} className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy ? "Mengambil GPS..." : "Ambil dan Simpan Lokasi Saat Ini"}</button>
    <p className="text-xs leading-5 text-slate-500">Admin harus membuka halaman ini saat berada tepat di lokasi operasional Hem's Institute. Gunakan perangkat dengan GPS aktif dan akurasi maksimal 50 meter. Pengaturan ini mengaktifkan geofence radius 50 meter untuk seluruh guru.</p>
  </div></section>;
}
