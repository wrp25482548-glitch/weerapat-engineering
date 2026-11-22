import { getChatGPTUser } from "@/app/chatgpt-auth";
import { ensureOwner } from "@/lib/catalog";
import { createSupabaseServer } from "@/lib/supabase/server";
import { youtubeVideoId } from "@/lib/youtube";
export const dynamic="force-dynamic";
async function owner(){
  const user=await getChatGPTUser();if(!user)return new Response("กรุณาเข้าสู่ระบบ",{status:401});
  try{await ensureOwner(user)}catch{return new Response("ไม่มีสิทธิ์ผู้ดูแล",{status:403})}
  return null;
}
export async function GET(request:Request){
  const denied=await owner();if(denied)return denied;
  const lessonId=new URL(request.url).searchParams.get("lessonId");if(!lessonId)return new Response("ไม่พบบทเรียน",{status:400});
  const sb=await createSupabaseServer();const {data,error}=await sb.from("lessons").select("video_path").eq("id",lessonId).maybeSingle();
  if(error)return new Response(error.message,{status:400});return Response.json({url:data?.video_path||""});
}
export async function PATCH(request:Request){
  const denied=await owner();if(denied)return denied;
  const {lessonId,path}=await request.json() as {lessonId:string;path:string};
  const value=String(path||"").trim();if(!lessonId)return new Response("ไม่พบบทเรียน",{status:400});if(value&&!youtubeVideoId(value))return new Response("ลิงก์ YouTube ไม่ถูกต้อง",{status:400});
  const sb=await createSupabaseServer();const {error}=await sb.from("lessons").update({video_path:value||null}).eq("id",lessonId);if(error)return new Response(error.message,{status:400});return Response.json({ok:true});
}
