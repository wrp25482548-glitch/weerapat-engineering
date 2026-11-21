import Image from "next/image";
import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { getCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export default async function Home() {
  const [user, catalog] = await Promise.all([getChatGPTUser(), getCatalog()]);
  return <main>
    <header className="nav"><a className="brand" href="/"><b>WEERAPAT</b><small>ENGINEERING</small></a><nav><a href="/">หน้าหลัก</a><a href="/learn">บทเรียน</a><a href="/about">เกี่ยวกับ</a></nav><div>{user?<a className="btn small" href="/admin">หลังบ้าน</a>:<a className="btn small" href={chatGPTSignInPath("/")} target="_top">เข้าสู่ระบบ</a>}</div></header>
    <section className="hero"><div className="hero-grid"><div><p className="eyebrow">LEARN • DESIGN • BUILD</p><h1>ENGINEERING<br/><span>MADE PRACTICAL.</span></h1><p>เรียนรู้วิศวกรรมจากโปรเจกต์จริง จัดการบทเรียน สิทธิ์ และเนื้อหาผ่านระบบหลังบ้านที่ปลอดภัย</p><div className="actions"><a className="btn" href="/learn">ดูบทเรียน</a>{user&&<a className="btn ghost" href="/admin">จัดการเนื้อหา</a>}</div></div><div className="orbit"/></div></section>
    <section className="section"><div className="section-head"><div><p className="eyebrow blue">FEATURED COURSES</p><h2>คอร์สแนะนำ</h2><p>ข้อมูลทุกการ์ดมาจากฐานข้อมูลและแก้ไขได้จากหลังบ้าน</p></div></div><div className="program-list">{catalog.map((program,index)=><article className="program" key={program.id}><div className="program-image"><Image src={program.coverImage||"/covers/solidworks-design.png"} alt={program.title} fill sizes="(max-width: 700px) 100vw, 320px"/></div><div><small>COURSE {String(index+1).padStart(2,"0")}</small><h3>{program.title}</h3><strong>{program.subtitle}</strong><p>{program.description}</p><span className={program.status==="published"?"status live":"status"}>{program.status==="published"?"เปิดให้เรียน":"เร็ว ๆ นี้"}</span></div></article>)}</div></section>
  </main>;
}
