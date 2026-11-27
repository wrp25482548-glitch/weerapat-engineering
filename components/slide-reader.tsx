"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

export function SlideReader({ url, initialPage, savePage }: {
  url: string;
  initialPage: number;
  savePage?: (page: number) => Promise<boolean>;
}) {
  const [pdf, setPdf] = useState<PDFDocumentProxy>();
  const [page, setPage] = useState(initialPage);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [expanded, setExpanded] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const canvas = useRef<HTMLCanvasElement>(null);
  const saves = useRef(Promise.resolve());

  useEffect(() => {
    let disposed = false;
    let destroy: (() => Promise<void>) | undefined;
    void import("pdfjs-dist").then(async ({ getDocument, GlobalWorkerOptions }) => {
      if (disposed) return;
      GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      const task = getDocument({ url, isEvalSupported: false });
      destroy = () => task.destroy();
      const document = await task.promise;
      if (!disposed) {
        setPage(Math.min(initialPage, document.numPages));
        setPdf(document);
      }
    }).catch(() => { if (!disposed) setError("เปิดสไลด์ไม่ได้ หรือยังไม่มีไฟล์ PDF"); });
    return () => { disposed = true; void destroy?.().catch(() => {}); };
  }, [url, initialPage]);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.floor(entry.contentRect.width);
      if (next > 0) setWidth(next);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!pdf || !width) return;
    let disposed = false;
    let cancel: (() => void) | undefined;
    void pdf.getPage(page).then(async slide => {
      const target = canvas.current;
      if (disposed || !target) return;
      const native = slide.getViewport({ scale: 1 });
      const displayWidth = Math.min(width, window.innerHeight * 0.8 * native.width / native.height);
      const scale = Math.min(displayWidth * Math.min(window.devicePixelRatio || 1, 3), 3200) / native.width;
      const viewport = slide.getViewport({ scale });
      target.style.width = `${displayWidth}px`;
      target.width = Math.ceil(viewport.width);
      target.height = Math.ceil(viewport.height);
      const render = slide.render({ canvas: target, viewport });
      cancel = () => render.cancel();
      await render.promise;
    }).catch(() => { if (!disposed) setError("แสดงหน้าสไลด์ไม่สำเร็จ"); });
    return () => { disposed = true; cancel?.(); };
  }, [pdf, page, width, expanded]);

  function move(next: number) {
    setPage(next);
    setNotice(savePage ? "กำลังบันทึกหน้าล่าสุด…" : "");
    if (savePage) saves.current = saves.current.then(async () => {
      const saved = await savePage(next);
      setNotice(saved ? `บันทึกหน้า ${next} แล้ว` : "บันทึกหน้าล่าสุดไม่สำเร็จ");
    }).catch(() => setNotice("บันทึกหน้าล่าสุดไม่สำเร็จ"));
  }

  useEffect(() => {
    if (!expanded) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setExpanded(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  return <div ref={panel} className={`overflow-auto bg-white ${expanded ? "fixed inset-0 z-[100] p-2" : "rounded-xl"}`}>
    <div ref={stage} className="grid place-items-center overflow-hidden rounded-xl bg-slate-50">
      {error ? <p role="alert" className="p-4">{error}</p> : pdf
        ? <canvas ref={canvas} aria-label={`สไลด์หน้า ${page}`} className="block h-auto max-w-full" />
        : <p role="status" className="p-4">กำลังโหลดสไลด์…</p>}
    </div>
    <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm">
      <button type="button" className="min-h-11 min-w-11 rounded-lg border disabled:opacity-35" aria-label="ก่อนหน้า" disabled={!pdf || page <= 1} onClick={() => move(page - 1)}>‹</button>
      <span aria-live="polite">{pdf ? `${page} / ${pdf.numPages}` : "—"}</span>
      <button type="button" className="min-h-11 min-w-11 rounded-lg border disabled:opacity-35" aria-label="ถัดไป" disabled={!pdf || page >= pdf.numPages} onClick={() => move(page + 1)}>›</button>
      <button type="button" className="min-h-11 rounded-lg px-2 text-slate-700 hover:bg-slate-100" onClick={async () => {
        if (expanded) { setExpanded(false); return; }
        try {
          if (document.fullscreenElement) await document.exitFullscreen();
          else await panel.current?.requestFullscreen();
        } catch { setExpanded(true); }
      }}>{expanded ? "ออกจากเต็มจอ" : "เต็มจอ"}</button>
      <a href={url} className="px-2 text-sm text-slate-600 underline" target="_blank" rel="noreferrer">PDF</a>
    </div>
    {notice && <p role="status" className="mt-1 text-center text-xs text-slate-600">{notice}</p>}
  </div>;
}
