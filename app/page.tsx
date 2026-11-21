import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { FeaturedCourses } from "@/components/featured-courses";
import { getCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export default async function Home() {
  const [user, catalog] = await Promise.all([getChatGPTUser(), getCatalog()]);
  return <main>
    <header className="nav"><a className="brand" href="/"><b>WEERAPAT</b><small>ENGINEERING</small></a><nav><a href="/">หน้าหลัก</a><a href="/learn">บทเรียน</a><a href="/about">เกี่ยวกับ</a></nav><div>{user?<a className="btn small" href="/admin">หลังบ้าน</a>:<a className="btn small" href={chatGPTSignInPath("/")} target="_top">เข้าสู่ระบบ</a>}</div></header>
    <section className="hero"><div className="hero-grid"><div><p className="eyebrow">LEARN • DESIGN • BUILD</p><h1>ENGINEERING<br/><span>MADE PRACTICAL.</span></h1><p>เรียนรู้วิศวกรรมจากโปรเจกต์จริง จัดการบทเรียน สิทธิ์ และเนื้อหาผ่านระบบหลังบ้านที่ปลอดภัย</p><div className="actions"><a className="btn" href="/learn">ดูบทเรียน</a>{user&&<a className="btn ghost" href="/admin">จัดการเนื้อหา</a>}</div></div><div className="orbit"/></div></section>
    <section className="section featured-section"><div className="section-head"><div><p className="eyebrow blue">FEATURED COURSES</p><h2>คอร์สแนะนำ</h2><p>3 วิชาหลักของ Weerapat Engineering เลื่อนดูได้ทั้งบนคอมพิวเตอร์และมือถือ</p></div></div><FeaturedCourses programs={catalog}/></section>
  </main>;
}
