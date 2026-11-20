"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
export default function TeacherLoginPage() {
  const [email, setEmail] = useState(""), [password, setPassword] = useState("");
  const [error, setError] = useState(""), [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/teacher/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Login gagal.");
      router.replace("/teacher/attendance"); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Login gagal."); }
    finally { setBusy(false); }
  }
  return <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm space-y-5">
      <div className="flex items-center gap-3"><div className="h-12 w-12 rounded-xl bg-blue-700 text-white grid place-items-center text-2xl font-bold">H</div><div><p className="text-xs font-bold tracking-widest text-blue-700">HEM'S INSTITUTE</p><h1 className="text-xl font-bold text-slate-900">Portal Absensi Guru</h1></div></div>
      <p className="text-sm text-slate-500">Masuk menggunakan akun yang diberikan admin.</p>
      <label className="block text-sm font-medium text-slate-700">Email<input className="mt-1 w-full rounded-lg border border-slate-300 p-3" type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
      <label className="block text-sm font-medium text-slate-700">Password<input className="mt-1 w-full rounded-lg border border-slate-300 p-3" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button disabled={busy} className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white disabled:opacity-50">{busy ? "Memverifikasi..." : "Masuk ke Absensi"}</button>
      <a className="block text-center text-sm text-slate-500 hover:text-blue-700" href="/">Kembali ke website</a>
    </form>
  </main>;
}
