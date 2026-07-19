import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Tag as TagIcon } from "lucide-react";
import { getTagBySlug, listArticles } from "@/lib/wordpress.functions";
import { ArticleCard } from "@/components/article-card";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

const tagQO = (slug: string) =>
  queryOptions({ queryKey: ["tag", slug], queryFn: () => getTagBySlug({ data: { slug } }) });

const tagArticlesQO = (tagId: number, page: number) =>
  queryOptions({
    queryKey: ["tag-articles", tagId, page],
    queryFn: () => listArticles({ data: { tagId, page, perPage: 12 } }),
  });

const searchSchema = (input: Record<string, unknown>) => ({
  page: typeof input.page === "string" ? Math.max(1, parseInt(input.page, 10) || 1) : (input.page as number) ?? 1,
});

export const Route = createFileRoute("/tag/$slug")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: async ({ context, params, deps }) => {
    const tag = await context.queryClient.ensureQueryData(tagQO(params.slug));
    if (!tag) throw notFound();
    await context.queryClient.ensureQueryData(tagArticlesQO(tag.id, deps.page));
    return { tag };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Tag — VEducate Academy" }, { name: "robots", content: "noindex" }] };
    const t = loaderData.tag;
    return {
      meta: [
        { title: `#${t.name} — VEducate Academy` },
        { name: "description", content: t.description || `Articles tagged with ${t.name} on VEducate Academy.` },
        { property: "og:title", content: `#${t.name} — VEducate Academy` },
        { property: "og:description", content: t.description || `Articles tagged with ${t.name}.` },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-2xl px-4 py-40 text-center">
        <h1 className="text-editorial text-5xl">Tag not found</h1>
        <Link to="/articles" className="mt-6 inline-block text-navy hover:underline">Back to articles</Link>
      </div>
    </div>
  ),
  component: TagPage,
});

function TagPage() {
  const { tag } = Route.useLoaderData();
  const { page } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data } = useSuspenseQuery(tagArticlesQO(tag.id, page));

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <header className="hero-gradient pt-32 sm:pt-40 pb-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Link to="/articles" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> All articles
          </Link>
          <div className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue">
            <TagIcon className="h-3.5 w-3.5" /> Tag
          </div>
          <h1 className="mt-2 text-editorial text-5xl sm:text-6xl text-foreground">
            #{tag.name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {tag.description || `Every article tagged with ${tag.name}.`} · {data.total} article{data.total === 1 ? "" : "s"}
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        {data.articles.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <p className="text-lg text-muted-foreground">No articles tagged with #{tag.name} yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.articles.map((a, i) => (
              <ArticleCard key={a.id} article={a} index={i} />
            ))}
          </div>
        )}

        {data.totalPages > 1 ? (
          <div className="mt-12 flex items-center justify-center gap-3">
            <button
              disabled={page <= 1}
              onClick={() => navigate({ search: { page: page - 1 } })}
              className="inline-flex items-center gap-1 rounded-full glass px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" /> Prev
            </button>
            <span className="text-sm text-muted-foreground">Page {page} of {data.totalPages}</span>
            <button
              disabled={page >= data.totalPages}
              onClick={() => navigate({ search: { page: page + 1 } })}
              className="inline-flex items-center gap-1 rounded-full grad-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </section>

      <SiteFooter />
    </div>
  );
}
