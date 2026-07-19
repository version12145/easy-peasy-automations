import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

const NAV = [
  { to: "/articles", label: "Articles" },
  { to: "/categories", label: "Categories" },
  { to: "/articles", label: "Collections", search: { collection: "all" } as const },
  { to: "/articles", label: "Resources" },
] as const;

export function SiteNav() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    try { localStorage.setItem("ve-theme", "light"); } catch {}
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:pt-5">
      <nav
        className={`pointer-events-auto glass-nav flex w-full max-w-6xl items-center gap-2 rounded-full px-3 py-2 transition-all duration-300 sm:gap-4 sm:px-5 sm:py-2.5 ${
          scrolled ? "translate-y-0 scale-[0.99]" : ""
        }`}
      >
        <Link to="/" className="flex items-center gap-2 pl-1 pr-1 sm:pr-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl grad-navy text-white font-black">V</span>
          <span className="hidden text-sm font-bold tracking-tight text-foreground sm:inline">VEducate</span>
        </Link>

        <div className="mx-2 hidden h-6 w-px bg-border sm:block" />

        <div className="hidden flex-1 items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.label}
              to={n.to}
              className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "!text-foreground !bg-secondary" }}
            >
              {n.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => navigate({ to: "/search" })}
            aria-label="Search"
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="pointer-events-auto absolute top-16 left-3 right-3 md:hidden animate-fade-up">
          <div className="glass-strong rounded-2xl p-3">
            {NAV.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
