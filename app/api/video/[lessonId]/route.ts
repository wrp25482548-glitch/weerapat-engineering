import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { lessons } from "@/db/schema";
import { canViewLesson } from "@/lib/access";

export const dynamic="force-dynamic";

export async function GET(request:Request,{params}:{params:Promise<{lessonId:string}>}){
  if(!env.BUCKET)return new Response("Video storage unavailable",{status:503});
  const {lessonId}=await params;
  const [lesson]=await getDb().select().from(lessons).where(eq(lessons.id,Number(lessonId))).limit(1);
  if(!lesson||!lesson.videoKey)return new Response("Video not found",{status:404});
  const user=await getChatGPTUser();
  if(!(await canViewLesson(user,lesson)))return new Response("ไม่มีสิทธิ์รับชม",{status:403});
  const object=await env.BUCKET.get(lesson.videoKey,{range:request.headers});
  if(!object)return new Response("Video not found",{status:404});
  const headers=new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag",object.httpEtag);
  headers.set("accept-ranges","bytes");
  headers.set("cache-control","private, no-store");
  let status=200;
  if(object.range&&"offset" in object.range){status=206;headers.set("content-range",`bytes ${object.range.offset}-${object.range.offset+object.range.length-1}/${object.size}`);headers.set("content-length",String(object.range.length));}
  return new Response(object.body,{status,headers});
}
