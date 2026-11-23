import type { ChatGPTUser } from "@/app/chatgpt-auth";
import { createSupabaseServer } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
const mapProgram=(r:any)=>({...r,coverImage:r.cover_image,priceThb:r.price_thb,sortOrder:r.sort_order});
const mapTopic=(r:any)=>({...r,programId:r.program_id,coverImage:r.cover_image,sortOrder:r.sort_order});
const mapLesson=(r:any)=>({...r,topicId:r.topic_id,videoKey:r.video_path,accessType:r.access_type,coverImage:r.cover_image,sortOrder:r.sort_order});
const assembleCatalog=(ps:any[]=[],ts:any[]=[],ls:any[]=[])=>{const programs=ps.map(mapProgram),topics=ts.map(mapTopic),lessons=ls.map(mapLesson);return programs.map((p:any)=>({...p,topics:topics.filter((t:any)=>t.programId===p.id).map((t:any)=>({...t,lessons:lessons.filter((l:any)=>l.topicId===t.id)}))}))};
export const fallbackCatalog = [
  {
    id: "solidworks-design",
    slug: "solidworks-design",
    title: "SolidWorks Design",
    subtitle: "ออกแบบชิ้นงาน 3D และ Assembly",
    description: "สอนอ่าน Drawing ขึ้นโมเดล Part ประกอบ Assembly และใช้เครื่องมือต่าง ๆ ใน SolidWorks ผ่านชิ้นงานจริง",
    coverImage: "/covers/solidworks-design.png",
    status: "published",
    topics: [],
  },
  {
    id: "electronics-microcontrollers",
    slug: "electronics-microcontrollers",
    title: "Electronics & Microcontrollers",
    subtitle: "เรียนรู้วงจรและสร้างโปรเจกต์ด้วยไมโครคอนโทรลเลอร์",
    description: "รู้จักอุปกรณ์อิเล็กทรอนิกส์ การต่อวงจร และการเขียนโปรแกรม Arduino/ESP32 เพื่อนำไปใช้งานจริง",
    coverImage: "/covers/electronics-microcontrollers.png",
    status: "coming-soon",
    topics: [],
  },
  {
    id: "ai-industrial-web-apps",
    slug: "ai-industrial-web-apps",
    title: "AI for Industrial Web Apps",
    subtitle: "สร้าง Web App สำหรับงานอุตสาหกรรมด้วย AI",
    description: "เรียนรู้แนวคิดด้านการผลิต วิศวกรรมอุตสาหการ และซ่อมบำรุง พร้อมใช้ AI สร้างระบบที่ทดลองใช้งานได้จริง",
    coverImage: "/covers/ai-industrial-web-apps.png",
    status: "coming-soon",
    topics: [],
  },
];
export async function ensureOwner(user:ChatGPTUser){const sb=await createSupabaseServer();const {data}=await sb.from("profiles").select("role").eq("id",user.userId).single();if(data?.role!=="admin")throw new Error("บัญชีนี้ไม่มีสิทธิ์เข้าหลังบ้าน");return user;}
export async function ensureLearner(user:ChatGPTUser){const sb=await createSupabaseServer();await sb.from("profiles").update({email:user.email,display_name:user.displayName}).eq("id",user.userId);return user;}
const loadCatalog=unstable_cache(async()=>{const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||"https://rggehomgiolkfdvmqhih.supabase.co",process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||"sb_publishable_GlzQFoD6bcaeaxTiAGn0Xg_W8CXA1T_",{auth:{persistSession:false,autoRefreshToken:false}});const [{data:ps,error:pe},{data:ts,error:te},{data:ls,error:le}]=await Promise.all([sb.from("programs").select("*").order("sort_order"),sb.from("topics").select("*").order("sort_order"),sb.from("lessons").select("*").order("sort_order")]);if(pe||te||le){console.warn("Catalog database access unavailable; using local preview data.",pe||te||le);return fallbackCatalog;}const programs=(ps||[]).map(mapProgram),topics=(ts||[]).map(mapTopic),lessons=(ls||[]).map(mapLesson);const catalog=programs.map((p:any)=>({...p,topics:topics.filter((t:any)=>t.programId===p.id).map((t:any)=>({...t,lessons:lessons.filter((l:any)=>l.topicId===t.id)}))}));const existing=new Set(catalog.map((p:any)=>p.slug));return [...catalog,...fallbackCatalog.filter(p=>!existing.has(p.slug))];},["catalog"],{tags:["catalog"],revalidate:300});
export async function getCatalog(includeDrafts=false,includeComingSoon=false){
  let catalog;
  if(includeDrafts){
    const sb=await createSupabaseServer();
    const [{data:ps,error:pe},{data:ts,error:te},{data:ls,error:le}]=await Promise.all([sb.from("programs").select("*").order("sort_order"),sb.from("topics").select("*").order("sort_order"),sb.from("lessons").select("*").order("sort_order")]);
    if(pe||te||le)throw new Error(`โหลดข้อมูลหลังบ้านไม่สำเร็จ: ${(pe||te||le)?.message}`);
    catalog=assembleCatalog(ps||[],ts||[],ls||[]);
  }else catalog=await loadCatalog();
  if(includeDrafts)return catalog;
  return catalog
    .filter((program:any)=>program.status==="published"||(includeComingSoon&&program.status==="coming-soon"))
    .map((program:any)=>({...program,topics:program.topics
      .filter((topic:any)=>topic.status==="published")
      .map((topic:any)=>({...topic,lessons:topic.lessons.filter((lesson:any)=>lesson.status==="published")}))}));
}
export async function getLearners(){const sb=await createSupabaseServer();const {data}=await sb.from("profiles").select("id,email,display_name,role").order("created_at");return (data||[]).map((r:any)=>({userId:r.id,email:r.email,displayName:r.display_name,role:r.role}));}
