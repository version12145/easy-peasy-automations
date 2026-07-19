import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Filter, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { listArticles, listCategories } from "@/lib/wordpress.functions";
import { ArticleCard } from "@/components/article-card";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import type { Category } from "@/lib/wordpress";

const searchSchema = z.object({
  page: fallback(z.coerce.number().int(), 1).default(1),
  q: fallback(z.string(), "").default(""),
  category: fallback(z.string(), "").default(""),
});

const categoriesQO = queryOptions({
  queryKey: ["categories", "all", "articles-page"],
  queryFn: () => listCategories({ data: { perPage: 100, hideEmpty: true } }),
  staleTime: 5 * 60_000,
});

const listQO = (opts: { page: number; q: string; categoryId?: number }) =>
  queryOptions({
    queryKey: ["articles", "list", opts.page, opts.q, opts.categoryId ?? 0],
    queryFn: () =>
      listArticles({
        data: {
          page: opts.page,
          perPage: 12,
          search: opts.q || undefined,
          categoryId: opts.categoryId,
        },
      }),
  });

export const Route = createFileRoute("/articles/")({
  validateSearch: zodValidator(searchSchema),
  loaderDeps: ({ search }) => ({ page: search.page, q: search.q, category: search.category }),
  loader: async ({ context, deps }) => {
    const categories = await context.queryClient.ensureQueryData(categoriesQO);
    const categoryId = deps.category ? categories.find((c) => c.slug === deps.category)?.id : undefined;
    await context.queryClient.ensureQueryData(listQO({ page: deps.page, q: deps.q, categoryId }));
  },
  head: () => ({
    meta: [
      { title: "Articles — VEducate Academy" },
      { name: "description", content: "Every article from the VEducate Academy knowledge hub. Search and filter by category." },
    ],
  }),
  component: ArticlesPage,
});

function ArticlesPage() {
  const { page, q, category } = Route.useSearch();
  const navigate = useNavigate({ from: "/articles" });
  const { data: categories } = useSuspenseQuery(categoriesQO);
  const activeCategory = category ? categories.find((c) => c.slug === category) : undefined;
  const { data } = useSuspenseQuery(listQO({ page, q, categoryId: activeCategory?.id }));

  // Local search input, debounced into the URL.
  const [qInput, setQInput] = useState(q);
  useEffect(() => setQInput(q), [q]);
  useEffect(() => {
    const t = setTimeout(() => {
      if (qInput === q) return;
      navigate({ search: (prev: { page: number; q: string; category: string }) => ({ ...prev, q: qInput, page: 1 }) });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qInput]);

  const [filtersOpen, setFiltersOpen] = useState(false);

  const setCategory = (slug: string) => {
    navigate({ search: (prev: { page: number; q: string; category: string }) => ({ ...prev, category: slug, page: 1 }) });
  };
  const clearAll = () => navigate({ search: { page: 1, q: "", category: "" } });
  const hasFilters = Boolean(q || category);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <header className="hero-gradient pt-32 sm:pt-40 pb-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <div className="mt-6 text-xs font-semibold uppercase tracking-widest text-blue">Library</div>
          <h1 className="mt-2 text-editorial text-5xl sm:text-6xl lg:text-7xl text-foreground">
            {activeCategory ? activeCategory.name : "Every article."}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {data.total} article{data.total === 1 ? "" : "s"}
            {q ? <> matching <span className="font-semibold text-foreground">"{q}"</span></> : null}
            {activeCategory ? <> in <span className="font-semibold text-foreground">{activeCategory.name}</span></> : " across every topic"} — sorted newest first.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-8">
        {/* Search bar */}
        <div className="glass-strong rounded-2xl p-2 sm:p-2.5 flex items-center gap-2">
          <Search className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Search articles by title, keyword or topic…"
            className="flex-1 min-w-0 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          {qInput ? (
            <button
              onClick={() => setQInput("")}
              aria-label="Clear search"
              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {/* Category filter chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCategory("")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              !category
                ? "bg-navy text-white shadow-navy"
                : "border border-border bg-surface text-foreground/80 hover:border-blue hover:text-navy"
            }`}
          >
            All
          </button>
          {categories.map((c: Category) => {
            const active = c.slug === category;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.slug)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-navy text-white shadow-navy"
                    : "border border-border bg-surface text-foreground/80 hover:border-blue hover:text-navy"
                }`}
              >
                {c.name}
                <span className={`ml-1.5 text-[10px] font-bold ${active ? "text-white/70" : "text-muted-foreground"}`}>
                  {c.count}
                </span>
              </button>
            );
          })}
          {hasFilters ? (
            <button
              onClick={clearAll}
              className="ml-auto inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-navy"
            >
              <X className="h-3.5 w-3.5" /> Clear filters
            </button>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        {data.articles.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <p className="text-lg text-muted-foreground">
              No articles found{q ? <> for "<span className="font-semibold text-foreground">{q}</span>"</> : null}
              {activeCategory ? <> in <span className="font-semibold text-foreground">{activeCategory.name}</span></> : null}.
            </p>
            {hasFilters ? (
              <button
                onClick={clearAll}
                className="mt-5 inline-flex items-center gap-2 rounded-full grad-navy px-5 py-2.5 text-sm font-semibold text-white shadow-navy hover:opacity-95"
              >
                Reset filters
              </button>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.articles.map((a, i) => (
              <ArticleCard key={a.id} article={a} index={i} />
            ))}
          </div>
        )}

        {data.totalPages > 1 ? (
          <div className="mt-14 grid grid-cols-[auto_1fr_auto] items-center gap-4">
            <Link
              to="/articles"
              search={(prev: { page: number; q: string; category: string }) => ({ ...prev, page: Math.max(1, page - 1) })}
              disabled={page <= 1}
              className={`inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-semibold ${
                page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-secondary"
              }`}
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </Link>
            <div className="text-center text-sm text-muted-foreground">
              Page <span className="font-semibold text-foreground">{page}</span> of {data.totalPages}
            </div>
            <Link
              to="/articles"
              search={(prev: { page: number; q: string; category: string }) => ({ ...prev, page: Math.min(data.totalPages, page + 1) })}
              disabled={page >= data.totalPages}
              className={`inline-flex items-center gap-2 rounded-full grad-navy px-5 py-2.5 text-sm font-semibold text-white shadow-navy ${
                page >= data.totalPages ? "pointer-events-none opacity-40" : "hover:opacity-95"
              }`}
            >
              Next <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : null}
      </section>

      <SiteFooter />
    </div>
  );
}
