import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { registrationSchema } from "@/lib/validation";
export async function POST(req:NextRequest){try{const body=await req.json();const parsed=registrationSchema.safeParse(body);if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message||"Data tidak valid."},{status:400});const db=getSupabaseAdmin();const input=parsed.data;
const {data:program,error:programError}=await db.from("programs").select("id,is_active").eq("id",input.programId).single();if(programError||!program?.is_active)return NextResponse.json({error:"Program tidak tersedia."},{status:400});
if(input.scheduleId){const {data:schedule}=await db.from("course_schedules").select("id,is_active,program_id").eq("id",input.scheduleId).single();if(!schedule?.is_active||schedule.program_id!==input.programId)return NextResponse.json({error:"Jadwal tidak tersedia."},{status:400});}
const payload={program_id:input.programId,schedule_id:input.scheduleId||null,learning_method:input.learningMethod,full_name:input.fullName,phone:input.phone,email:input.email||null,education_level:input.educationLevel,school_name:input.schoolName||null,guardian_name:input.guardianName||null,guardian_phone:input.guardianPhone||null,guardian_consent:input.guardianConsent};
const {data,error}=await db.rpc("create_registration",{payload});if(error)throw error;return NextResponse.json({registrationCode:data?.registration_code},{status:201});
}catch(e){console.error("Registration error",e);return NextResponse.json({error:"Pendaftaran belum dapat diproses. Silakan coba kembali atau hubungi admin."},{status:500})}}
