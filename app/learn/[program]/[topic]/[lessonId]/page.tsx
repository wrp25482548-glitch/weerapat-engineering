import Link from "next/link";
import { LessonMedia } from "@/components/lesson-media";
import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { canViewLesson, canViewProgram } from "@/lib/access";
import { ensureLearner } from "@/lib/catalog";
import { createSupabaseServer } from "@/lib/supabase/server";
import { youtubeEmbedUrl } from "@/lib/youtube";

export const dynamic="force-dynamic";

export default async function LessonPage({params}:{params:Promise<{program:string;topic:string;lessonId:string}>}){
  const route=await params;
  const sb=await createSupabaseServer();
  const {data:rawLesson}=await sb.from("lessons").select("*").eq("id",route.lessonId).maybeSingle();
  const lesson=rawLesson?{...rawLesson,topicId:rawLesson.topic_id,videoKey:rawLesson.video_path,accessType:rawLesson.access_type,coverImage:rawLesson.cover_image}:null;
  const {data:topic}=lesson?await sb.from("topics").select("*").eq("id",lesson.topicId).maybeSingle():{data:null};
  const user=await getChatGPTUser();
  if(user)await ensureLearner(user);
  const enrolled=Boolean(user&&topic&&await canViewProgram(user,topic.program_id));
  const allowed=Boolean(enrolled&&lesson&&await canViewLesson(user,lesson));
  if(!lesson||!topic)return <main className="page-hero"><h1>ไม่พบบทเรียน</h1><a className="btn" href="/learn">กลับหน้าบทเรียน</a></main>;
  const embed=lesson.videoKey?youtubeEmbedUrl(lesson.videoKey):null;
  if (allowed && topic.slug === route.topic) {
    const { data: program } = await sb.from("programs").select("title,slug,status").eq("id", topic.program_id).maybeSingle();
    if (program?.slug === route.program && program.status === "published" && topic.status === "published") {
      const { data: episodes } = await sb.from("lessons").select("id,title").eq("topic_id", topic.id).eq("status", "published").order("sort_order");
      const ids = (episodes ?? []).map(episode => episode.id);
      const progress = user && ids.length
        ? await sb.from("lesson_progress").select("lesson_id,completed,last_page").eq("user_id", user.userId).in("lesson_id", ids)
        : { data: [], error: null };
      const completed = new Set((progress.data ?? []).filter(row => row.completed).map(row => row.lesson_id));
      const percent = ids.length ? Math.round(completed.size * 100 / ids.length) : 0;
      const lessonId = route.lessonId;
      async function saveProgress(page?: number) {
        "use server";
        if (page !== undefined && (!Number.isInteger(page) || page < 1 || page > 10000)) return false;
        const currentUser = await getChatGPTUser();
        const database = await createSupabaseServer();
        if (!currentUser) return false;
        const { data: currentLesson } = await database.from("lessons").select("id,status,access_type,topic_id").eq("id", lessonId).maybeSingle();
        if (!currentLesson) return false;
        const { data: currentTopic } = await database.from("topics").select("program_id,status").eq("id", currentLesson.topic_id).maybeSingle();
        if (currentTopic?.status !== "published" ||
          !(await canViewProgram(currentUser, currentTopic.program_id)) ||
          !(await canViewLesson(currentUser, currentLesson))) {
          return false;
        }
        const { data: saved, error } = await database.from("lesson_progress").upsert({
          user_id: currentUser.userId, lesson_id: currentLesson.id,
          ...(page === undefined ? { completed: true } : { last_page: page }),
        }, { onConflict: "user_id,lesson_id", defaultToNull: false })
          .select("last_page,completed").single();
        if (error) {
          console.error("Could not save lesson progress", error.code, error.message);
          return false;
        }
        return page === undefined ? saved.completed === true : saved.last_page === page;
      }
      return (
        <main>
          <header className="nav">
            <a className="brand" href="/"><b>WEERAPAT</b><small>ENGINEERING</small></a>
            <Link href="/learn">บทเรียนทั้งหมด</Link>
          </header>
          <div className="mx-auto grid max-w-7xl gap-4 px-3 py-4 md:grid-cols-[13rem_minmax(0,1fr)] md:px-6 md:py-6">
            <aside className="self-start rounded-xl bg-slate-100 p-3">
              <details open>
                <summary className="cursor-pointer font-bold">{topic.title}</summary>
                {!progress.error && <div className="mt-3">
                  <p className="text-sm">ความคืบหน้า {percent}%</p>
                  <progress className="w-full" aria-label="ความคืบหน้าใน Module" value={percent} max={100} />
                </div>}
                <nav aria-label="บทเรียนใน Module" className="mt-3 grid gap-1">
                  {(episodes ?? []).map(episode => (
                    <Link key={episode.id} href={`/learn/${route.program}/${route.topic}/${episode.id}`}
                      aria-current={episode.id === lesson.id ? "page" : undefined}
                      className={`rounded-lg p-3 text-sm ${episode.id === lesson.id ? "bg-blue-100 font-bold text-blue-900" : "hover:bg-slate-100"}`}>
                      {completed.has(episode.id) && <span aria-label="เรียนจบแล้ว">✓ </span>}{episode.title}
                    </Link>
                  ))}
                </nav>
              </details>
            </aside>
            <section className="min-w-0 rounded-xl bg-white p-3 md:p-6">
              <p className="text-sm text-slate-600">{program.title} / {topic.title}</p>
              <h1 className="mt-2 text-xl font-bold md:text-3xl">{lesson.title}</h1>
              <LessonMedia key={lesson.id} lessonId={String(lesson.id)} title={lesson.title} embed={embed}
                initialPage={progress.data?.find(row => row.lesson_id === lesson.id)?.last_page ?? 1}
                completed={completed.has(lesson.id)} progressAvailable={!progress.error} saveProgress={saveProgress} />
              {lesson.description && <div className="mt-6 whitespace-pre-wrap">{lesson.description}</div>}
            </section>
          </div>
        </main>
      );
    }
    return <main className="section"><h1>ไม่พบบทเรียน</h1><Link href="/learn">กลับหน้าบทเรียน</Link></main>;
  }
  if (allowed) return <main className="section"><h1>ไม่พบบทเรียน</h1><Link href="/learn">กลับหน้าบทเรียน</Link></main>;
  return <main><header className="nav"><a className="brand" href="/"><b>WEERAPAT</b><small>ENGINEERING</small></a><nav><a href="/">หน้าหลัก</a><a href="/learn">บทเรียน</a><a href="/admin">หลังบ้าน</a></nav></header><section className="section"><p className="eyebrow blue">{topic.title}</p><h1>{lesson.title}</h1><p>{lesson.description}</p><div className="video-shell">{!user?<div className="video-empty"><h2>เข้าสู่ระบบเพื่อดูบทเรียน</h2><a className="btn" href={chatGPTSignInPath(`/learn/${route.program}/${route.topic}/${route.lessonId}`)} target="_top">เข้าสู่ระบบ</a></div>:!enrolled?<div className="video-empty"><h2>กรุณาสมัครเข้าวิชาก่อน</h2><p>ทุกวิชาต้องลงทะเบียนก่อนเริ่มเรียน ไม่ว่าจะเป็นวิชาฟรีหรือเสียเงิน</p><a className="btn ghost" href="/learn">ดูวิชาทั้งหมด</a></div>:!allowed?<div className="video-empty"><h2>บทเรียนนี้ต้องมีสิทธิ์รับชมเพิ่มเติม</h2><p>ติดต่อผู้ดูแลเพื่อเปิดสิทธิ์คลิปนี้</p><a className="btn ghost" href={`/learn/${route.program}/${route.topic}`}>กลับรายการคลิป</a></div>:!lesson.videoKey?<div className="video-empty"><h2>กำลังเตรียมวิดีโอ</h2><p>ผู้ดูแลยังไม่ได้เพิ่มลิงก์ YouTube สำหรับบทเรียนนี้</p></div>:!embed?<div className="video-empty"><h2>ลิงก์วิดีโอไม่ถูกต้อง</h2><p>กรุณาแก้ลิงก์ในหน้าหลังบ้าน</p></div>:<iframe src={embed} title={lesson.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>}</div><div className="lesson-meta"><span>{lesson.accessType==="free"?"รวมในวิชา":"บทเรียนสำหรับผู้มีสิทธิ์"}</span><span>{lesson.duration}</span></div></section></main>;
}
