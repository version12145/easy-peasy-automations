import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { getCategoryBySlug, listArticles } from "@/lib/wordpress.functions";
import { ArticleCard } from "@/components/article-card";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

const searchSchema = z.object({ page: z.coerce.number().int().min(1).default(1) });

const categoryQO = (slug: string) =>
  queryOptions({
    queryKey: ["category", slug],
    queryFn: () => getCategoryBySlug({ data: { slug } }),
  });

const articlesQO = (categoryId: number, page: number) =>
  queryOptions({
    queryKey: ["articles", "cat", categoryId, page],
    queryFn: () => listArticles({ data: { categoryId, page, perPage: 12 } }),
  });

export const Route = createFileRoute("/category/$slug")({
  validateSearch: searchSchema,
  loaderDeps: ({ search: { page } }) => ({ page }),
  loader: async ({ context, params, deps }) => {
    const category = await context.queryClient.ensureQueryData(categoryQO(params.slug));
    if (!category) throw notFound();
    await context.queryClient.ensureQueryData(articlesQO(category.id, deps.page));
    return { category };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Category — VEducate Academy" }] };
    const c = loaderData.category;
    return {
      meta: [
        { title: `${c.name} — VEducate Academy` },
        { name: "description", content: c.description || `Articles in ${c.name}.` },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-3xl font-semibold">Category not found</h1>
        <Link to="/categories" className="mt-4 inline-block text-primary hover:underline">
          Browse categories
        </Link>
      </div>
    </div>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const { slug } = Route.useParams();
  const { page } = Route.useSearch();
  const { data } = useSuspenseQuery(articlesQO(category.id, page));

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <section className="border-b border-border/60 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Category
          </div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-3 max-w-2xl text-muted-foreground">{category.description}</p>
          )}
          <div className="mt-4 text-sm text-muted-foreground">
            {category.count} article{category.count === 1 ? "" : "s"}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>

        <div className="mt-12 flex items-center justify-between">
          <Link
            to="/category/$slug"
            params={{ slug }}
            search={{ page: Math.max(1, page - 1) }}
            disabled={page <= 1}
            className={`rounded-full border border-border px-4 py-2 text-sm ${
              page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-accent"
            }`}
          >
            ← Previous
          </Link>
          <div className="text-sm text-muted-foreground">
            Page {page} / {data.totalPages}
          </div>
          <Link
            to="/category/$slug"
            params={{ slug }}
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
