"use client";

import { useState } from "react";

export function VideoUploader({lessonId,hasVideo}:{lessonId:number;hasVideo:boolean}){
  const [file,setFile]=useState<File|null>(null);
  const [progress,setProgress]=useState("");
  async function upload(){
    if(!file)return;
    setProgress("กำลังอัปโหลด...");
    const response=await fetch(`/api/admin/videos?lessonId=${lessonId}`,{method:"PUT",headers:{"content-type":file.type||"video/mp4","x-file-name":encodeURIComponent(file.name)},body:file});
    if(!response.ok){setProgress((await response.text())||"อัปโหลดไม่สำเร็จ");return;}
    setProgress("อัปโหลดสำเร็จ");
    window.location.reload();
  }
  return <div className="flex flex-wrap items-center gap-2 lg:col-span-12">
    <input className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" type="file" accept="video/mp4,video/webm" onChange={e=>setFile(e.target.files?.[0]||null)}/>
    <button type="button" onClick={upload} disabled={!file||progress==="กำลังอัปโหลด..."} className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">{hasVideo?"เปลี่ยนวิดีโอ":"อัปโหลดวิดีโอ"}</button>
    <span className="text-sm text-slate-500">{hasVideo&&!progress?"มีไฟล์วิดีโอแล้ว":progress}</span>
  </div>;
}
