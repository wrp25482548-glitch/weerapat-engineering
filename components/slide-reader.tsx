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
    if (!pdf) return;
    let disposed = false;
    let cancel: (() => void) | undefined;
    void pdf.getPage(page).then(async slide => {
      const target = canvas.current;
      if (disposed || !target) return;
      const viewport = slide.getViewport({ scale: 1.5 });
      target.width = Math.ceil(viewport.width);
      target.height = Math.ceil(viewport.height);
      const render = slide.render({ canvas: target, viewport });
      cancel = () => render.cancel();
      await render.promise;
    }).catch(() => { if (!disposed) setError("แสดงหน้าสไลด์ไม่สำเร็จ"); });
    return () => { disposed = true; cancel?.(); };
  }, [pdf, page]);

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

  return <div ref={panel} className={`overflow-auto bg-white p-3 ${expanded ? "fixed inset-0 z-[100]" : "rounded-xl"}`}>
    <div className="mb-3 flex flex-wrap items-center gap-3">
      <button type="button" className="btn" disabled={!pdf || page <= 1} onClick={() => move(page - 1)}>ก่อนหน้า</button>
      <span aria-live="polite">{pdf ? `${page} / ${pdf.numPages}` : "—"}</span>
      <button type="button" className="btn" disabled={!pdf || page >= pdf.numPages} onClick={() => move(page + 1)}>ถัดไป</button>
      <button type="button" className="btn" onClick={async () => {
        if (expanded) { setExpanded(false); return; }
        try {
          if (document.fullscreenElement) await document.exitFullscreen();
          else await panel.current?.requestFullscreen();
        } catch { setExpanded(true); }
      }}>{expanded ? "ออกจากมุมมองเต็มจอ" : "สลับเต็มหน้าจอ"}</button>
      <a href={url} target="_blank" rel="noreferrer">เปิด PDF</a>
    </div>
    {error ? <p role="alert">{error}</p> : pdf
      ? <canvas ref={canvas} aria-label={`สไลด์หน้า ${page}`} className="mx-auto max-h-[80vh] max-w-full object-contain" />
      : <p role="status">กำลังโหลดสไลด์…</p>}
    {notice && <p role="status">{notice}</p>}
  </div>;
}
