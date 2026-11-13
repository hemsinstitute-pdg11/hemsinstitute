import Link from "next/link";
const links = [["Beranda","/"],["Tentang Kami","/about"],["Program","/programs"],["Instruktur","/instructors"],["Artikel","/news"],["Galeri","/gallery"],["Kontak","/contact"]];
export function SiteHeader() {
 return <header className="site-header"><div className="container nav-wrap"><Link href="/" className="brand"><span className="brand-mark">H</span><span>Hem's Institute<small>Develop Your Skills. Build Your Future.</small></span></Link><nav aria-label="Navigasi utama">{links.map(([label,href])=><Link key={href} href={href}>{label}</Link>)}</nav><Link className="button button-small" href="/registration">Daftar Sekarang</Link></div></header>;
}
