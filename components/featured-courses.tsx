"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Program = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  coverImage?: string;
  status?: string;
};

export function FeaturedCourses({ programs }: { programs: Program[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (programs.length < 2) return;
    const timer = window.setInterval(() => {
      setActive((current) => {
        const next = (current + 1) % programs.length;
        rail.current?.children[next]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        return next;
      });
    }, 5500);
    return () => window.clearInterval(timer);
  }, [programs.length]);

  function go(index: number) {
    const next = (index + programs.length) % programs.length;
    rail.current?.children[next]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    setActive(next);
  }

  function syncActive() {
    const node = rail.current;
    if (!node || !node.children.length) return;
    const center = node.scrollLeft + node.clientWidth / 2;
    let nearest = 0;
    let distance = Number.POSITIVE_INFINITY;
    Array.from(node.children).forEach((child, index) => {
      const element = child as HTMLElement;
      const childCenter = element.offsetLeft + element.offsetWidth / 2;
      const nextDistance = Math.abs(childCenter - center);
      if (nextDistance < distance) {
        distance = nextDistance;
        nearest = index;
      }
    });
    setActive(nearest);
  }

  return <div className="featured-slider">
    <div className="slider-controls" aria-label="เลื่อนคอร์สแนะนำ">
      <button onClick={() => go(active - 1)} aria-label="คอร์สก่อนหน้า">←</button>
      <button onClick={() => go(active + 1)} aria-label="คอร์สถัดไป">→</button>
    </div>
    <div className="featured-rail" ref={rail} onScroll={syncActive} aria-label="คอร์สแนะนำ เลื่อนซ้ายหรือขวาเพื่อดูคอร์สทั้งหมด">
      {programs.map((program, index) => <article className="featured-card" key={program.id}>
        <div className="featured-image">
          <Image src={program.coverImage || "/covers/solidworks-design.png"} alt={program.title} fill sizes="(max-width: 760px) 88vw, 430px" />
          <span className={program.status === "published" ? "cover-badge live" : "cover-badge"}>{program.status === "published" ? "เปิดให้เรียนแล้ว" : "เร็ว ๆ นี้"}</span>
        </div>
        <div className="featured-copy">
          <small>COURSE {String(index + 1).padStart(2, "0")}</small>
          <h3>{program.title}</h3>
          <strong>{program.subtitle}</strong>
          <p>{program.description}</p>
          <a className={program.status === "published" ? "featured-link" : "featured-link muted"} href={program.status === "published" ? "/learn" : undefined}>{program.status === "published" ? "เข้าสู่บทเรียน →" : "กำลังพัฒนา"}</a>
        </div>
      </article>)}
    </div>
    <div className="slider-dots" aria-label={`คอร์สที่ ${active + 1} จาก ${programs.length}`}>
      {programs.map((program, index) => <button key={program.id} className={index === active ? "active" : ""} onClick={() => go(index)} aria-label={`ไปคอร์สที่ ${index + 1}`} />)}
    </div>
  </div>;
}
