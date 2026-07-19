import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
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
      {
        name: "description",
        content: "All articles from the VEducate Academy knowledge hub.",
      },
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
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Library
          </div>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight">All articles</h1>
          <p className="mt-2 text-muted-foreground">
            {data.total} article{data.total === 1 ? "" : "s"} · Page {page} of{" "}
            {data.totalPages}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>

        <div className="mt-12 flex items-center justify-between">
          <Link
            to="/articles"
            search={{ page: Math.max(1, page - 1) }}
            disabled={page <= 1}
            className={`rounded-full border border-border px-4 py-2 text-sm ${
              page <= 1
                ? "pointer-events-none opacity-40"
                : "hover:bg-accent"
            }`}
          >
            ← Previous
          </Link>
          <div className="text-sm text-muted-foreground">
            Page {page} / {data.totalPages}
          </div>
          <Link
            to="/articles"
            search={{ page: Math.min(data.totalPages, page + 1) }}
            disabled={page >= data.totalPages}
            className={`rounded-full border border-border px-4 py-2 text-sm ${
              page >= data.totalPages
                ? "pointer-events-none opacity-40"
                : "hover:bg-accent"
            }`}
          >
            Next →
          </Link>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
