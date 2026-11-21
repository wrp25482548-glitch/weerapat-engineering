import { and, eq } from "drizzle-orm";
import type { ChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { admins, entitlements, lessons } from "@/db/schema";

export async function canViewLesson(user:ChatGPTUser|null,lesson:typeof lessons.$inferSelect){
  if(lesson.status!=="published")return false;
  if(lesson.accessType==="free")return true;
  if(!user)return false;
  const db=getDb();
  const admin=await db.select({id:admins.id}).from(admins).where(eq(admins.userId,user.userId)).limit(1);
  if(admin.length)return true;
  const right=await db.select({canView:entitlements.canView}).from(entitlements).where(and(eq(entitlements.userId,user.userId),eq(entitlements.lessonId,lesson.id))).limit(1);
  return right[0]?.canView===true;
}
