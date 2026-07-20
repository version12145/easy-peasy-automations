import { useEffect, useRef } from "react";
import heroLogo from "@/assets/veducate-hero-logo.png.asset.json";

/**
 * Performance-optimized hero logo:
 * - Mouse tilt via direct DOM transform (no setState per frame)
 * - No animated SVG turbulence (very expensive)
 * - Fully disabled on touch / reduced-motion / small screens
 */
export function HeroLogo() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    const img = imgRef.current;
    if (!el || !img) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduced || coarse) return;

    let rx = 0, ry = 0, tx = 0, ty = 0;
    let raf = 0;
    let running = false;

    const tick = () => {
      rx += (tx - rx) * 0.12;
      ry += (ty - ry) * 0.12;
      img.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
      if (Math.abs(tx - rx) < 0.05 && Math.abs(ty - ry) < 0.05 && tx === 0 && ty === 0) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      tx = (0.5 - y) * 14;
      ty = (x - 0.5) * 18;
      start();
    };
    const onLeave = () => { tx = 0; ty = 0; start(); };

    el.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative flex h-[320px] sm:h-[400px] w-full items-center justify-center"
      style={{ perspective: "1200px" }}
    >
      <div className="relative animate-logo-float will-change-transform" style={{ transformStyle: "preserve-3d" }}>
        <img
          ref={imgRef}
          src={heroLogo.url}
          alt="VEducate Academy"
          draggable={false}
          fetchPriority="high"
          decoding="async"
          className="h-[220px] sm:h-[280px] w-auto select-none object-contain"
          style={{ transition: "transform 120ms ease-out" }}
        />
      </div>
    </div>
  );
}
