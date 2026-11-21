import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weerapat Engineering",
  description: "แพลตฟอร์มเรียนรู้วิศวกรรมและระบบจัดการคอร์ส",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased">{children}</body>
    </html>
  );
}
