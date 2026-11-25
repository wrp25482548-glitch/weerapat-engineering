"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="section">
      <h1>โหลดหน้าเว็บไม่สำเร็จ</h1>
      <p>กรุณาลองโหลดอีกครั้ง</p>
      <button type="button" className="btn mt-4" onClick={reset}>ลองอีกครั้ง</button>
    </main>
  );
}
