import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { admins, learners, lessons, programs, topics } from "@/db/schema";
import type { ChatGPTUser } from "@/app/chatgpt-auth";

export async function ensureOwner(user: ChatGPTUser) { const db = getDb(); const existing = await db.select().from(admins).limit(1); if (!existing.length) { await db.insert(admins).values({ userId: user.userId, email: user.email }); return user; } const match = await db.select().from(admins).where(eq(admins.userId, user.userId)).limit(1); if (!match.length) throw new Error("บัญชีนี้ไม่มีสิทธิ์เข้าหลังบ้าน"); return user; }
export async function ensureLearner(user: ChatGPTUser) { const db=getDb(); const existing=await db.select().from(learners).where(eq(learners.userId,user.userId)).limit(1); if(existing.length){ await db.update(learners).set({email:user.email,displayName:user.displayName}).where(eq(learners.userId,user.userId)); return existing[0]; } const [created]=await db.insert(learners).values({userId:user.userId,email:user.email,displayName:user.displayName}).returning(); return created; }

export async function ensureSeedData() {
  const db = getDb(); const existing = await db.select({ id: programs.id }).from(programs).limit(1); if (existing.length) return;
  const seeded = await db.insert(programs).values([
    { slug: "solidworks-design", title: "SolidWorks Design", subtitle: "ออกแบบชิ้นงาน 3D และ Assembly", description: "สอนอ่าน Drawing ขึ้นโมเดล Part ประกอบ Assembly และใช้เครื่องมือต่าง ๆ ผ่านชิ้นงานจริง", coverImage: "/covers/solidworks-design.png", status: "published", sortOrder: 1 },
    { slug: "electronics-microcontrollers", title: "Electronics & Microcontrollers", subtitle: "เรียนรู้วงจรและสร้างโปรเจกต์ด้วยไมโครคอนโทรลเลอร์", description: "เรียนรู้ Arduino, ESP32, เซนเซอร์ และการต่อวงจรสำหรับงานจริง", coverImage: "/covers/electronics-microcontrollers.png", status: "draft", sortOrder: 2 },
    { slug: "ai-industrial-web-apps", title: "AI for Industrial Web Apps", subtitle: "สร้าง Web App สำหรับงานอุตสาหกรรมด้วย AI", description: "สร้างแดชบอร์ด OEE, Downtime, Cycle Time และ KPI ด้วย AI", coverImage: "/covers/ai-industrial-web-apps.png", status: "draft", sortOrder: 3 },
  ]).returning();
  const solidworks = seeded.find((row) => row.slug === "solidworks-design"); if (!solidworks) return;
  const [topic] = await db.insert(topics).values({ programId: solidworks.id, slug: "belt-roller-support", title: "Belt Roller Support Assembly", description: "ออกแบบชุดรองรับลูกกลิ้งสายพานจาก Drawing สู่ 3D Assembly", coverImage: "https://i.ytimg.com/vi/PCOiOogZAK4/maxresdefault.jpg", status: "published", sortOrder: 1 }).returning();
  await db.insert(lessons).values([
    { topicId: topic.id, title: "EP.01 Introduction", duration: "03:24", accessType: "free", status: "published", sortOrder: 1 }, { topicId: topic.id, title: "EP.02 Part 01 — Base", duration: "14:36", accessType: "free", status: "published", sortOrder: 2 }, { topicId: topic.id, title: "EP.03 Part 02 — Support", duration: "12:40", accessType: "paid", status: "published", sortOrder: 3 }, { topicId: topic.id, title: "EP.04 Part 03 — Roller", duration: "11:20", accessType: "paid", status: "published", sortOrder: 4 }, { topicId: topic.id, title: "EP.05 Bearing & Shaft", duration: "10:15", accessType: "paid", status: "published", sortOrder: 5 }, { topicId: topic.id, title: "EP.06 Fasteners", duration: "09:30", accessType: "paid", status: "published", sortOrder: 6 }, { topicId: topic.id, title: "EP.07 Final Assembly", duration: "16:45", accessType: "paid", status: "published", sortOrder: 7 }, { topicId: topic.id, title: "EP.08 Assembly Drawing", duration: "13:10", accessType: "paid", status: "published", sortOrder: 8 },
  ]);
}

export async function getCatalog() { await ensureSeedData(); const db = getDb(); const programRows = await db.select().from(programs).orderBy(asc(programs.sortOrder)); const topicRows = await db.select().from(topics).orderBy(asc(topics.sortOrder)); const lessonRows = await db.select().from(lessons).orderBy(asc(lessons.sortOrder)); return programRows.map((program) => ({ ...program, topics: topicRows.filter((topic) => topic.programId === program.id).map((topic) => ({ ...topic, lessons: lessonRows.filter((lesson) => lesson.topicId === topic.id) })) })); }
