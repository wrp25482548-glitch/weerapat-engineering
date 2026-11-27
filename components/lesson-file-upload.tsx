"use client";

import { useState } from "react";
import { SlideReader } from "./slide-reader";

export function LessonFileUpload({ id }: { id: string }) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [slideVersion, setSlideVersion] = useState(0);
  return <section className="mt-6 grid gap-3 rounded-xl border p-4">
    <h2 className="font-bold">สไลด์และเอกสาร PDF</h2>
    <p className="text-sm">สูงสุด 4 MB ต่อไฟล์ การอัปโหลดใหม่จะแทนไฟล์เดิม</p>
    {(["slides", "document"] as const).map(kind => <label key={kind} className="grid gap-1">
      {kind === "slides" ? "สไลด์บทเรียน" : "เอกสารประกอบ"}
      <input type="file" accept="application/pdf,.pdf" disabled={busy} onChange={async event => {
        const input = event.currentTarget;
        const file = input.files?.[0];
        if (!file) return;
        if (file.size > 4 * 1024 * 1024) {
          setStatus("ไฟล์ใหญ่เกิน 4 MB");
          input.value = "";
          return;
        }
        setBusy(true);
        setStatus("กำลังอัปโหลด…");
        try {
          const result = await fetch(`/api/lesson-files/${id}/${kind}`, { method: "PUT", body: file });
          setStatus(result.ok ? "บันทึก PDF แล้ว" : "อัปโหลด PDF ไม่สำเร็จ");
          if (result.ok && kind === "slides") setSlideVersion(version => version + 1);
        } catch {
          setStatus("อัปโหลด PDF ไม่สำเร็จ");
        } finally {
          input.value = "";
          setBusy(false);
        }
      }} />
    </label>)}
    <p role="status">{status}</p>
    <button type="button" className="btn justify-self-start" aria-expanded={preview}
      onClick={() => setPreview(open => !open)}>
      {preview ? "ปิดตัวอย่างสไลด์" : "ดูตัวอย่างสไลด์"}
    </button>
    {preview && <SlideReader key={`${id}:${slideVersion}`}
      url={`/api/lesson-files/${id}/slides`} initialPage={1} />}
  </section>;
}
