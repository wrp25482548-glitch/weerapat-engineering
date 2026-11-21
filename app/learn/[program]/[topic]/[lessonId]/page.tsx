import { eq } from "drizzle-orm";
import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { lessons, topics } from "@/db/schema";
import { canViewLesson } from "@/lib/access";
import { ensureLearner } from "@/lib/catalog";

export const dynamic="force-dynamic";

export default async function LessonPage({params}:{params:Promise<{program:string;topic:string;lessonId:string}>}){
  const route=await params;
  const [lesson]=await getDb().select().from(lessons).where(eq(lessons.id,Number(route.lessonId))).limit(1);
  const [topic]=lesson?await getDb().select().from(topics).where(eq(topics.id,lesson.topicId)).limit(1):[];
  const user=await getChatGPTUser();
  if(user)await ensureLearner(user);
  const allowed=Boolean(lesson&&await canViewLesson(user,lesson));
  if(!lesson||!topic)return <main className="page-hero"><h1>ไม่พบบทเรียน</h1><a className="btn" href="/learn">กลับหน้าบทเรียน</a></main>;
  return <main><header className="nav"><a className="brand" href="/"><b>WEERAPAT</b><small>ENGINEERING</small></a><nav><a href="/">หน้าหลัก</a><a href="/learn">บทเรียน</a><a href="/admin">หลังบ้าน</a></nav></header><section className="section"><p className="eyebrow blue">{topic.title}</p><h1>{lesson.title}</h1><p>{lesson.description}</p><div className="video-shell">{!user?<div className="video-empty"><h2>เข้าสู่ระบบเพื่อดูบทเรียน</h2><a className="btn" href={chatGPTSignInPath(`/learn/${route.program}/${route.topic}/${route.lessonId}`)} target="_top">เข้าสู่ระบบ</a></div>:!allowed?<div className="video-empty"><h2>บทเรียนนี้ต้องมีสิทธิ์รับชม</h2><p>ติดต่อผู้ดูแลเพื่อสมัครหรือชำระค่าคอร์ส</p><a className="btn ghost" href="/learn">กลับหน้าบทเรียน</a></div>:!lesson.videoKey?<div className="video-empty"><h2>กำลังเตรียมวิดีโอ</h2><p>ผู้ดูแลยังไม่ได้อัปโหลดไฟล์สำหรับบทเรียนนี้</p></div>:<video controls playsInline preload="metadata" poster={lesson.coverImage||undefined} src={`/api/video/${lesson.id}`}/>}</div><div className="lesson-meta"><span>{lesson.accessType==="free"?"เรียนฟรี":"บทเรียนสำหรับผู้มีสิทธิ์"}</span><span>{lesson.duration}</span></div></section></main>;
}
