"use client";

import { useEffect, useState } from "react";

export function VideoUploader({ lessonId, hasVideo, currentUrl = "" }: { lessonId: string; hasVideo: boolean; currentUrl?: string }) {
  const [url, setUrl] = useState(currentUrl);
  const [progress, setProgress] = useState("");
  useEffect(() => {
    if (!hasVideo || currentUrl) return;
    fetch(`/api/admin/videos?lessonId=${encodeURIComponent(lessonId)}`).then(async response => {
      if (response.ok) setUrl((await response.json()).url || "");
    });
  }, [lessonId, hasVideo, currentUrl]);
  async function save() {
    setProgress("กำลังบันทึก...");
    const response = await fetch("/api/admin/videos", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ lessonId, path: url.trim() }) });
    if (!response.ok) { setProgress((await response.text()) || "บันทึกลิงก์ไม่สำเร็จ"); return; }
    setProgress("บันทึกลิงก์ YouTube แล้ว");
    window.location.reload();
  }
  return <div className="grid gap-2 lg:grid-cols-[1fr_auto] lg:items-center">
    <input className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" type="url" value={url} onChange={event => setUrl(event.target.value)} placeholder="วางลิงก์ YouTube เช่น https://youtu.be/xxxxxxxxxxx" />
    <button type="button" onClick={save} disabled={!url.trim() || progress === "กำลังบันทึก..."} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">{hasVideo ? "บันทึกการเปลี่ยนลิงก์" : "บันทึกลิงก์ YouTube"}</button>
    <span className="text-sm text-slate-500 lg:col-span-2">{progress || (hasVideo ? "มีลิงก์วิดีโอแล้ว สามารถวางลิงก์ใหม่เพื่อเปลี่ยนได้" : "รองรับ youtu.be, watch, Shorts และ Embed")}</span>
  </div>;
}
