"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { entitlements, lessons, programs, topics } from "@/db/schema";
import { ensureOwner } from "@/lib/catalog";

async function authorize() { const user = await requireChatGPTUser("/admin"); await ensureOwner(user); }
const value = (data: FormData, key: string) => String(data.get(key) ?? "").trim();
const number = (data: FormData, key: string) => Number(value(data, key) || 0);
const slugify = (input: string) => input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `item-${Date.now()}`;
function refresh() { revalidatePath("/"); revalidatePath("/learn"); revalidatePath("/admin"); }

export async function addProgram(data: FormData) { await authorize(); const title=value(data,"title"); if(!title) return; await getDb().insert(programs).values({ slug:slugify(value(data,"slug")||title), title, subtitle:value(data,"subtitle"), description:value(data,"description"), coverImage:value(data,"coverImage"), priceThb:number(data,"priceThb"), status:value(data,"status")||"draft", sortOrder:number(data,"sortOrder") }); refresh(); }
export async function updateProgram(data: FormData) { await authorize(); const id=number(data,"id"); await getDb().update(programs).set({ title:value(data,"title"), subtitle:value(data,"subtitle"), description:value(data,"description"), coverImage:value(data,"coverImage"), priceThb:number(data,"priceThb"), status:value(data,"status"), sortOrder:number(data,"sortOrder") }).where(eq(programs.id,id)); refresh(); }
export async function addTopic(data: FormData) { await authorize(); const title=value(data,"title"); if(!title) return; await getDb().insert(topics).values({ programId:number(data,"programId"), slug:slugify(value(data,"slug")||title), title, description:value(data,"description"), coverImage:value(data,"coverImage"), status:value(data,"status")||"draft", sortOrder:number(data,"sortOrder") }); refresh(); }
export async function updateTopic(data: FormData) { await authorize(); const id=number(data,"id"); await getDb().update(topics).set({ title:value(data,"title"), description:value(data,"description"), coverImage:value(data,"coverImage"), status:value(data,"status"), sortOrder:number(data,"sortOrder") }).where(eq(topics.id,id)); refresh(); }
export async function addLesson(data: FormData) { await authorize(); const title=value(data,"title"); if(!title) return; await getDb().insert(lessons).values({ topicId:number(data,"topicId"), title, description:value(data,"description"), accessType:value(data,"accessType")==="free"?"free":"paid", coverImage:value(data,"coverImage"), duration:value(data,"duration"), status:value(data,"status")||"draft", sortOrder:number(data,"sortOrder") }); refresh(); }
export async function updateLesson(data: FormData) { await authorize(); const id=number(data,"id"); await getDb().update(lessons).set({ title:value(data,"title"), description:value(data,"description"), accessType:value(data,"accessType")==="free"?"free":"paid", coverImage:value(data,"coverImage"), duration:value(data,"duration"), status:value(data,"status"), sortOrder:number(data,"sortOrder") }).where(eq(lessons.id,id)); refresh(); }
export async function grantLessonAccess(data: FormData) { await authorize(); const userId=value(data,"userId"),lessonId=number(data,"lessonId"); if(!userId||!lessonId)return; await getDb().insert(entitlements).values({userId,lessonId,canView:true}).onConflictDoUpdate({target:[entitlements.userId,entitlements.lessonId],set:{canView:true}}); refresh(); }
export async function revokeLessonAccess(data: FormData) { await authorize(); const userId=value(data,"userId"),lessonId=number(data,"lessonId"); if(!userId||!lessonId)return; await getDb().insert(entitlements).values({userId,lessonId,canView:false}).onConflictDoUpdate({target:[entitlements.userId,entitlements.lessonId],set:{canView:false}}); refresh(); }
