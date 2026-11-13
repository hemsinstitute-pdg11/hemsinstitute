"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
export default function AdminLogin() {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState(""); const [busy,setBusy]=useState(false); const router=useRouter();
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError("");try{const r=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Login gagal");router.replace("/admin");router.refresh();}catch(x){setError(x instanceof Error?x.message:"Login gagal");}finally{setBusy(false);}}
  return <main className="admin-login"><form className="admin-login-card" onSubmit={submit}><div className="admin-logo">H</div><span className="admin-eyebrow">HEM'S INSTITUTE</span><h1>Admin Portal</h1><p>Masuk untuk mengelola website dan pendaftaran.</p><label>Email Admin<input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required /></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>{error&&<div className="admin-error" role="alert">{error}</div>}<button className="admin-primary" disabled={busy}>{busy?"Memverifikasi...":"Masuk ke Dashboard"}</button><a href="/">← Kembali ke website</a></form></main>;
}
