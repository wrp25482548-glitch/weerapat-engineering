"use server";
import { revalidatePath } from "next/cache";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { ensureOwner } from "@/lib/catalog";
import { createSupabaseServer } from "@/lib/supabase/server";
async function db(){const user=await requireChatGPTUser("/admin");await ensureOwner(user);return createSupabaseServer();}
const v=(d:FormData,k:string)=>String(d.get(k)||"").trim(),n=(d:FormData,k:string)=>Number(v(d,k)||0),slug=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||`item-${Date.now()}`;
const refresh=()=>{revalidatePath("/");revalidatePath("/learn");revalidatePath("/admin")};
export async function addProgram(d:FormData){const sb=await db(),title=v(d,"title");if(!title)return;await sb.from("programs").insert({slug:slug(v(d,"slug")||title),title,subtitle:v(d,"subtitle"),description:v(d,"description"),cover_image:v(d,"coverImage"),price_thb:n(d,"priceThb"),status:v(d,"status")||"draft",sort_order:n(d,"sortOrder")});refresh()}
export async function updateProgram(d:FormData){const sb=await db();await sb.from("programs").update({title:v(d,"title"),subtitle:v(d,"subtitle"),description:v(d,"description"),cover_image:v(d,"coverImage"),price_thb:n(d,"priceThb"),status:v(d,"status"),sort_order:n(d,"sortOrder")}).eq("id",v(d,"id"));refresh()}
export async function addTopic(d:FormData){const sb=await db(),title=v(d,"title");if(!title)return;await sb.from("topics").insert({program_id:v(d,"programId"),slug:slug(v(d,"slug")||title),title,description:v(d,"description"),cover_image:v(d,"coverImage"),status:v(d,"status")||"draft",sort_order:n(d,"sortOrder")});refresh()}
export async function updateTopic(d:FormData){const sb=await db();await sb.from("topics").update({title:v(d,"title"),description:v(d,"description"),cover_image:v(d,"coverImage"),status:v(d,"status"),sort_order:n(d,"sortOrder")}).eq("id",v(d,"id"));refresh()}
export async function addLesson(d:FormData){const sb=await db(),title=v(d,"title");if(!title)return;await sb.from("lessons").insert({topic_id:v(d,"topicId"),title,description:v(d,"description"),access_type:v(d,"accessType")==="free"?"free":"paid",cover_image:v(d,"coverImage"),duration:v(d,"duration"),status:v(d,"status")||"draft",sort_order:n(d,"sortOrder")});refresh()}
export async function updateLesson(d:FormData){const sb=await db();await sb.from("lessons").update({title:v(d,"title"),description:v(d,"description"),access_type:v(d,"accessType")==="free"?"free":"paid",cover_image:v(d,"coverImage"),duration:v(d,"duration"),status:v(d,"status"),sort_order:n(d,"sortOrder")}).eq("id",v(d,"id"));refresh()}
export async function grantLessonAccess(d:FormData){const sb=await db();await sb.from("entitlements").upsert({user_id:v(d,"userId"),lesson_id:v(d,"lessonId"),can_view:true},{onConflict:"user_id,lesson_id"});refresh()}
export async function revokeLessonAccess(d:FormData){const sb=await db();await sb.from("entitlements").upsert({user_id:v(d,"userId"),lesson_id:v(d,"lessonId"),can_view:false},{onConflict:"user_id,lesson_id"});refresh()}
