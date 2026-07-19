import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { getHomepage, type HomeSection } from "@/lib/wordpress.functions";
import { formatDate, type Article, type Category } from "@/lib/wordpress";
import { ArticleCard } from "@/components/article-card";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { HeroLogo } from "@/components/hero-logo";

const homeQO = queryOptions({
  queryKey: ["homepage"],
  queryFn: () => getHomepage({ data: { sectionsLimit: 8, postsPerSection: 4 } }),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VEducate Academy — AI-Powered Learning for Engineers & Students" },
      {
        name: "description",
        content:
          "VEducate Academy is an AI-powered education and technology platform offering expert tutorials, programming guides, engineering insights, cloud computing resources, cybersecurity knowledge, career guidance, and practical learning for students and professionals.",
      },
      { property: "og:title", content: "VEducate Academy — Knowledge Hub for AI, Cloud & Engineering" },
      {
        property: "og:description",
        content:
          "Master AI, programming, cloud, cybersecurity, engineering and career craft through expert articles, practical tutorials, and industry insights.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQO),
  component: Home,
});

/** Deterministic gradient per category slug — no hardcoded categories. */
function slugHash(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  return Math.abs(h);
}
const GRADIENTS = [
  "from-blue-500/15 to-indigo-500/10",
  "from-emerald-500/15 to-teal-500/10",
  "from-sky-500/15 to-cyan-500/10",
  "from-rose-500/15 to-orange-500/10",
  "from-violet-500/15 to-fuchsia-500/10",
  "from-amber-500/15 to-yellow-500/10",
];
function tintFor(slug: string) {
  return GRADIENTS[slugHash(slug) % GRADIENTS.length];
}

function Home() {
  const { data: home } = useSuspenseQuery(homeQO);

  // 100% WordPress-driven — no hardcoded pillars, no client-side filtering.
  const categories = home.categories;
  const sections = home.sections;

  // WordPress sticky posts drive "Featured". Fallback to newest post so the slot never sits empty.
  const feature: Article | undefined = home.featured[0] ?? home.latest[0];
  const latestGrid = home.latest
    .filter((a) => a.id !== feature?.id)
    .slice(0, 6);
  const trending = categories.slice(0, 8);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      {/* HERO — brand identity */}
      <section className="relative hero-gradient overflow-hidden pt-28 sm:pt-36 pb-16 sm:pb-24">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/3 h-96 w-96 rounded-full bg-blue/10 blur-3xl animate-float" />
          <div className="absolute right-10 top-40 h-72 w-72 rounded-full bg-navy/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-6 animate-fade-up">
              <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 text-xs font-medium text-navy">
                <Sparkles className="h-3.5 w-3.5" />
                Trusted by Students, Educators & Future Engineers
              </div>
              <h1 className="mt-6 text-editorial text-5xl sm:text-6xl lg:text-7xl text-foreground">
                Empowering the next generation of engineers through{" "}
                <em className="italic grad-text">AI, technology & innovation.</em>
              </h1>
              <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground">
                VEducate Academy is a modern knowledge platform helping students, developers and aspiring professionals master emerging technologies through expert articles, practical guides and industry insights.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/articles"
                  className="group inline-flex items-center gap-2 rounded-full grad-navy px-6 py-3 text-sm font-semibold text-white shadow-navy transition hover:opacity-95"
                >
                  Explore Knowledge Hub
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  to="/categories"
                  className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm font-semibold text-foreground hover:bg-secondary"
                >
                  Browse Categories
                </Link>
              </div>

              {/* Stats — live from WordPress */}
              <div className="mt-12 grid grid-cols-3 gap-3 sm:gap-4">
                {[
                  { k: `${pillarCategories.length}`, v: "Content Pillars" },
                  { k: `${home.totalArticles}+`, v: "Published Articles" },
                  { k: `${home.featured.length + home.latest.length}+`, v: "Fresh This Week" },
                ].map((s) => (
                  <div key={s.v} className="glass rounded-2xl px-4 py-4 sm:px-5 sm:py-5">
                    <div className="text-xl sm:text-2xl font-bold tracking-tight grad-text">{s.k}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 animate-fade-up" style={{ animationDelay: "120ms" }}>
              <HeroLogo />
            </div>
          </div>
        </div>
      </section>

      {/* TRENDING TOPICS — dynamic from WordPress */}
      {trending.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-10">
          <div className="glass rounded-3xl p-4 sm:p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="flex min-w-0 items-center gap-3 overflow-x-auto scrollbar-none">
                <span className="shrink-0 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Trending
                </span>
                <div className="mx-1 hidden sm:block h-5 w-px shrink-0 bg-border" />
                <div className="flex items-center gap-2">
                  {trending.map((c: Category) => (
                    <Link
                      key={c.id}
                      to="/category/$slug"
                      params={{ slug: c.slug }}
                      className="shrink-0 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground/80 hover:border-blue hover:text-navy transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
              <Link to="/categories" className="shrink-0 text-xs font-semibold text-navy hover:underline">
                See all →
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* FEATURED — WordPress sticky post */}
      {feature ? (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-blue">
                {home.featured.length > 0 ? "Featured" : "Latest"}
              </div>
              <h2 className="mt-2 text-editorial text-4xl sm:text-5xl text-foreground">Editor's Choice</h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                {home.featured.length > 0
                  ? "Pinned by the editorial team in WordPress — the story we want you to read first."
                  : "The newest publication from VEducate Academy."}
              </p>
            </div>
          </div>

          <Link
            to="/articles/$slug"
            params={{ slug: feature.slug }}
            className="group block overflow-hidden rounded-3xl glass-strong hover-lift"
          >
            <div className="grid lg:grid-cols-2">
              <div className="relative aspect-[4/3] lg:aspect-auto overflow-hidden bg-surface-2">
                {feature.image ? (
                  <img
                    src={feature.image}
                    alt={feature.imageAlt}
                    className="h-full w-full object-cover transition-transform duration-[1400ms] group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full grad-navy" />
                )}
                <div className="pointer-events-none absolute inset-0 bg-linear-to-tr from-navy/40 via-transparent to-transparent" />
              </div>
              <div className="flex flex-col justify-center p-8 sm:p-12">
                {feature.category ? (
                  <span className="inline-flex w-fit items-center rounded-full bg-blue-soft px-3 py-1 text-xs font-semibold text-navy">
                    {feature.category.name}
                  </span>
                ) : null}
                <h3 className="mt-5 text-editorial text-3xl sm:text-4xl lg:text-5xl text-foreground">
                  {feature.title}
                </h3>
                {feature.excerpt ? (
                  <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground line-clamp-3">
                    {feature.excerpt}
                  </p>
                ) : null}
                <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {feature.author?.avatar ? (
                    <img src={feature.author.avatar} alt="" className="h-8 w-8 shrink-0 rounded-full ring-1 ring-border" />
                  ) : (
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full grad-navy text-[11px] font-bold text-white">
                      {feature.author?.name?.[0] ?? "V"}
                    </div>
                  )}
                  <span className="font-semibold text-foreground">{feature.author?.name ?? "VEducate"}</span>
                  <span>·</span>
                  <span>{formatDate(feature.date)}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {feature.readingTime} min read</span>
                </div>
                <div className="mt-8">
                  <span className="inline-flex items-center gap-2 rounded-full grad-navy px-5 py-2.5 text-sm font-semibold text-white shadow-navy transition group-hover:opacity-95">
                    Read article <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </section>
      ) : null}

      {/* LATEST — magazine layout, from WordPress date order */}
      {latestGrid.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 sm:pb-24">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-blue">Fresh from the CMS</div>
              <h2 className="mt-2 text-editorial text-4xl sm:text-5xl text-foreground">Latest Articles</h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">Every new publication from WordPress appears here automatically.</p>
            </div>
            <Link to="/articles" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-navy hover:gap-2 transition-all">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-6">
            {latestGrid.map((a, i) => {
              const span =
                i === 0 ? "lg:col-span-4 lg:row-span-2" : "lg:col-span-2";
              const size = i === 0 ? "lg" : "md";
              return (
                <div key={a.id} className={`${span} h-full`}>
                  <ArticleCard article={a} size={size} index={i} />
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* CATEGORY SECTIONS — one per fixed content pillar, ordered by taxonomy */}
      {pillarSections.map((section: HomeSection, idx) => (
        <CategoryStrip key={section.category.id} section={section} index={idx} />
      ))}

      {/* NEWSLETTER — brand section (footer owns the primary newsletter card) */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="relative overflow-hidden rounded-3xl grad-navy p-8 sm:p-14 text-white shadow-navy">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-blue/30 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" /> Weekly Industry Updates
              </div>
              <h2 className="mt-4 text-editorial text-4xl sm:text-5xl text-white">
                Stay Ahead with <em className="italic text-blue-soft/90">Technology.</em>
              </h2>
              <p className="mt-4 max-w-xl text-white/70">
                Receive carefully curated tutorials, AI research, engineering insights, programming resources and technology updates directly in your inbox every week.
              </p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="glass-strong rounded-2xl p-4 sm:p-5 bg-white/10 border-white/20"
            >
              <label className="text-xs font-semibold uppercase tracking-widest text-white/70">Email</label>
              <div className="mt-2 flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="flex-1 min-w-0 rounded-full bg-white/10 border border-white/20 px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:ring-2 focus:ring-white/40"
                />
                <button className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-navy hover:bg-white/90">
                  Subscribe Free
                </button>
              </div>
              <p className="mt-3 text-[11px] text-white/60">Join students, educators and future engineers. Unsubscribe any time.</p>
            </form>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

/** A dynamic per-category strip. Structure is fully driven by WordPress data. */
function CategoryStrip({ section, index }: { section: HomeSection; index: number }) {
  const { category, articles } = section;
  const tint = tintFor(category.slug);
  const [hero, ...rest] = articles;
  return (
    <section
      className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 sm:pb-24 animate-fade-up"
      style={{ animationDelay: `${Math.min(index, 4) * 40}ms` }}
    >
      <div className={`relative overflow-hidden rounded-3xl bg-linear-to-br ${tint} p-6 sm:p-10`}>
        <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-widest text-blue">Latest in</div>
            <h2 className="mt-2 text-editorial text-3xl sm:text-4xl text-foreground">
              {category.name}
            </h2>
            {category.description ? (
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground line-clamp-2">
                {category.description}
              </p>
            ) : (
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                {category.count} article{category.count === 1 ? "" : "s"} published in this topic.
              </p>
            )}
          </div>
          <Link
            to="/category/$slug"
            params={{ slug: category.slug }}
            className="shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-navy hover:gap-2 transition-all"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {hero ? (
          <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <ArticleCard article={hero} size="lg" />
            <div className="grid gap-5">
              {rest.slice(0, 3).map((a) => (
                <ArticleCard key={a.id} article={a} size="sm" />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
