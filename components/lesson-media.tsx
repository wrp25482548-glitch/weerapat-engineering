"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SlideReader } from "./slide-reader";

const sections = ["สไลด์", "วิดีโอ", "เอกสาร"] as const;

export function LessonMedia({ lessonId, title, embed, completed, progressAvailable, initialPage, saveProgress }: {
  lessonId: string;
  title: string;
  embed: string | null;
  completed: boolean;
  progressAvailable: boolean;
  initialPage: number;
  saveProgress: (page?: number) => Promise<boolean>;
}) {
  const [section, setSection] = useState<(typeof sections)[number]>("สไลด์");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const router = useRouter();
  const base = `/api/lesson-files/${lessonId}`;

  return (
    <div className="mt-5">
      <div role="group" aria-label="สื่อบทเรียน" className="mb-4 flex flex-wrap gap-2">
        {sections.map(item => (
          <button key={item} type="button" aria-pressed={item === section}
            className={`rounded-full px-4 py-2 ${item === section ? "bg-blue-100 font-bold text-blue-900" : "hover:bg-slate-100"}`}
            onClick={() => setSection(item)}>
            {item}
          </button>
        ))}
      </div>
      <div hidden={section !== "สไลด์"}>
        <SlideReader url={`${base}/slides`} initialPage={initialPage} savePage={progressAvailable ? saveProgress : undefined} />
      </div>
      {section === "สไลด์" ? null : section === "เอกสาร" ? (
        <a href={`${base}/document?download=1`} className="btn">ดาวน์โหลดเอกสาร PDF</a>
      ) : embed ? (
        <iframe className="aspect-video w-full rounded-xl bg-slate-950" src={embed} title={title}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
      ) : (
        <p className="rounded-xl bg-slate-100 p-5">ยังไม่มี{section}สำหรับบทเรียนนี้</p>
      )}
      {progressAvailable && (
        <button className="btn mt-5" type="button" disabled={pending || completed}
          onClick={() => startTransition(async () => {
            setMessage("");
            try {
              if (await saveProgress()) router.refresh();
              else setMessage("บันทึกความคืบหน้าไม่สำเร็จ กรุณาลองอีกครั้ง");
            } catch {
              setMessage("บันทึกความคืบหน้าไม่สำเร็จ กรุณาลองอีกครั้ง");
            }
          })}>
          {completed ? "✓ เรียนจบแล้ว" : pending ? "กำลังบันทึก…" : "ทำเครื่องหมายว่าเรียนจบ"}
        </button>
      )}
      {message && <p role="alert" className="mt-2 text-red-700">{message}</p>}
    </div>
  );
}
