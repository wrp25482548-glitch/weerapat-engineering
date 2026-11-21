import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { FeaturedCourses } from "@/components/featured-courses";
import { getCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export default async function Home() {
  const [user, catalog] = await Promise.all([getChatGPTUser(), getCatalog()]);
  return <main>
    <header className="nav"><a className="brand" href="/"><b>WEERAPAT</b><small>ENGINEERING</small></a><nav><a href="/">หน้าหลัก</a><a href="/learn">บทเรียน</a><a href="/about">เกี่ยวกับ</a></nav><div>{user?<a className="btn small" href="/admin">หลังบ้าน</a>:<a className="btn small" href={chatGPTSignInPath("/")} target="_top">เข้าสู่ระบบ</a>}</div></header>
    <section className="hero"><div className="hero-grid"><div><p className="eyebrow">LEARN • DESIGN • BUILD</p><h1>ENGINEERING<br/><span>MADE PRACTICAL.</span></h1><p>เริ่มต้นเส้นทางวิศวกรรมของคุณด้วยบทเรียนที่เข้าใจง่าย ฝึกทำจากโปรเจกต์จริง และนำทักษะไปใช้กับงานได้ทันที</p><div className="actions"><a className="btn" href="/learn">เริ่มเรียนเลย</a>{user&&<a className="btn ghost" href="/admin">จัดการเนื้อหา</a>}</div></div><div className="orbit"/></div></section>
    <section className="section featured-section"><div className="section-head"><div><p className="eyebrow blue">FEATURED COURSES</p><h2>เลือกทักษะที่อยากพัฒนา แล้วเริ่มสร้างผลงานจริง</h2><p>สำรวจ 3 วิชาหลักของ Weerapat Engineering ตั้งแต่การออกแบบ 3D ระบบอัตโนมัติ ไปจนถึงไมโครคอนโทรลเลอร์ — เลื่อนเพื่อเลือกคอร์สที่ใช่สำหรับคุณ</p></div></div><FeaturedCourses programs={catalog.slice(0, 3)}/></section>
  </main>;
}
