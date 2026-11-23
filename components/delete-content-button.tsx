"use client";
import { useState } from "react";
export function DeleteContentButton({action,id,label}:{action:(data:FormData)=>void|Promise<void>;id:string;label:string}){
  const [confirming,setConfirming]=useState(false);
  if(!confirming)return <button type="button" onClick={()=>setConfirming(true)} className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-extrabold text-red-700 hover:bg-red-100">ลบ{label}</button>;
  return <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4"><p className="font-extrabold text-red-800">ยืนยันลบ{label}?</p><p className="mt-1 text-sm text-red-700">เนื้อหาย่อยภายในจะถูกลบด้วย และย้อนกลับไม่ได้</p><div className="mt-3 flex flex-wrap gap-2"><form action={action}><input type="hidden" name="id" value={id}/><button className="rounded-xl bg-red-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-red-700">ยืนยันการลบ</button></form><button type="button" onClick={()=>setConfirming(false)} className="rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-slate-700">ยกเลิก</button></div></div>;
}
