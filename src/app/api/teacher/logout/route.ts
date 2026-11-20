import { NextResponse } from "next/server";
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("hi_teacher_access", "", { httpOnly: true, path: "/", maxAge: 0 });
  response.cookies.set("hi_teacher_refresh", "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
