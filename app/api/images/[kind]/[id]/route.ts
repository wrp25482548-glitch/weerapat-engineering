import { createClient } from "@supabase/supabase-js";

const tables={program:"programs",topic:"topics",lesson:"lessons"} as const;

export async function GET(request:Request,{params}:{params:Promise<{kind:string;id:string}>}){
  const {kind,id}=await params;
  const table=tables[kind as keyof typeof tables];
  if(!table)return new Response("Not found",{status:404});
  const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||"",process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||"",{auth:{persistSession:false,autoRefreshToken:false}});
  const {data}=await sb.from(table).select("cover_image").eq("id",id).maybeSingle();
  const value=String(data?.cover_image||"");
  if(!value)return Response.redirect(new URL("/covers/solidworks-design.png",request.url),307);
  if(value.startsWith("/"))return Response.redirect(new URL(value,request.url),307);
  if(/^https?:\/\//i.test(value))return Response.redirect(value,307);
  const match=value.match(/^data:(image\/(?:jpeg|png|webp));base64,([\s\S]+)$/);
  if(!match)return new Response("Invalid image",{status:404});
  const cacheControl = kind === "lesson"
    ? "no-cache"
    : "public, max-age=300, s-maxage=300, stale-while-revalidate=86400";
  return new Response(Buffer.from(match[2],"base64"),{headers:{"content-type":match[1],"cache-control":cacheControl}});
}
