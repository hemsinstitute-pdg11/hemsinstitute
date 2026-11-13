import Image from "next/image";
import Link from "next/link";
const links = [["Beranda","/"],["Tentang Kami","/about"],["Program","/programs"],["Instruktur","/instructors"],["Artikel","/news"],["Galeri","/gallery"],["Kontak","/contact"]];
export function SiteHeader() {
 return <header className="site-header"><div className="container nav-wrap"><Link href="/" className="brand" aria-label="Hem's Institute — Beranda"><Image src="/hem-logo.svg" alt="hem's institute — Frankly Intellectual" width={285} height={98} priority className="site-logo" /></Link><nav aria-label="Navigasi utama">{links.map(([label,href])=><Link key={href} href={href}>{label}</Link>)}</nav><Link className="button button-small" href="/registration">Daftar Sekarang</Link></div></header>;
}
