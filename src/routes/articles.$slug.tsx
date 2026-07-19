import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Clock, ArrowLeft, Share2 } from "lucide-react";
import {
  getArticleBySlug,
  getRelatedArticles,
} from "@/lib/wordpress.functions";
import { formatDate } from "@/lib/wordpress";
import { ArticleCard } from "@/components/article-card";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

const articleQO = (slug: string) =>
  queryOptions({
    queryKey: ["article", slug],
    queryFn: () => getArticleBySlug({ data: { slug } }),
  });

const relatedQO = (categoryId: number, excludeId: number) =>
  queryOptions({
    queryKey: ["article", "related", categoryId, excludeId],
    queryFn: () => getRelatedArticles({ data: { categoryId, excludeId, limit: 3 } }),
  });

export const Route = createFileRoute("/articles/$slug")({
  loader: async ({ context, params }) => {
    const article = await context.queryClient.ensureQueryData(articleQO(params.slug));
    if (!article) throw notFound();
    if (article.category) {
      await context.queryClient.ensureQueryData(
        relatedQO(article.category.id, article.id),
      );
    }
    return { article };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Article — VEducate Academy" }] };
    }
    const a = loaderData.article;
    return {
      meta: [
        { title: `${a.title} — VEducate Academy` },
        { name: "description", content: a.excerpt },
        { property: "og:title", content: a.title },
        { property: "og:description", content: a.excerpt },
        { property: "og:type", content: "article" },
        ...(a.image ? [{ property: "og:image", content: a.image }] : []),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-3xl font-semibold">Article not found</h1>
        <Link to="/articles" className="mt-4 inline-block text-primary hover:underline">
          Back to articles
        </Link>
      </div>
    </div>
  ),
  component: ArticlePage,
});

function ArticlePage() {
  const { article } = Route.useLoaderData();
  const related = useSuspenseQuery(
    article.category
      ? relatedQO(article.category.id, article.id)
      : { queryKey: ["noop"], queryFn: async () => [], enabled: false } as never,
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          to="/articles"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to articles
        </Link>

        <header className="mt-6">
          {article.category && (
            <Link
              to="/category/$slug"
              params={{ slug: article.category.slug }}
              className="text-xs font-semibold uppercase tracking-[0.16em] text-primary hover:underline"
            >
              {article.category.name}
            </Link>
          )}
          <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {article.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{article.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {article.author?.avatar && (
              <img
                src={article.author.avatar}
                alt=""
                className="h-8 w-8 rounded-full"
              />
            )}
            <span className="font-medium text-foreground">
              {article.author?.name ?? "VEducate Academy"}
            </span>
            <span>·</span>
            <span>{formatDate(article.date)}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {article.readingTime} min read
            </span>
            <button
              onClick={() =>
                typeof navigator !== "undefined" && navigator.share
                  ? navigator
                      .share({ title: article.title, url: window.location.href })
                      .catch(() => {})
                  : navigator.clipboard.writeText(window.location.href)
              }
              className="ml-auto inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs hover:bg-accent"
            >
              <Share2 className="h-3 w-3" /> Share
            </button>
          </div>
        </header>

        {article.image && (
          <div className="mt-10 overflow-hidden rounded-3xl border border-border/60">
            <img
              src={article.image}
              alt={article.imageAlt}
              className="w-full object-cover"
            />
          </div>
        )}

        <div
          className="prose prose-neutral mt-10 max-w-none dark:prose-invert prose-headings:tracking-tight prose-a:text-primary prose-img:rounded-2xl"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {article.tags.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-2">
            {article.tags.map((t) => (
              <span
                key={t.id}
                className="rounded-full border border-border/60 bg-accent/50 px-3 py-1 text-xs text-muted-foreground"
              >
                #{t.name}
              </span>
            ))}
          </div>
        )}
      </article>

      {article.category && related.data && related.data.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Related
            </div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              More in {article.category.name}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {related.data.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
