import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export type ChatGPTUser = {
  userId: string;
  displayName: string;
  email: string;
  fullName: string | null;
};

export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  const supabase=await createSupabaseServer();
  const {data,error}=await supabase.auth.getClaims();
  const claims=data?.claims as {sub?:string;email?:string;user_metadata?:{display_name?:string;full_name?:string}}|undefined;
  if(error||!claims?.sub)return null;
  const fullName=String(claims.user_metadata?.display_name||claims.user_metadata?.full_name||claims.email||"ผู้เรียน");
  return {userId:claims.sub,displayName:fullName,email:claims.email||"",fullName};
}

export async function requireChatGPTUser(
  returnTo: string,
): Promise<ChatGPTUser> {
  const user = await getChatGPTUser();
  if (user) return user;

  redirect(chatGPTSignInPath(returnTo));
}

export function chatGPTSignInPath(returnTo: string): string {
  return `/login?returnTo=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`;
}

export function chatGPTSignOutPath(returnTo = "/"): string {
  return `/auth/signout?returnTo=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`;
}

function safeRelativeReturnPath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return "/";

  let url: URL;
  try {
    url = new URL(value, "https://app.local");
  } catch {
    return "/";
  }
  if (url.origin !== "https://app.local") return "/";
  return `${url.pathname}${url.search}${url.hash}`;
}
