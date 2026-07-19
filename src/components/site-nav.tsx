import { Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import logo from "@/assets/veducate-mark.png.asset.json";
import { listCategories } from "@/lib/wordpress.functions";

const STATIC_NAV = [
  { to: "/", label: "Home" },
  { to: "/articles", label: "Articles" },
  { to: "/categories", label: "Categories" },
] as const;

const navCategoriesQO = queryOptions({
  queryKey: ["nav-categories"],
  queryFn: () => listCategories({ data: { perPage: 8, hideEmpty: true } }),
  staleTime: 5 * 60_000,
});

function CategoriesDropdown() {
  const { data: cats } = useSuspenseQuery(navCategoriesQO);
  const [open, setOpen] = useState(false);
  if (!cats.length) return null;
  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        Topics <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open ? (
        <div className="absolute left-0 top-full pt-2">
          <div className="glass-strong rounded-2xl p-2 min-w-56 shadow-navy/20 shadow-2xl">
            {cats.map((c) => (
              <Link
                key={c.id}
                to="/category/$slug"
                params={{ slug: c.slug }}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-4 rounded-xl px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                <span className="truncate">{c.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{c.count}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

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
        <Link to="/" className="flex items-center gap-2.5 pl-1 pr-1 sm:pr-2" aria-label="VEducate Academy">
          <img src={logo.url} alt="VEducate Academy" className="h-6 w-auto shrink-0 sm:h-7" />
          <span className="hidden text-sm font-bold tracking-tight text-navy sm:inline">VEducate</span>
        </Link>

        <div className="mx-2 hidden h-6 w-px bg-border sm:block" />

        <div className="hidden flex-1 items-center gap-1 md:flex">
          {STATIC_NAV.map((n) => (
            <Link
              key={n.label}
              to={n.to}
              className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "!text-foreground !bg-secondary" }}
            >
              {n.label}
            </Link>
          ))}
          <Suspense fallback={null}>
            <CategoriesDropdown />
          </Suspense>
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
            {STATIC_NAV.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary"
              >
                {n.label}
              </Link>
            ))}
            <Suspense fallback={null}>
              <MobileCategories onNavigate={() => setOpen(false)} />
            </Suspense>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MobileCategories({ onNavigate }: { onNavigate: () => void }) {
  const { data: cats } = useSuspenseQuery(navCategoriesQO);
  if (!cats.length) return null;
  return (
    <>
      <div className="mt-2 border-t border-border/60 pt-2 px-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Topics
      </div>
      {cats.map((c) => (
        <Link
          key={c.id}
          to="/category/$slug"
          params={{ slug: c.slug }}
          onClick={onNavigate}
          className="block rounded-xl px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
        >
          {c.name}
        </Link>
      ))}
    </>
  );
}
