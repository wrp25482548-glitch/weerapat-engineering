import { getChatGPTUser } from "@/app/chatgpt-auth";
import { canViewLesson } from "@/lib/access";
import { createSupabaseServer } from "@/lib/supabase/server";
export const dynamic="force-dynamic";
export async function GET(_request:Request,{params}:{params:Promise<{lessonId:string}>}){const {lessonId}=await params;const sb=await createSupabaseServer();const {data:r}=await sb.from("lessons").select("*").eq("id",lessonId).single();if(!r||!r.video_path)return new Response("Video not found",{status:404});const lesson={...r,accessType:r.access_type,videoKey:r.video_path};if(!(await canViewLesson(await getChatGPTUser(),lesson)))return new Response("ไม่มีสิทธิ์รับชม",{status:403});const {data,error}=await sb.storage.from("lesson-videos").createSignedUrl(r.video_path,3600);if(error||!data)return new Response("Video unavailable",{status:404});return Response.redirect(data.signedUrl,302);}
