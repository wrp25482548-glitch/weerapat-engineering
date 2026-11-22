import { updatePassword } from "@/app/login/actions";

export default async function ResetPassword({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const q = await searchParams;
  const field = "w-full rounded-xl border border-slate-200 px-4 py-3";
  return <main className="grid min-h-screen place-items-center bg-slate-950 px-5 py-12"><section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
    <p className="text-sm font-bold tracking-[.18em] text-blue-600">WEERAPAT ENGINEERING</p><h1 className="mt-2 text-3xl font-extrabold">ตั้งรหัสผ่านใหม่</h1>
    {q.error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-red-700">{q.error}</p>}
    <form action={updatePassword} className="mt-6 grid gap-3"><input className={field} name="password" type="password" minLength={6} placeholder="รหัสผ่านใหม่อย่างน้อย 6 ตัว" required /><input className={field} name="confirmPassword" type="password" minLength={6} placeholder="ยืนยันรหัสผ่านใหม่" required /><button className="rounded-xl bg-blue-600 px-4 py-3 font-bold text-white">บันทึกรหัสผ่านใหม่</button></form>
    <a className="mt-6 block text-center text-sm text-slate-500" href="/login">กลับหน้าเข้าสู่ระบบ</a>
  </section></main>;
}
