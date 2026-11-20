import {NextResponse} from "next/server";
export async function POST(){const r=NextResponse.redirect(new URL("/",process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000"));for(const name of ["hi_attendance_access","hi_attendance_refresh"])r.cookies.set(name,"",{httpOnly:true,path:"/",maxAge:0});return r}
