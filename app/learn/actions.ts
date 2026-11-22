"use server";
import { redirect } from "next/navigation";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { createSupabaseServer } from "@/lib/supabase/server";
export async function enrollProgram(data:FormData){const user=await requireChatGPTUser("/learn");const programId=String(data.get("programId")||"");if(!programId)redirect("/learn");const sb=await createSupabaseServer();const {data:program}=await sb.from("programs").select("price_thb").eq("id",programId).maybeSingle();const status=Number(program?.price_thb||0)===0?"active":"pending";const {data:existing}=await sb.from("enrollments").select("id").eq("user_id",user.userId).eq("program_id",programId).maybeSingle();if(existing)await sb.from("enrollments").update({status}).eq("id",existing.id);else await sb.from("enrollments").insert({user_id:user.userId,program_id:programId,status});redirect(status==="active"?"/learn?view=mine":"/learn");}
