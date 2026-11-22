import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  if (!code) {
    return NextResponse.redirect(new URL("/login?error=" + encodeURIComponent("ลิงก์ยืนยันไม่ถูกต้องหรือหมดอายุ กรุณาขออีเมลฉบับใหม่"), url.origin));
  }
  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/login?error=" + encodeURIComponent("ยืนยันอีเมลไม่สำเร็จ กรุณาขออีเมลฉบับใหม่"), url.origin));
  }
  const destination = next?.startsWith("/") && !next.startsWith("//") ? next : "/learn";
  return NextResponse.redirect(new URL(destination, url.origin));
}
