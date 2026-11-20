"use client";
import { FormEvent, useState } from "react";
type Teacher = { id: string; teacher_code: string; full_name: string; email: string; is_active: boolean };
export default function AdminTeacherManager({ initialTeachers }: { initialTeachers: Teacher[] }) {
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(""), [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(""); setError("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/admin/attendance/teachers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        fullName: form.get("fullName"), email: form.get("email"), teacherCode: form.get("teacherCode"), password: form.get("password")
      }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Gagal membuat akun.");
      setMessage(result.message); formElement.reset(); window.location.reload();
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal membuat akun."); }
    finally { setBusy(false); }
  }
  return <div className="space-y-6">
    <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
      <div className="sm:col-span-2"><h2 className="font-semibold text-slate-900">Tambah akun guru</h2><p className="text-sm text-slate-500">Akun login dibuat melalui Supabase Auth.</p></div>
      <label className="text-sm font-medium">Nama lengkap<input name="fullName" required className="mt-1 w-full rounded-lg border p-3" /></label>
      <label className="text-sm font-medium">ID Guru<input name="teacherCode" required placeholder="TCH-001" className="mt-1 w-full rounded-lg border p-3" /></label>
      <label className="text-sm font-medium">Email login<input name="email" type="email" required className="mt-1 w-full rounded-lg border p-3" /></label>
      <label className="text-sm font-medium">Password awal<input name="password" type="password" minLength={8} required className="mt-1 w-full rounded-lg border p-3" /></label>
      {message && <p className="sm:col-span-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
      {error && <p className="sm:col-span-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="sm:col-span-2"><button disabled={busy} className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy ? "Menyimpan..." : "Buat Akun Guru"}</button></div>
    </form>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="border-b p-5"><h2 className="font-semibold">Daftar guru</h2><p className="text-sm text-slate-500">{initialTeachers.length} akun terdaftar</p></div>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">ID Guru</th><th className="p-3">Nama</th><th className="p-3">Email</th><th className="p-3">Status</th></tr></thead><tbody>{initialTeachers.map(t=><tr key={t.id} className="border-t"><td className="p-3 font-semibold">{t.teacher_code}</td><td className="p-3">{t.full_name}</td><td className="p-3">{t.email}</td><td className="p-3">{t.is_active ? "Aktif" : "Nonaktif"}</td></tr>)}{!initialTeachers.length&&<tr><td colSpan={4} className="p-5 text-center text-slate-500">Belum ada akun guru.</td></tr>}</tbody></table></div>
    </section>
  </div>;
}
