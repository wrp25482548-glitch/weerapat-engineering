"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children, className, pendingText = "กำลังบันทึก..." }: { children: React.ReactNode; className: string; pendingText?: string }) {
  const { pending } = useFormStatus();
  return <button className={className} disabled={pending} aria-busy={pending}>{pending ? pendingText : children}</button>;
}
