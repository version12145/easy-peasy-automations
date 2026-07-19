import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Clock, TrendingUp } from "lucide-react";
import { listArticles, listCategories } from "@/lib/wordpress.functions";
import { formatDate } from "@/lib/wordpress";
import { ArticleCard } from "@/components/article-card";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

const latestQO = queryOptions({
  queryKey: ["articles", "home"],
  queryFn: () => listArticles({ data: { perPage: 9, page: 1 } }),
});
const categoriesQO = queryOptions({
  queryKey: ["categories"],
  queryFn: () => listCategories({ data: { perPage: 12 } }),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VEducate Academy — Empowering Learning with AI" },
      {
        name: "description",
        content:
          "The official knowledge hub of VEducate Academy — expert tutorials, engineering insights, AI research, cloud, cybersecurity, and career guidance.",
      },
      { property: "og:title", content: "VEducate Academy — Knowledge Hub" },
      {
        property: "og:description",
        content: "Empowering Learning with AI, Technology & Innovation.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(latestQO),
      context.queryClient.ensureQueryData(categoriesQO),
    ]);
  },
  component: Home,
});

function Home() {
  const { data: latest } = useSuspenseQuery(latestQO);
  const { data: categories } = useSuspenseQuery(categoriesQO);

  const feature = latest.articles[0];
  const rest = latest.articles.slice(1);
  const topics = categories.slice(0, 8);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-accent-foreground/5 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 lg:px-8 lg:pt-28">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
                <Sparkles className="h-3 w-3 text-primary" />
                VEducate Academy Knowledge Hub
              </div>
              <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Empowering Learning with{" "}
                <span className="bg-gradient-to-r from-primary via-primary/80 to-foreground bg-clip-text text-transparent">
                  AI, Technology &amp; Innovation
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
                A knowledge platform delivering expert tutorials, engineering insights,
                AI research, cloud technologies, programming resources, cybersecurity
                updates, career guidance and educational innovation.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/articles"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
                >
                  Explore Articles <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/categories"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent"
                >
                  Browse Categories
                </Link>
              </div>

              {topics.length > 0 && (
                <div className="mt-10">
                  <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    <TrendingUp className="h-3 w-3" /> Trending topics
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {topics.map((c) => (
                      <Link
                        key={c.id}
                        to="/category/$slug"
                        params={{ slug: c.slug }}
                        className="rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur transition hover:border-primary/50 hover:text-primary"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {feature && (
              <div className="lg:col-span-5">
                <Link
                  to="/articles/$slug"
                  params={{ slug: feature.slug }}
                  className="group relative block overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition hover:shadow-xl"
                >
                  {feature.image && (
                    <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                      <img
                        src={feature.image}
                        alt={feature.imageAlt}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                      Featured · {feature.category?.name ?? "Article"}
                    </div>
                    <h3 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-foreground group-hover:text-primary">
                      {feature.title}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                      {feature.excerpt}
                    </p>
                    <div className="mt-5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{feature.author?.name ?? "VEducate"}</span>
                      <span>·</span>
                      <span>{formatDate(feature.date)}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {feature.readingTime} min
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Latest */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Latest
            </div>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">
              Fresh from the hub
            </h2>
          </div>
          <Link
            to="/articles"
            className="hidden text-sm font-medium text-primary hover:underline sm:inline-flex"
          >
            View all →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Categories
          </div>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">Browse by topic</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 9).map((c) => (
            <Link
              key={c.id}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="group rounded-2xl border border-border/60 bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold tracking-tight group-hover:text-primary">
                  {c.name}
                </h3>
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-muted-foreground">
                  {c.count}
                </span>
              </div>
              {c.description && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {c.description}
                </p>
              )}
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary">
                Explore <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-background p-10 md:p-14">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight">
              Learn something new every week
            </h2>
            <p className="mt-3 text-muted-foreground">
              Get the latest tutorials, AI research, and engineering insights from
              VEducate Academy delivered to your inbox.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-6 flex max-w-md flex-col gap-2 sm:flex-row"
            >
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="h-11 flex-1 rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-primary"
              />
              <button className="h-11 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
