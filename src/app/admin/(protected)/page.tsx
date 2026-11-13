import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-server";
export const dynamic="force-dynamic";
export default async function AdminDashboard(){
 const db=getSupabaseAdmin();
 const [all,newRows,confirmed,programs,recent]=await Promise.all([
  db.from("registrations").select("id",{count:"exact",head:true}),
  db.from("registrations").select("id",{count:"exact",head:true}).eq("status","new"),
  db.from("registrations").select("id",{count:"exact",head:true}).eq("status","confirmed"),
  db.from("programs").select("id",{count:"exact",head:true}).eq("is_active",true),
  db.from("registrations").select("id,registration_code,status,learning_method,created_at,participants(full_name,phone),programs(name)").order("created_at",{ascending:false}).limit(6)
 ]);
 const stats=[["Total Pendaftar",all.count??0,"Seluruh pendaftaran"],["Perlu Ditindaklanjuti",newRows.count??0,"Status pendaftaran baru"],["Terkonfirmasi",confirmed.count??0,"Peserta terkonfirmasi"],["Program Aktif",programs.count??0,"Program dipublikasikan"]];
 return <div className="admin-content"><div className="admin-heading"><div><span className="admin-eyebrow">OVERVIEW</span><h1>Dashboard</h1><p>Ringkasan aktivitas website Hem's Institute.</p></div><Link className="admin-primary admin-link-button" href="/admin/registrations">Lihat Pendaftaran</Link></div><section className="admin-stat-grid">{stats.map(([label,value,note])=><article className="admin-stat" key={String(label)}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>)}</section><section className="admin-panel"><div className="admin-panel-head"><div><h2>Pendaftaran Terbaru</h2><p>Enam data pendaftaran terakhir</p></div><Link href="/admin/registrations">Lihat semua →</Link></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Kode</th><th>Nama Peserta</th><th>Program</th><th>Tanggal</th><th>Status</th></tr></thead><tbody>{(recent.data||[]).map((r:any)=><tr key={r.id}><td>{r.registration_code}</td><td>{r.participants?.full_name||"-"}</td><td>{r.programs?.name||"-"}</td><td>{new Date(r.created_at).toLocaleDateString("id-ID")}</td><td><span className={"admin-status "+r.status}>{r.status}</span></td></tr>)}{!recent.data?.length&&<tr><td colSpan={5} className="admin-empty">Belum ada data pendaftaran.</td></tr>}</tbody></table></div></section></div>;
}
