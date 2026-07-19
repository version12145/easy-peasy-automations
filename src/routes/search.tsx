import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Clock, Loader2, Search as SearchIcon, TrendingUp, X } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { listArticles, listCategories } from "@/lib/wordpress.functions";
import { formatDate } from "@/lib/wordpress";
import { SiteNav } from "@/components/site-nav";

const searchSchema = z.object({ q: z.string().optional().default("") });

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Search — VEducate Academy" },
      { name: "description", content: "Instant search across the VEducate Academy knowledge hub." },
    ],
  }),
  component: SearchPage,
});

const TRENDING = ["Artificial Intelligence", "Python", "Cloud", "Cyber Security", "LLMs", "Career", "DevOps", "Kubernetes"];

function SearchPage() {
  const nav = Route.useNavigate();
  const { q } = Route.useSearch();
  const [term, setTerm] = useState(q);
  const [activeCat, setActiveCat] = useState<string | null>(null);

  useEffect(() => setTerm(q), [q]);
  const debounced = useDebounce(term, 300);

  useEffect(() => {
    nav({ search: { q: debounced }, replace: true });
  }, [debounced, nav]);

  const query = useQuery({
    queryKey: ["search", debounced],
    queryFn: () => listArticles({ data: { search: debounced, perPage: 24 } }),
    enabled: debounced.trim().length > 1,
  });

  const cats = useQuery({
    queryKey: ["categories", "search"],
    queryFn: () => listCategories({ data: { perPage: 20 } }),
  });

  const results = query.data?.articles ?? [];
  const filtered = activeCat ? results.filter((r) => r.category?.slug === activeCat) : results;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-32 sm:pt-40 pb-24">
        <div className="text-xs font-semibold uppercase tracking-widest text-blue">Instant search</div>
        <h1 className="mt-2 text-editorial text-5xl sm:text-6xl text-foreground">
          Find what to learn <em className="italic grad-text">next</em>.
        </h1>

        <div className="relative mt-10 group">
          <div className="pointer-events-none absolute -inset-2 rounded-[2rem] grad-navy opacity-10 blur-xl" />
          <div className="relative glass-strong flex items-center gap-3 rounded-2xl px-5 py-4">
            <SearchIcon className="h-5 w-5 shrink-0 text-navy" />
            <input
              autoFocus
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search articles, tutorials, topics…"
              className="flex-1 min-w-0 bg-transparent text-lg outline-none placeholder:text-muted-foreground"
            />
            {query.isFetching ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
            ) : term ? (
              <button
                onClick={() => setTerm("")}
                aria-label="Clear"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
            <kbd className="hidden sm:inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">esc</kbd>
          </div>
        </div>

        {/* Empty state */}
        {!debounced ? (
          <div className="mt-12 animate-fade-up">
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

            {cats.data?.length ? (
              <div className="mt-10">
                <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Popular categories</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {cats.data.slice(0, 6).map((c) => (
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

        {/* Results */}
        {debounced && query.data ? (
          <div className="mt-10 animate-fade-in">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{filtered.length}</span> result{filtered.length === 1 ? "" : "s"} for &ldquo;{debounced}&rdquo;
              </div>
            </div>

            {/* Category filters */}
            {results.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveCat(null)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    !activeCat ? "grad-navy text-white shadow-navy" : "glass text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All
                </button>
                {Array.from(new Set(results.map((r) => r.category?.slug).filter(Boolean))).map((slug) => {
                  const cat = results.find((r) => r.category?.slug === slug)?.category!;
                  return (
                    <button
                      key={slug}
                      onClick={() => setActiveCat(slug!)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        activeCat === slug ? "grad-navy text-white shadow-navy" : "glass text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            ) : null}

            <div className="mt-6 space-y-3">
              {filtered.map((a, i) => (
                <Link
                  key={a.id}
                  to="/articles/$slug"
                  params={{ slug: a.slug }}
                  className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl glass p-3 sm:p-4 hover:bg-secondary transition-colors animate-fade-up"
                  style={{ animationDelay: `${i * 30}ms` }}
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
                    <div className="mt-0.5 line-clamp-2 font-semibold text-foreground group-hover:text-navy">{a.title}</div>
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

            {filtered.length === 0 ? (
              <div className="mt-6 glass rounded-3xl p-12 text-center">
                <div className="text-lg font-semibold text-foreground">No matches</div>
                <p className="mt-2 text-sm text-muted-foreground">Try a broader keyword or one of the trending topics.</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function useDebounce<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
