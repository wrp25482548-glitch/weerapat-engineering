import { getChatGPTUser } from "@/app/chatgpt-auth";
import { ensureOwner } from "@/lib/catalog";
import { createSupabaseServer } from "@/lib/supabase/server";
export const dynamic="force-dynamic";
const table={program:"programs",topic:"topics",lesson:"lessons"} as const;
export async function PATCH(request:Request){const user=await getChatGPTUser();if(!user)return new Response("กรุณาเข้าสู่ระบบ",{status:401});try{await ensureOwner(user)}catch{return new Response("ไม่มีสิทธิ์ผู้ดูแล",{status:403})}const {kind,id,image}=await request.json() as {kind:keyof typeof table;id:string;image:string};if(!table[kind]||!id)return new Response("ข้อมูลไม่ครบ",{status:400});if(!/^data:image\/(jpeg|png|webp);base64,/.test(image||""))return new Response("รูปแบบภาพไม่ถูกต้อง",{status:400});if(image.length>2.8*1024*1024)return new Response("ไฟล์ใหญ่เกิน 2 MB",{status:413});const sb=await createSupabaseServer();const {error}=await sb.from(table[kind]).update({cover_image:image}).eq("id",id);if(error)return new Response(error.message,{status:400});return Response.json({ok:true})}
