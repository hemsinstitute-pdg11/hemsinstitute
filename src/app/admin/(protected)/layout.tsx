import Link from "next/link";
import { requireSuperAdmin } from "@/lib/admin-auth";
export default async function AdminLayout({children}:{children:React.ReactNode}) {
  const user=await requireSuperAdmin();
  return <div className="admin-shell"><aside className="admin-sidebar"><Link href="/admin" className="admin-brand"><span>H</span><div>Hem's Institute<small>ADMINISTRATION</small></div></Link><div className="admin-nav-label">MENU UTAMA</div><Link href="/admin">▦　Dashboard</Link><Link href="/admin/registrations">▤　Pendaftaran</Link><Link href="/admin/programs">▣　Program</Link><div className="admin-side-bottom"><small>Signed in as</small><strong>{user.email}</strong><form action="/api/admin/logout" method="post"><button type="submit">Keluar ↗</button></form></div></aside><main className="admin-main"><header className="admin-topbar"><span>Hem's Institute / Admin</span><span>Super Admin　●</span></header>{children}</main></div>;
}
