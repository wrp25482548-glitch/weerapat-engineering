import { getChatGPTUser } from "@/app/chatgpt-auth";
import { ensureOwner } from "@/lib/catalog";
import { createSupabaseServer } from "@/lib/supabase/server";
export const dynamic="force-dynamic";
export async function POST(request:Request){
  const user=await getChatGPTUser();if(!user)return new Response("กรุณาเข้าสู่ระบบ",{status:401});
  try{await ensureOwner(user)}catch{return new Response("ไม่มีสิทธิ์ผู้ดูแล",{status:403})}
  const {lessonId,fileName}=await request.json() as {lessonId:string;fileName:string};
  const safe=String(fileName||"lesson.mp4").replace(/[^a-zA-Z0-9._-]/g,"-");const path=`lessons/${lessonId}/${Date.now()}-${safe}`;const sb=await createSupabaseServer();
  const {data,error}=await sb.storage.from("lesson-videos").createSignedUploadUrl(path);if(error)return new Response(error.message,{status:400});return Response.json({path,token:data.token,signedUrl:data.signedUrl});
}
export async function PATCH(request:Request){
  const user=await getChatGPTUser();if(!user)return new Response("กรุณาเข้าสู่ระบบ",{status:401});
  try{await ensureOwner(user)}catch{return new Response("ไม่มีสิทธิ์ผู้ดูแล",{status:403})}
  const {lessonId,path}=await request.json() as {lessonId:string;path:string};const sb=await createSupabaseServer();const {data:old}=await sb.from("lessons").select("video_path").eq("id",lessonId).single();const {error}=await sb.from("lessons").update({video_path:path}).eq("id",lessonId);if(error)return new Response(error.message,{status:400});if(old?.video_path&&old.video_path!==path)await sb.storage.from("lesson-videos").remove([old.video_path]);return Response.json({ok:true});
}
