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
  const slider = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [allowAutoplay, setAllowAutoplay] = useState(false);

  function scrollToCourse(index: number) {
    const node = rail.current;
    const child = node?.children[index] as HTMLElement | undefined;
    if (!node || !child) return;
    const left = child.offsetLeft - (node.clientWidth - child.offsetWidth) / 2;
    node.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }

  useEffect(() => {
    const media = window.matchMedia("(min-width: 761px) and (hover: hover) and (pointer: fine)");
    const sync = () => setAllowAutoplay(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const node = slider.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting && entry.intersectionRatio >= 0.35), { threshold: [0, 0.35, 0.7] });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (programs.length < 2 || !isVisible || !allowAutoplay) return;
    const timer = window.setInterval(() => {
      setActive((current) => {
        const next = (current + 1) % programs.length;
        scrollToCourse(next);
        return next;
      });
    }, 5500);
    return () => window.clearInterval(timer);
  }, [programs.length, isVisible, allowAutoplay]);

  function go(index: number) {
    const next = (index + programs.length) % programs.length;
    scrollToCourse(next);
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

  return <div className="featured-slider" ref={slider}>
    <div className="slider-controls" aria-label="เลื่อนคอร์สแนะนำ">
      <button onClick={() => go(active - 1)} aria-label="คอร์สก่อนหน้า">←</button>
      <button onClick={() => go(active + 1)} aria-label="คอร์สถัดไป">→</button>
    </div>
    <div className="featured-rail" ref={rail} onScroll={syncActive} aria-label="คอร์สแนะนำ เลื่อนซ้ายหรือขวาเพื่อดูคอร์สทั้งหมด">
      {programs.map((program, index) => <a className={`featured-card${program.status === "published" ? " clickable" : ""}`} key={program.id} href={program.status === "published" ? "/learn" : undefined} aria-disabled={program.status !== "published"}>
        <div className="featured-image">
          <Image src={program.coverImage || "/covers/solidworks-design.png"} alt={program.title} fill sizes="(max-width: 760px) 88vw, 430px" />
          <span className={program.status === "published" ? "cover-badge live" : "cover-badge"}>{program.status === "published" ? "เปิดให้เรียนแล้ว" : "เร็ว ๆ นี้"}</span>
        </div>
        <div className="featured-copy">
          <small>COURSE {String(index + 1).padStart(2, "0")}</small>
          <h3>{program.title}</h3>
          <strong>{program.subtitle}</strong>
          <p>{program.description}</p>
          <span className={program.status === "published" ? "featured-link" : "featured-link muted"}>{program.status === "published" ? "กดที่การ์ดเพื่อเริ่มเรียน →" : "กำลังพัฒนา"}</span>
        </div>
      </a>)}
    </div>
    <div className="slider-dots" aria-label={`คอร์สที่ ${active + 1} จาก ${programs.length}`}>
      {programs.map((program, index) => <button key={program.id} className={index === active ? "active" : ""} onClick={() => go(index)} aria-label={`ไปคอร์สที่ ${index + 1}`} />)}
    </div>
  </div>;
}
