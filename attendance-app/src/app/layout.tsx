import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Hem's Institute | Online Attendance", description: "Portal absensi guru Hem's Institute" };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="id"><body>{children}</body></html>; }
