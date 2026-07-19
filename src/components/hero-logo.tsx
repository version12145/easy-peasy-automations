import { useEffect, useRef, useState } from "react";
import heroLogo from "@/assets/veducate-hero-logo.png.asset.json";

export function HeroLogo() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50, active: false });
  const raf = useRef<number | null>(null);
  const target = useRef({ rx: 0, ry: 0, mx: 50, my: 50, active: false });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      target.current = {
        rx: (0.5 - y) * 18,
        ry: (x - 0.5) * 22,
        mx: x * 100,
        my: y * 100,
        active: true,
      };
    };
    const onLeave = () => {
      target.current = { rx: 0, ry: 0, mx: 50, my: 50, active: false };
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);

    const tick = () => {
      setTilt((prev) => {
        const t = target.current;
        const k = 0.12;
        return {
          rx: prev.rx + (t.rx - prev.rx) * k,
          ry: prev.ry + (t.ry - prev.ry) * k,
          mx: prev.mx + (t.mx - prev.mx) * k,
          my: prev.my + (t.my - prev.my) * k,
          active: t.active,
        };
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const { rx, ry, mx, my, active } = tilt;

  return (
    <div
      ref={wrapRef}
      className="relative flex h-[420px] sm:h-[520px] w-full items-center justify-center"
      style={{ perspective: "1200px" }}
    >
      {/* Inline SVG turbulence filter for liquid distortion */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <filter id="liquid-goo" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.02"
              numOctaves="2"
              seed="4"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="14s"
                values="0.010 0.018; 0.018 0.026; 0.010 0.018"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={active ? 18 : 8} />
          </filter>
        </defs>
      </svg>

      {/* Ambient liquid blobs that follow the cursor */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[3rem]"
        style={{
          background: `radial-gradient(600px circle at ${mx}% ${my}%, rgba(56,120,220,0.28), transparent 55%), radial-gradient(500px circle at ${100 - mx}% ${100 - my}%, rgba(120,180,255,0.22), transparent 60%)`,
          transition: "background 200ms linear",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl animate-logo-glow"
        style={{ background: "radial-gradient(circle, rgba(80,140,240,0.55), transparent 65%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-navy/15 animate-spin-reverse-slow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 animate-spin-slow"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(56,120,220,0.35) 60deg, transparent 140deg, rgba(120,180,255,0.5) 220deg, transparent 320deg)",
          maskImage: "radial-gradient(circle, black 55%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(circle, black 55%, transparent 72%)",
        }}
      />

      {/* The logo itself, tilting to the cursor with a liquid displacement */}
      <div
        className="relative animate-logo-float will-change-transform"
        style={{
          transform: `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`,
          transition: "transform 120ms ease-out",
          transformStyle: "preserve-3d",
        }}
      >
        <img
          src={heroLogo.url}
          alt="VEducate Academy"
          draggable={false}
          className="h-[260px] sm:h-[340px] w-auto select-none object-contain"
          style={{
            filter: "url(#liquid-goo) drop-shadow(0 30px 40px rgba(20,40,90,0.25))",
          }}
        />
      </div>
    </div>
  );
}
