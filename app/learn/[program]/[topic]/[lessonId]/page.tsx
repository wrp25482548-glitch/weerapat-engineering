import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { canViewLesson } from "@/lib/access";
import { ensureLearner } from "@/lib/catalog";
import { createSupabaseServer } from "@/lib/supabase/server";

export const dynamic="force-dynamic";

export default async function LessonPage({params}:{params:Promise<{program:string;topic:string;lessonId:string}>}){
  const route=await params;
  const sb=await createSupabaseServer();
  const {data:rawLesson}=await sb.from("lessons").select("*").eq("id",route.lessonId).maybeSingle();
  const lesson=rawLesson?{...rawLesson,topicId:rawLesson.topic_id,videoKey:rawLesson.video_path,accessType:rawLesson.access_type,coverImage:rawLesson.cover_image}:null;
  const {data:topic}=lesson?await sb.from("topics").select("*").eq("id",lesson.topicId).maybeSingle():{data:null};
  const user=await getChatGPTUser();
  if(user)await ensureLearner(user);
  const allowed=Boolean(lesson&&await canViewLesson(user,lesson));
  if(!lesson||!topic)return <main className="page-hero"><h1>ไม่พบบทเรียน</h1><a className="btn" href="/learn">กลับหน้าบทเรียน</a></main>;
  return <main><header className="nav"><a className="brand" href="/"><b>WEERAPAT</b><small>ENGINEERING</small></a><nav><a href="/">หน้าหลัก</a><a href="/learn">บทเรียน</a><a href="/admin">หลังบ้าน</a></nav></header><section className="section"><p className="eyebrow blue">{topic.title}</p><h1>{lesson.title}</h1><p>{lesson.description}</p><div className="video-shell">{!user?<div className="video-empty"><h2>เข้าสู่ระบบเพื่อดูบทเรียน</h2><a className="btn" href={chatGPTSignInPath(`/learn/${route.program}/${route.topic}/${route.lessonId}`)} target="_top">เข้าสู่ระบบ</a></div>:!allowed?<div className="video-empty"><h2>บทเรียนนี้ต้องมีสิทธิ์รับชม</h2><p>ติดต่อผู้ดูแลเพื่อสมัครหรือชำระค่าคอร์ส</p><a className="btn ghost" href="/learn">กลับหน้าบทเรียน</a></div>:!lesson.videoKey?<div className="video-empty"><h2>กำลังเตรียมวิดีโอ</h2><p>ผู้ดูแลยังไม่ได้อัปโหลดไฟล์สำหรับบทเรียนนี้</p></div>:<video controls playsInline preload="metadata" poster={lesson.coverImage||undefined} src={`/api/video/${lesson.id}`}/>}</div><div className="lesson-meta"><span>{lesson.accessType==="free"?"เรียนฟรี":"บทเรียนสำหรับผู้มีสิทธิ์"}</span><span>{lesson.duration}</span></div></section></main>;
}
