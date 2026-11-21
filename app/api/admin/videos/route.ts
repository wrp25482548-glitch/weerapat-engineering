import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { lessons } from "@/db/schema";
import { ensureOwner } from "@/lib/catalog";

export const dynamic="force-dynamic";

export async function PUT(request:Request){
  const user=await getChatGPTUser();
  if(!user)return new Response("กรุณาเข้าสู่ระบบ",{status:401});
  try{await ensureOwner(user);}catch{return new Response("ไม่มีสิทธิ์ผู้ดูแล",{status:403});}
  if(!env.BUCKET)return new Response("ยังไม่ได้เชื่อมพื้นที่เก็บวิดีโอ",{status:503});
  const lessonId=Number(new URL(request.url).searchParams.get("lessonId"));
  if(!lessonId||!request.body)return new Response("ข้อมูลไม่ครบ",{status:400});
  const type=request.headers.get("content-type")||"";
  if(!["video/mp4","video/webm"].includes(type))return new Response("รองรับเฉพาะ MP4 หรือ WebM",{status:415});
  const raw=decodeURIComponent(request.headers.get("x-file-name")||"lesson.mp4");
  const safe=raw.replace(/[^a-zA-Z0-9._-]/g,"-");
  const key=`lessons/${lessonId}/${Date.now()}-${safe}`;
  const db=getDb();
  const [lesson]=await db.select().from(lessons).where(eq(lessons.id,lessonId)).limit(1);
  if(!lesson)return new Response("ไม่พบบทเรียน",{status:404});
  await env.BUCKET.put(key,request.body,{httpMetadata:{contentType:type,cacheControl:"private, max-age=0"}});
  await db.update(lessons).set({videoKey:key}).where(eq(lessons.id,lessonId));
  if(lesson.videoKey)await env.BUCKET.delete(lesson.videoKey);
  return Response.json({ok:true});
}
