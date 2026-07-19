import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { listArticles } from "@/lib/wordpress.functions";
import { ArticleCard } from "@/components/article-card";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

const searchSchema = z.object({ q: z.string().optional().default("") });

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Search — VEducate Academy" },
      { name: "description", content: "Search articles across the knowledge hub." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const nav = Route.useNavigate();
  const { q } = Route.useSearch();
  const [term, setTerm] = useState(q);

  useEffect(() => setTerm(q), [q]);

  const debounced = useDebounce(term, 350);

  useEffect(() => {
    nav({ search: { q: debounced }, replace: true });
  }, [debounced, nav]);

  const query = useQuery({
    queryKey: ["search", debounced],
    queryFn: () => listArticles({ data: { search: debounced, perPage: 18 } }),
    enabled: debounced.trim().length > 1,
  });

  const trending = ["AI", "Programming", "Cloud", "Cyber Security", "Careers", "Data Science"];

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Search
        </div>
        <h1 className="mt-1 text-4xl font-semibold tracking-tight">Find what to learn next</h1>

        <div className="relative mt-8">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search articles, tutorials, topics…"
            className="h-14 w-full rounded-2xl border border-border bg-card pl-12 pr-4 text-base outline-none focus:border-primary"
          />
          {query.isFetching && (
            <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>

        {!debounced && (
          <div className="mt-8">
            <div className="mb-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Trending
            </div>
            <div className="flex flex-wrap gap-2">
              {trending.map((t) => (
                <button
                  key={t}
                  onClick={() => setTerm(t)}
                  className="rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-xs font-medium text-foreground/80 hover:border-primary/50 hover:text-primary"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {debounced && query.data && (
          <div className="mt-10">
            <div className="mb-6 text-sm text-muted-foreground">
              {query.data.total} result{query.data.total === 1 ? "" : "s"} for “{debounced}”
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {query.data.articles.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
            {query.data.articles.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                No matches. Try a different keyword.
              </div>
            )}
          </div>
        )}
      </div>
      <SiteFooter />
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
