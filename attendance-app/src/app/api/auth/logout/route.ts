import {NextRequest,NextResponse} from "next/server";
export async function POST(req:NextRequest){const r=NextResponse.redirect(new URL("/",req.nextUrl.origin));for(const name of ["hi_attendance_access","hi_attendance_refresh"])r.cookies.set(name,"",{httpOnly:true,path:"/",maxAge:0});return r}
