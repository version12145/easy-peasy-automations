import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Clock,
  Hash,
  History,
  Loader2,
  Search as SearchIcon,
  SlidersHorizontal,
  TrendingUp,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { listCategories, siteSearch } from "@/lib/wordpress.functions";
import { formatDate } from "@/lib/wordpress";
import { SiteNav } from "@/components/site-nav";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  cat: fallback(z.string(), "").default(""),
  sort: fallback(z.string(), "relevance").default("relevance"),
  page: fallback(z.number().int(), 1).default(1),
});

export const Route = createFileRoute("/search")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Search — VEducate Academy" },
      { name: "description", content: "Search articles, tutorials and topics across VEducate Academy." },
    ],
  }),
  component: SearchPage,
});

const TRENDING = [
  "Artificial Intelligence",
  "Python",
  "Cloud",
  "Cyber Security",
  "LLMs",
  "Career",
  "DevOps",
  "Kubernetes",
];

const RECENT_KEY = "ve.search.recent";
const MAX_RECENT = 6;
const PER_PAGE = 12;

function useDebounce<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function highlight(text: string, term: string): React.ReactNode {
  if (!term) return text;
  const parts = term.trim().split(/\s+/).filter((p) => p.length > 1).map(escapeRegExp);
  if (!parts.length) return text;
  const re = new RegExp(`(${parts.join("|")})`, "ig");
  const chunks = text.split(re);
  return chunks.map((c, i) =>
    re.test(c) ? (
      <mark key={i} className="rounded bg-blue/15 px-0.5 text-navy">
        {c}
      </mark>
    ) : (
      <span key={i}>{c}</span>
    ),
  );
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function SearchPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });
  const [term, setTerm] = useState(search.q);
  const inputRef = useRef<HTMLInputElement>(null);
  const [recents, setRecents] = useState<string[]>([]);

  // Load recent searches
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecents(JSON.parse(raw));
    } catch { /* noop */ }
  }, []);

  // Keep input in sync when q changes externally (back/forward, trending click)
  useEffect(() => setTerm(search.q), [search.q]);

  const debounced = useDebounce(term, 300);

  // Push debounced term into URL (reset page when the term changes)
  useEffect(() => {
    if (debounced === search.q) return;
    navigate({
      search: (prev) => ({ ...prev, q: debounced, page: 1 }),
      replace: true,
    });
  }, [debounced, search.q, navigate]);

  // Persist a query into recents once it's been "committed" for a moment
  useEffect(() => {
    const q = debounced.trim();
    if (q.length < 2) return;
    const t = setTimeout(() => {
      setRecents((prev) => {
        const next = [q, ...prev.filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, MAX_RECENT);
        try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* noop */ }
        return next;
      });
    }, 1200);
    return () => clearTimeout(t);
  }, [debounced]);

  // Keyboard: `/` focus, Esc clear
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        setTerm("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const categoriesQ = useQuery({
    queryKey: ["categories", "search-panel"],
    queryFn: () => listCategories({ data: { perPage: 30 } }),
    staleTime: 5 * 60_000,
  });

  const activeCategoryId = useMemo(() => {
    if (!search.cat) return undefined;
    return categoriesQ.data?.find((c) => c.slug === search.cat)?.id;
  }, [search.cat, categoriesQ.data]);

  const enabled = debounced.trim().length > 1;
  const [orderby, order] = useMemo<["relevance" | "date" | "title", "asc" | "desc"]>(() => {
    switch (search.sort) {
      case "newest": return ["date", "desc"];
      case "oldest": return ["date", "asc"];
      case "title": return ["title", "asc"];
      default: return ["relevance", "desc"];
    }
  }, [search.sort]);

  const results = useQuery({
    queryKey: ["site-search", debounced, search.page, activeCategoryId ?? null, orderby, order],
    queryFn: () =>
      siteSearch({
        data: {
          q: debounced.trim(),
          page: search.page,
          perPage: PER_PAGE,
          categoryId: activeCategoryId,
          orderby,
          order,
        },
      }),
    enabled: enabled && (search.cat ? !!activeCategoryId : true),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const setSort = (sort: string) => navigate({ search: (p) => ({ ...p, sort, page: 1 }), replace: true });
  const setCat = (slug: string) => navigate({ search: (p) => ({ ...p, cat: slug, page: 1 }), replace: true });
  const setPage = (page: number) => navigate({ search: (p) => ({ ...p, page }) });

  const clearRecents = useCallback(() => {
    setRecents([]);
    try { localStorage.removeItem(RECENT_KEY); } catch { /* noop */ }
  }, []);

  const data = results.data;
  const articles = data?.articles ?? [];
  const totalPages = data?.totalPages ?? 0;
  const total = data?.total ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-32 sm:pt-40 pb-24">
        <div className="text-xs font-semibold uppercase tracking-widest text-blue">Instant search</div>
        <h1 className="mt-2 text-editorial text-5xl sm:text-6xl text-foreground">
          Find what to learn <em className="italic grad-text">next</em>.
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          Full-text search across every article, tutorial, category and tag published on VEducate Academy.
        </p>

        {/* Search input */}
        <div className="relative mt-10 group">
          <div className="pointer-events-none absolute -inset-2 rounded-[2rem] grad-navy opacity-10 blur-xl" />
          <div className="relative glass-strong flex items-center gap-3 rounded-2xl px-5 py-4">
            <SearchIcon className="h-5 w-5 shrink-0 text-navy" />
            <input
              ref={inputRef}
              autoFocus
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search articles, tutorials, topics…"
              className="flex-1 min-w-0 bg-transparent text-lg outline-none placeholder:text-muted-foreground"
              aria-label="Search"
            />
            {results.isFetching && enabled ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
            ) : term ? (
              <button
                onClick={() => { setTerm(""); inputRef.current?.focus(); }}
                aria-label="Clear"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
            <kbd className="hidden sm:inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              /
            </kbd>
          </div>
        </div>

        {/* Empty state */}
        {!enabled ? (
          <div className="mt-12 animate-fade-up space-y-10">
            {recents.length ? (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    <History className="h-3.5 w-3.5" /> Recent searches
                  </div>
                  <button onClick={clearRecents} className="text-xs text-muted-foreground hover:text-navy">Clear</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recents.map((r) => (
                    <button
                      key={r}
                      onClick={() => setTerm(r)}
                      className="rounded-full glass px-4 py-2 text-sm font-medium text-foreground/80 hover:border-blue hover:text-navy transition-colors"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" /> Trending searches
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING.map((t, i) => (
                  <button
                    key={t}
                    onClick={() => setTerm(t)}
                    className="animate-fade-up rounded-full glass px-4 py-2 text-sm font-medium text-foreground/80 hover:border-blue hover:text-navy transition-colors"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {categoriesQ.data?.length ? (
              <div>
                <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Popular categories</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {categoriesQ.data.slice(0, 6).map((c) => (
                    <Link
                      key={c.id}
                      to="/category/$slug"
                      params={{ slug: c.slug }}
                      className="group flex items-center justify-between glass rounded-2xl px-5 py-4 hover:bg-secondary transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-foreground group-hover:text-navy">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.count} articles</div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-navy transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Loading skeletons on first search */}
        {enabled && results.isLoading ? (
          <div className="mt-10 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl glass" />
            ))}
          </div>
        ) : null}

        {/* Error */}
        {enabled && results.isError ? (
          <div className="mt-10 glass rounded-3xl p-8">
            <div className="font-semibold text-foreground">Something went wrong</div>
            <p className="mt-1 text-sm text-muted-foreground">{(results.error as Error)?.message ?? "Please try again."}</p>
            <button
              onClick={() => results.refetch()}
              className="mt-4 rounded-full grad-navy text-white px-4 py-2 text-sm font-semibold shadow-navy"
            >
              Retry
            </button>
          </div>
        ) : null}

        {/* Results */}
        {enabled && data ? (
          <div className="mt-10 animate-fade-in">
            {/* Meta row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{total}</span> result{total === 1 ? "" : "s"} for &ldquo;
                <span className="text-foreground">{debounced.trim()}</span>&rdquo;
              </div>
              <div className="inline-flex items-center gap-2 rounded-full glass px-2 py-1">
                <SlidersHorizontal className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
                {[
                  { id: "relevance", label: "Relevance" },
                  { id: "newest", label: "Newest" },
                  { id: "oldest", label: "Oldest" },
                  { id: "title", label: "A–Z" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSort(s.id)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      search.sort === s.id ? "grad-navy text-white shadow-navy" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category filters (from search hits + selected) */}
            {data.categories.length || search.cat ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setCat("")}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    !search.cat ? "grad-navy text-white shadow-navy" : "glass text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All categories
                </button>
                {data.categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCat(c.slug)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      search.cat === c.slug ? "grad-navy text-white shadow-navy" : "glass text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {c.name} <span className="opacity-70">· {c.count}</span>
                  </button>
                ))}
              </div>
            ) : null}

            {/* Tag hits */}
            {data.tags.length ? (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <Hash className="h-3 w-3" /> Tags
                </span>
                {data.tags.map((t) => (
                  <span key={t.id} className="rounded-full glass px-3 py-1 text-xs text-foreground/80">
                    #{t.name}
                  </span>
                ))}
              </div>
            ) : null}

            {/* Article results */}
            <div className="mt-6 space-y-3">
              {articles.map((a, i) => (
                <Link
                  key={a.id}
                  to="/articles/$slug"
                  params={{ slug: a.slug }}
                  className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl glass p-3 sm:p-4 hover:bg-secondary transition-colors animate-fade-up"
                  style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
                >
                  <div className="relative h-16 w-24 sm:h-20 sm:w-32 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                    {a.image ? (
                      <img src={a.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full grad-navy" />
                    )}
                  </div>
                  <div className="min-w-0">
                    {a.category ? (
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-blue">{a.category.name}</div>
                    ) : null}
                    <div className="mt-0.5 line-clamp-2 font-semibold text-foreground group-hover:text-navy">
                      {highlight(a.title, debounced)}
                    </div>
                    {a.excerpt ? (
                      <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {highlight(a.excerpt, debounced)}
                      </div>
                    ) : null}
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="truncate">{a.author?.name ?? "VEducate"}</span>
                      <span>·</span>
                      <span className="whitespace-nowrap">{formatDate(a.date)}</span>
                      <span>·</span>
                      <Clock className="h-3 w-3" /> {a.readingTime}m
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-navy transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>

            {/* No results */}
            {articles.length === 0 ? (
              <div className="mt-6 glass rounded-3xl p-12 text-center">
                <div className="text-lg font-semibold text-foreground">No matches for &ldquo;{debounced.trim()}&rdquo;</div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try a broader keyword, check spelling, or explore a trending topic below.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {TRENDING.slice(0, 6).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTerm(t)}
                      className="rounded-full glass px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-navy"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Pagination */}
            {totalPages > 1 ? (
              <div className="mt-8 flex items-center justify-between gap-3">
                <button
                  disabled={search.page <= 1}
                  onClick={() => setPage(Math.max(1, search.page - 1))}
                  className="rounded-full glass px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-40"
                >
                  ← Previous
                </button>
                <div className="text-xs text-muted-foreground">
                  Page <span className="font-semibold text-foreground">{search.page}</span> of {totalPages}
                </div>
                <button
                  disabled={search.page >= totalPages}
                  onClick={() => setPage(Math.min(totalPages, search.page + 1))}
                  className="rounded-full grad-navy text-white shadow-navy px-4 py-2 text-sm font-semibold disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
