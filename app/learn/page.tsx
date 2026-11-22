import Image from "next/image";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { ensureLearner, getCatalog } from "@/lib/catalog";
import { createSupabaseServer } from "@/lib/supabase/server";
import { enrollProgram } from "./actions";

export const dynamic = "force-dynamic";

export default async function LearnPage({searchParams}:{searchParams:Promise<{view?:string}>}) {
  const user=await requireChatGPTUser("/learn"); await ensureLearner(user);
  const [catalog,query]=await Promise.all([getCatalog(),searchParams]);
  const sb=await createSupabaseServer();
  const [{data:rows},{data:profile}]=await Promise.all([sb.from("enrollments").select("program_id,status").eq("user_id",user.userId),sb.from("profiles").select("role").eq("id",user.userId).maybeSingle()]);
  const admin=profile?.role==="admin";
  const enrollment=new Map((rows||[]).map(row=>[String(row.program_id),row.status]));
  const mine=query.view==="mine";
  const programs=catalog.filter(program=>!mine||admin||enrollment.get(String(program.id))==="active");
  return <main>
    <header className="nav"><a className="brand" href="/"><b>WEERAPAT</b><small>ENGINEERING</small></a><nav><a href="/">หน้าหลัก</a><a href="/learn">บทเรียน</a><a href="/admin">หลังบ้าน</a></nav><span className="user-chip">{user.displayName}</span></header>
    <section className="page-hero"><p className="eyebrow">COURSES</p><h1>{mine?"วิชาของฉัน":"บทเรียนทั้งหมด"}</h1><p>{mine?"วิชาที่คุณสมัครและได้รับสิทธิ์เข้าเรียนแล้ว":"เลือกวิชาที่สนใจ จากนั้นสมัครเข้าคลาสก่อนเริ่มเรียน"}</p><div className="mt-6 flex flex-wrap gap-3"><a className={!mine?"btn":"btn ghost"} href="/learn">วิชาทั้งหมด</a><a className={mine?"btn":"btn ghost"} href="/learn?view=mine">วิชาของฉัน</a></div></section>
    <section className="section"><div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{programs.map(program=>{const state=admin?"active":enrollment.get(String(program.id));const active=state==="active";const pending=state==="pending";const free=Number(program.priceThb||0)===0;return <article key={program.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="relative aspect-[4/3]"><Image src={program.coverImage||"/covers/solidworks-design.png"} alt={program.title} fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw"/></div><div className="p-6"><p className="text-xs font-bold tracking-[.16em] text-blue-600">{free?"สมัครฟรี":`ค่าเรียน ฿${Number(program.priceThb).toLocaleString("th-TH")}`}</p><h2 className="mt-2 text-2xl font-extrabold">{program.title}</h2><p className="mt-2 text-slate-600">{program.subtitle||program.description}</p><div className="mt-5">{active?<a className="btn" href={`/learn/${program.slug}`}>เข้าสู่วิชา</a>:pending?<span className="inline-flex rounded-full bg-amber-100 px-4 py-2 font-bold text-amber-800">รอผู้ดูแลอนุมัติ</span>:<form action={enrollProgram}><input type="hidden" name="programId" value={program.id}/><input type="hidden" name="priceThb" value={program.priceThb||0}/><button className="btn">{free?"สมัครเข้าคลาสฟรี":"ส่งคำขอสมัครเรียน"}</button></form>}</div></div></article>})}</div>{mine&&programs.length===0&&<div className="rounded-3xl bg-white p-10 text-center"><h2 className="text-2xl font-bold">ยังไม่มีวิชาที่ลงทะเบียน</h2><p className="mt-2 text-slate-600">เลือกวิชาจากหน้าวิชาทั้งหมดแล้วสมัครเข้าคลาสก่อน</p><a className="btn mt-5" href="/learn">ดูวิชาทั้งหมด</a></div>}</section>
  </main>;
}
