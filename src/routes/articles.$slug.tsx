import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Bookmark, Clock, Share2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getArticleBySlug, getRelatedArticles } from "@/lib/wordpress.functions";
import { formatDate } from "@/lib/wordpress";
import { ArticleCard } from "@/components/article-card";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

const articleQO = (slug: string) =>
  queryOptions({ queryKey: ["article", slug], queryFn: () => getArticleBySlug({ data: { slug } }) });

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
      await context.queryClient.ensureQueryData(relatedQO(article.category.id, article.id));
    }
    return { article };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Article — VEducate Academy" }] };
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
      <div className="mx-auto max-w-2xl px-4 py-40 text-center">
        <h1 className="text-editorial text-5xl">Article not found</h1>
        <Link to="/articles" className="mt-6 inline-block text-navy hover:underline">Back to articles</Link>
      </div>
    </div>
  ),
  component: ArticlePage,
});

function useReadingProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setP(total > 0 ? Math.min(100, (h.scrollTop / total) * 100) : 0);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return p;
}

function ArticlePage() {
  const { article } = Route.useLoaderData();
  const related = useSuspenseQuery(
    article.category
      ? relatedQO(article.category.id, article.id)
      : ({ queryKey: ["noop"], queryFn: async () => [], enabled: false } as never),
  );
  const progress = useReadingProgress();

  const toc = useMemo(() => {
    // parse h2 out of content
    const matches = [...article.content.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];
    return matches.map((m, i) => {
      const text = m[1].replace(/<[^>]*>/g, "").trim();
      return { id: `h2-${i}`, text };
    });
  }, [article.content]);

  const contentWithIds = useMemo(() => {
    let i = 0;
    return article.content.replace(/<h2([^>]*)>/gi, () => {
      const id = `h2-${i++}`;
      return `<h2 id="${id}">`;
    });
  }, [article.content]);

  const share = () => {
    if (typeof navigator === "undefined") return;
    if (navigator.share) {
      navigator.share({ title: article.title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      {/* Reading progress */}
      <div className="fixed left-0 right-0 top-0 z-40 h-0.5 bg-transparent">
        <div className="h-full grad-navy transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>

      {/* Hero */}
      <header className="relative overflow-hidden pt-32 sm:pt-40 pb-12">
        <div className="hero-gradient absolute inset-0 -z-10" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Link to="/articles" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> All articles
          </Link>
          {article.category ? (
            <div className="mt-6">
              <Link
                to="/category/$slug"
                params={{ slug: article.category.slug }}
                className="inline-flex items-center rounded-full bg-blue-soft px-3 py-1 text-xs font-semibold text-navy hover:bg-blue hover:text-white transition-colors"
              >
                {article.category.name}
              </Link>
            </div>
          ) : null}
          <h1 className="mt-5 text-editorial text-4xl sm:text-5xl lg:text-6xl text-foreground">
            {article.title}
          </h1>
          {article.excerpt ? (
            <p className="mt-5 text-lg sm:text-xl leading-relaxed text-muted-foreground max-w-3xl">
              {article.excerpt}
            </p>
          ) : null}

          <div className="mt-8 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {article.author?.avatar ? (
                <img src={article.author.avatar} alt="" className="h-11 w-11 shrink-0 rounded-full ring-1 ring-border" />
              ) : (
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full grad-navy text-sm font-bold text-white">
                  {article.author?.name?.[0] ?? "V"}
                </div>
              )}
              <div className="min-w-0 text-sm">
                <div className="truncate font-semibold text-foreground">{article.author?.name ?? "VEducate Academy"}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(article.date)} · <Clock className="inline h-3 w-3" /> {article.readingTime} min read
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button onClick={share} className="grid h-10 w-10 place-items-center rounded-full glass hover:bg-secondary" aria-label="Share">
                <Share2 className="h-4 w-4" />
              </button>
              <button className="grid h-10 w-10 place-items-center rounded-full glass hover:bg-secondary" aria-label="Bookmark">
                <Bookmark className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero image */}
      {article.image ? (
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-3xl glass-strong">
            <img src={article.image} alt={article.imageAlt} className="w-full object-cover" />
          </div>
        </div>
      ) : null}

      {/* Body + TOC */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_260px]">
          <article className="min-w-0">
            <div
              className="prose-editorial max-w-none"
              dangerouslySetInnerHTML={{ __html: contentWithIds }}
            />

            {article.tags.length ? (
              <div className="mt-12 flex flex-wrap gap-2">
                {article.tags.map((t) => (
                  <span key={t.id} className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-muted-foreground">
                    #{t.name}
                  </span>
                ))}
              </div>
            ) : null}

            {/* Author card */}
            <div className="mt-12 glass rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-4">
                {article.author?.avatar ? (
                  <img src={article.author.avatar} alt="" className="h-14 w-14 shrink-0 rounded-full ring-1 ring-border" />
                ) : (
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full grad-navy text-lg font-bold text-white">
                    {article.author?.name?.[0] ?? "V"}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Written by</div>
                  <div className="mt-0.5 truncate text-lg font-bold text-foreground">{article.author?.name ?? "VEducate Academy"}</div>
                </div>
              </div>
            </div>
          </article>

          {toc.length ? (
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <div className="glass rounded-2xl p-5">
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">On this page</div>
                  <nav className="mt-4 space-y-2 text-sm">
                    {toc.map((t) => (
                      <a
                        key={t.id}
                        href={`#${t.id}`}
                        className="block truncate rounded-lg px-2 py-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        {t.text}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      </section>

      {/* Related */}
      {article.category && related.data && related.data.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-blue">Related</div>
              <h2 className="mt-2 text-editorial text-3xl sm:text-4xl text-foreground">More in {article.category.name}</h2>
            </div>
            <Link to="/category/$slug" params={{ slug: article.category.slug }} className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-navy hover:gap-2 transition-all">
              See all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {related.data.map((a, i) => (
              <ArticleCard key={a.id} article={a} index={i} />
            ))}
          </div>
        </section>
      ) : null}

      <SiteFooter />
    </div>
  );
}
