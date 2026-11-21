"use server";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
const safe=(v:FormDataEntryValue|null)=>{const s=String(v||"/");return s.startsWith("/")&&!s.startsWith("//")?s:"/"};
export async function signIn(data:FormData){const sb=await createSupabaseServer();const email=String(data.get("email")||"");const password=String(data.get("password")||"");const {error}=await sb.auth.signInWithPassword({email,password});if(error)redirect(`/login?error=${encodeURIComponent("อีเมลหรือรหัสผ่านไม่ถูกต้อง")}`);redirect(safe(data.get("returnTo")));}
export async function signUp(data:FormData){const sb=await createSupabaseServer();const email=String(data.get("email")||"");const password=String(data.get("password")||"");const display_name=String(data.get("displayName")||"");const {error}=await sb.auth.signUp({email,password,options:{data:{display_name}}});if(error)redirect(`/login?error=${encodeURIComponent(error.message)}`);redirect(`/login?message=${encodeURIComponent("สมัครสำเร็จ กรุณาตรวจอีเมลหรือเข้าสู่ระบบ")}`);}
