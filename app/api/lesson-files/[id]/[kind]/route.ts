import { getChatGPTUser } from "@/app/chatgpt-auth";
import { ensureOwner } from "@/lib/catalog";
import { createSupabaseServer } from "@/lib/supabase/server";

type Context = { params: Promise<{ id: string; kind: string }> };

async function filePath({ params }: Context) {
  const { id, kind } = await params;
  if (!/^[a-f0-9-]{36}$/i.test(id) || !["slides", "document"].includes(kind)) return null;
  return { id, kind, path: `${id}/${kind}.pdf` };
}

export async function GET(request: Request, context: Context) {
  const file = await filePath(context);
  if (!file) return new Response(null, { status: 404 });
  if (!await getChatGPTUser()) return new Response(null, { status: 401 });
  const sb = await createSupabaseServer();
  const { data, error } = await sb.storage.from("lesson-files").download(file.path);
  if (error || !data) return new Response(null, { status: 404 });
  const attachment = new URL(request.url).searchParams.has("download");
  return new Response(data, { headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": `${attachment ? "attachment" : "inline"}; filename="${file.kind}.pdf"`,
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  } });
}

export async function PUT(request: Request, context: Context) {
  const file = await filePath(context);
  if (!file) return new Response(null, { status: 404 });
  const user = await getChatGPTUser();
  if (!user) return new Response(null, { status: 401 });
  try { await ensureOwner(user); } catch { return new Response(null, { status: 403 }); }
  const bytes = await request.arrayBuffer();
  if (bytes.byteLength > 4 * 1024 * 1024) return new Response(null, { status: 413 });
  if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") {
    return new Response("กรุณาเลือกไฟล์ PDF", { status: 400 });
  }
  const sb = await createSupabaseServer();
  const { data: lesson } = await sb.from("lessons").select("id").eq("id", file.id).maybeSingle();
  if (!lesson) return new Response(null, { status: 404 });
  const { error } = await sb.storage.from("lesson-files").upload(file.path, bytes, {
    contentType: "application/pdf", upsert: true,
  });
  if (error) return new Response("บันทึกไฟล์ไม่สำเร็จ", { status: 502 });
  return new Response(null, { status: 204 });
}
