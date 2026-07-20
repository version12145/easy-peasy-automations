import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import mark from "@/assets/veducate-mark-only.png.asset.json";

/**
 * Full-screen route transition loader.
 * - Shows when the router is loading/transitioning to a new route.
 * - Also shows a brief intro on very first client mount so hydration feels smooth.
 * - Kept visible for a minimum window (~700ms) to avoid flicker on fast loads.
 */
export function RouteLoader() {
  const isLoading = useRouterState({
    select: (s) => s.isLoading || s.isTransitioning,
  });

  const [visible, setVisible] = useState(false); // don't block first paint
  const shownAtRef = useRef<number>(0);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    // Skip the very first effect — initial hydration must not show the loader.
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (isLoading) {
      shownAtRef.current = Date.now();
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      setVisible(true);
      return;
    }
    const MIN = 250;
    const elapsed = Date.now() - shownAtRef.current;
    const wait = Math.max(0, MIN - elapsed);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setVisible(false), wait);
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isLoading]);

  return (
    <div
      aria-hidden={!visible}
      className={`pointer-events-none fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/85 backdrop-blur-xl" />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-6">
        <div className="relative">
          {/* pulsing rings */}
          <span className="absolute inset-0 -m-4 rounded-full bg-blue/20 blur-2xl animate-ping" />
          <span
            className="absolute inset-0 -m-2 rounded-full border border-blue/30 animate-ping"
            style={{ animationDuration: "1.6s" }}
          />
          <div className="relative grid place-items-center rounded-2xl bg-white/70 p-4 shadow-navy ring-1 ring-border">
            <img
              src={mark.url}
              alt="VEducate Academy"
              className="h-12 w-auto animate-logo-float"
              draggable={false}
            />
          </div>
        </div>

        {/* progress bar */}
        <div className="relative h-1 w-40 overflow-hidden rounded-full bg-border/60">
          <span className="absolute inset-y-0 -left-1/3 w-1/3 rounded-full grad-navy animate-loader-slide" />
        </div>

        <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Loading experience
        </div>
      </div>
    </div>
  );
}
