import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { z } from "zod";
import { getCategoryBySlug, listArticles } from "@/lib/wordpress.functions";
import { formatDate } from "@/lib/wordpress";
import { ArticleCard } from "@/components/article-card";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

const searchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  sort: z.enum(["latest", "popular"]).default("latest"),
});

const categoryQO = (slug: string) =>
  queryOptions({ queryKey: ["category", slug], queryFn: () => getCategoryBySlug({ data: { slug } }) });

const articlesQO = (categoryId: number, page: number) =>
  queryOptions({
    queryKey: ["articles", "cat", categoryId, page],
    queryFn: () => listArticles({ data: { categoryId, page, perPage: 13 } }),
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
      <div className="mx-auto max-w-2xl px-4 py-40 text-center">
        <h1 className="text-editorial text-5xl">Category not found</h1>
        <Link to="/categories" className="mt-6 inline-block text-navy hover:underline">Browse all →</Link>
      </div>
    </div>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const { slug } = Route.useParams();
  const { page, sort } = Route.useSearch();
  const { data } = useSuspenseQuery(articlesQO(category.id, page));

  const featured = page === 1 ? data.articles[0] : null;
  const rest = page === 1 ? data.articles.slice(1) : data.articles;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Hero */}
      <header className="relative overflow-hidden hero-gradient pt-32 sm:pt-40 pb-16">
        <div className="pointer-events-none absolute -top-20 right-10 h-72 w-72 rounded-full bg-blue/10 blur-3xl animate-float" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Link to="/categories" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> All categories
          </Link>
          <div className="mt-6 text-xs font-semibold uppercase tracking-widest text-blue">Category</div>
          <h1 className="mt-2 text-editorial text-5xl sm:text-6xl lg:text-7xl text-foreground">{category.name}</h1>
          {category.description ? (
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{category.description}</p>
          ) : null}

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl">
            {[
              { k: `${category.count}`, v: "Articles" },
              { k: `${data.totalPages}`, v: "Pages" },
              { k: "Editorial", v: "Quality" },
            ].map((s) => (
              <div key={s.v} className="glass rounded-2xl px-4 py-3">
                <div className="text-xl font-bold grad-text">{s.k}</div>
                <div className="text-xs text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Featured (magazine) */}
      {featured ? (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
          <div className="mb-6 text-xs font-semibold uppercase tracking-widest text-blue">Featured</div>
          <Link
            to="/articles/$slug"
            params={{ slug: featured.slug }}
            className="group block overflow-hidden rounded-3xl glass-strong hover-lift"
          >
            <div className="grid lg:grid-cols-[1.2fr_1fr]">
              <div className="relative aspect-[4/3] lg:aspect-auto overflow-hidden bg-surface-2">
                {featured.image ? (
                  <img src={featured.image} alt={featured.imageAlt} className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
                ) : (
                  <div className="h-full w-full grad-navy" />
                )}
              </div>
              <div className="flex flex-col justify-center p-8 sm:p-10">
                <h2 className="text-editorial text-3xl sm:text-4xl text-foreground">{featured.title}</h2>
                {featured.excerpt ? (
                  <p className="mt-4 line-clamp-3 text-muted-foreground">{featured.excerpt}</p>
                ) : null}
                <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{featured.author?.name ?? "VEducate"}</span>
                  <span>·</span>
                  <span>{formatDate(featured.date)}</span>
                  <span>·</span>
                  <Clock className="h-3.5 w-3.5" /> {featured.readingTime} min
                </div>
              </div>
            </div>
          </Link>
        </section>
      ) : null}

      {/* Sort + list */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16">
        <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {page === 1 ? "Latest articles" : `Page ${page}`}
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-full glass p-1">
            {(["latest", "popular"] as const).map((s) => (
              <Link
                key={s}
                to="/category/$slug"
                params={{ slug }}
                search={{ page, sort: s }}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                  sort === s ? "grad-navy text-white shadow-navy" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((a, i) => (
            <ArticleCard key={a.id} article={a} index={i} />
          ))}
        </div>

        <div className="mt-14 grid grid-cols-[auto_1fr_auto] items-center gap-4">
          <Link
            to="/category/$slug"
            params={{ slug }}
            search={{ page: Math.max(1, page - 1), sort }}
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
            to="/category/$slug"
            params={{ slug }}
            search={{ page: Math.min(data.totalPages, page + 1), sort }}
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
