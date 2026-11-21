"use client";

import { useState } from "react";

export function VideoUploader({lessonId,hasVideo}:{lessonId:string;hasVideo:boolean}){
  const [file,setFile]=useState<File|null>(null);
  const [progress,setProgress]=useState("");
  async function upload(){
    if(!file)return;
    setProgress("กำลังอัปโหลด...");
    const response=await fetch(`/api/admin/videos`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({lessonId,fileName:file.name,type:file.type})});
    if(!response.ok){setProgress((await response.text())||"เตรียมอัปโหลดไม่สำเร็จ");return;}
    const signed=await response.json() as {signedUrl:string;path:string};
    const upload=await fetch(signed.signedUrl,{method:"PUT",headers:{"content-type":file.type||"video/mp4"},body:file});
    if(!upload.ok){setProgress("อัปโหลดไฟล์ไม่สำเร็จ");return;}
    const saved=await fetch(`/api/admin/videos`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({lessonId,path:signed.path})});
    if(!saved.ok){setProgress((await saved.text())||"บันทึกวิดีโอไม่สำเร็จ");return;}
    setProgress("อัปโหลดสำเร็จ");
    window.location.reload();
  }
  return <div className="flex flex-wrap items-center gap-2 lg:col-span-12">
    <input className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" type="file" accept="video/mp4,video/webm" onChange={e=>setFile(e.target.files?.[0]||null)}/>
    <button type="button" onClick={upload} disabled={!file||progress==="กำลังอัปโหลด..."} className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">{hasVideo?"เปลี่ยนวิดีโอ":"อัปโหลดวิดีโอ"}</button>
    <span className="text-sm text-slate-500">{hasVideo&&!progress?"มีไฟล์วิดีโอแล้ว":progress}</span>
  </div>;
}
