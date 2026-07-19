import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { z } from "zod";
import { listArticles } from "@/lib/wordpress.functions";
import { ArticleCard } from "@/components/article-card";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

const searchSchema = z.object({ page: z.coerce.number().int().min(1).default(1) });

const listQO = (page: number) =>
  queryOptions({
    queryKey: ["articles", "list", page],
    queryFn: () => listArticles({ data: { page, perPage: 12 } }),
  });

export const Route = createFileRoute("/articles/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search: { page } }) => ({ page }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(listQO(deps.page)),
  head: () => ({
    meta: [
      { title: "Articles — VEducate Academy" },
      { name: "description", content: "Every article from the VEducate Academy knowledge hub." },
    ],
  }),
  component: ArticlesPage,
});

function ArticlesPage() {
  const { page } = Route.useSearch();
  const { data } = useSuspenseQuery(listQO(page));

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
            Every article.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {data.total} article{data.total === 1 ? "" : "s"} across every topic — sorted newest first.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.articles.map((a, i) => (
            <ArticleCard key={a.id} article={a} index={i} />
          ))}
        </div>

        <div className="mt-14 grid grid-cols-[auto_1fr_auto] items-center gap-4">
          <Link
            to="/articles"
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
            to="/articles"
            search={{ page: Math.min(data.totalPages, page + 1) }}
            disabled={page >= data.totalPages}
            className={`inline-flex items-center gap-2 rounded-full grad-navy px-5 py-2.5 text-sm font-semibold text-white shadow-navy ${
              page >= data.totalPages ? "pointer-events-none opacity-40" : "hover:opacity-95"
            }`}
          >
            Next <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
