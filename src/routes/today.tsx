import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Sparkles, Clock } from "lucide-react";
import { z } from "zod";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { listRecentArticles } from "@/lib/wordpress.functions";
import { ArticleCard } from "@/components/article-card";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

const searchSchema = z.object({
  page: fallback(z.coerce.number().int(), 1).default(1),
});

const todayQO = (page: number) =>
  queryOptions({
    queryKey: ["articles", "today", page],
    queryFn: () => listRecentArticles({ data: { hours: 24, page, perPage: 12 } }),
    staleTime: 60_000,
  });

export const Route = createFileRoute("/today")({
  validateSearch: zodValidator(searchSchema),
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureQueryData(todayQO(deps.page));
  },
  head: () => ({
    meta: [
      { title: "Today's Updates — VEducate Academy" },
      { name: "description", content: "Discover the latest articles, tutorials and industry updates published during the last 24 hours." },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: "Today's Updates — VEducate Academy" },
      { property: "og:description", content: "Fresh knowledge from the last 24 hours on VEducate Academy." },
    ],
  }),
  component: TodayPage,
});

function TodayPage() {
  const { page } = Route.useSearch();
  const { data } = useSuspenseQuery(todayQO(page));

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <header className="hero-gradient pt-32 sm:pt-40 pb-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-full glass px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground hover:bg-secondary"
            >
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-semibold uppercase tracking-widest text-blue">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue" />
              </span>
              Live · Last 24 hours
            </div>
          </div>
          <h1 className="mt-4 text-editorial text-5xl sm:text-6xl lg:text-7xl text-foreground">
            Today's Updates.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Discover the latest articles, tutorials and industry updates published during the last 24 hours.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full glass-strong px-4 py-2 text-sm">
              <Clock className="h-4 w-4 text-blue" />
              <span className="text-muted-foreground">Published in the last</span>
              <span className="font-semibold text-foreground">24 hours</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full grad-navy px-4 py-2 text-sm font-semibold text-white shadow-navy">
              <Sparkles className="h-4 w-4" />
              {data.total} New Article{data.total === 1 ? "" : "s"} Today
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        {data.articles.length === 0 ? (
          <div className="glass rounded-3xl p-12 sm:p-16 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl grad-navy shadow-navy">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h2 className="mt-6 text-editorial text-3xl sm:text-4xl text-foreground">
              Nothing new — yet.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              No new articles have been published in the last 24 hours. Explore our latest knowledge from the Articles section.
            </p>
            <Link
              to="/articles"
              className="mt-8 inline-flex items-center gap-2 rounded-full grad-navy px-6 py-3 text-sm font-semibold text-white shadow-navy hover:opacity-95"
            >
              Browse All Articles <ArrowRight className="h-4 w-4" />
            </Link>
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
              to="/today"
              search={{ page: Math.max(1, page - 1) }}
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
              to="/today"
              search={{ page: Math.min(data.totalPages, page + 1) }}
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
