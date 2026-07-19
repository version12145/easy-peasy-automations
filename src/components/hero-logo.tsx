import { useEffect, useRef, useState } from "react";
import heroLogo from "@/assets/veducate-hero-logo.png.asset.json";

export function HeroLogo() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, active: false });
  const raf = useRef<number | null>(null);
  const target = useRef({ rx: 0, ry: 0, active: false });

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
        active: true,
      };
    };
    const onLeave = () => {
      target.current = { rx: 0, ry: 0, active: false };
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

  const { rx, ry, active } = tilt;

  return (
    <div
      ref={wrapRef}
      className="relative flex h-[360px] sm:h-[420px] w-full items-center justify-center"
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
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={active ? 16 : 6} />
          </filter>
        </defs>
      </svg>

      {/* The logo alone — floating and reacting to the cursor */}
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
          className="h-[240px] sm:h-[300px] w-auto select-none object-contain"
          style={{
            filter: "url(#liquid-goo)",
          }}
        />
      </div>
    </div>
  );
}
