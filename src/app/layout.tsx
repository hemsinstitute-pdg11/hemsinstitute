import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";
export const metadata: Metadata = { title: { default: "Hem's Institute | Kursus & Pelatihan Padang", template: "%s | Hem's Institute" }, description: "Program bahasa asing, multimedia, dan keterampilan profesional di Hem's Institute Padang sejak 2011.", metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"), icons: { icon: "/hem-icon.png", shortcut: "/hem-icon.png", apple: "/hem-icon.png" }, themeColor: "#087ABD" };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="id"><body><SiteHeader/><main>{children}</main><SiteFooter/><WhatsAppFloat/></body></html>; }
