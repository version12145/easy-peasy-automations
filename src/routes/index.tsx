import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Brain,
  Briefcase,
  Cloud,
  Clock,
  Code2,
  Shield,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { listArticles, listCategories } from "@/lib/wordpress.functions";
import { formatDate, type Category } from "@/lib/wordpress";
import { ArticleCard } from "@/components/article-card";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import veducateMark from "@/assets/veducate-mark.png.asset.json";

const latestQO = queryOptions({
  queryKey: ["articles", "home"],
  queryFn: () => listArticles({ data: { perPage: 13, page: 1 } }),
});
const categoriesQO = queryOptions({
  queryKey: ["categories"],
  queryFn: () => listCategories({ data: { perPage: 12 } }),
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
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(latestQO),
      context.queryClient.ensureQueryData(categoriesQO),
    ]);
  },
  component: Home,
});

const COLLECTIONS = [
  { icon: Brain, title: "Complete Artificial Intelligence Roadmap", count: 42, hours: 18, tint: "from-blue-500/10 to-indigo-500/10" },
  { icon: Code2, title: "Python Programming Mastery", count: 36, hours: 22, tint: "from-emerald-500/10 to-teal-500/10" },
  { icon: Cloud, title: "Cloud Engineering Essentials", count: 30, hours: 20, tint: "from-sky-500/10 to-cyan-500/10" },
  { icon: Shield, title: "Cybersecurity Fundamentals", count: 28, hours: 16, tint: "from-rose-500/10 to-orange-500/10" },
  { icon: BookOpen, title: "Full Stack Web Development", count: 34, hours: 26, tint: "from-violet-500/10 to-fuchsia-500/10" },
  { icon: Briefcase, title: "Placement Preparation Series", count: 24, hours: 14, tint: "from-amber-500/10 to-yellow-500/10" },
];

const CAT_ICONS = [Brain, Cloud, Code2, Shield, Briefcase, BookOpen, Sparkles, TrendingUp];

function Home() {
  const { data: latest } = useSuspenseQuery(latestQO);
  const { data: categories } = useSuspenseQuery(categoriesQO);

  const feature = latest.articles[0];
  const heroSecondary = latest.articles[1];
  const latestGrid = latest.articles.slice(2, 8);
  const editorPicks = latest.articles.slice(8, 12);
  const trending = categories.slice(0, 8);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      {/* HERO */}
      <section className="relative hero-gradient overflow-hidden pt-28 sm:pt-36 pb-16 sm:pb-24">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/3 h-96 w-96 rounded-full bg-blue/10 blur-3xl animate-float" />
          <div className="absolute right-10 top-40 h-72 w-72 rounded-full bg-navy/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            {/* Left */}
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
                VEducate Academy is a modern knowledge platform helping students, developers and aspiring professionals master Artificial Intelligence, Programming, Cloud, Cybersecurity, Engineering and Career Development through expert articles, practical guides and industry insights.
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

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-3 sm:gap-4">
                {[
                  { k: "10+", v: "Technology Domains" },
                  { k: `${Math.max(latest.total, 500)}+`, v: "Expert Articles" },
                  { k: "100+", v: "Practical Tutorials" },
                ].map((s) => (
                  <div key={s.v} className="glass rounded-2xl px-4 py-4 sm:px-5 sm:py-5">
                    <div className="text-xl sm:text-2xl font-bold tracking-tight grad-text">{s.k}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — floating featured card */}
            {heroSecondary ? (
              <div className="lg:col-span-6 animate-fade-up" style={{ animationDelay: "120ms" }}>
                <div className="relative">
                  <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[2rem] grad-navy opacity-10 blur-2xl" />
                  <Link
                    to="/articles/$slug"
                    params={{ slug: heroSecondary.slug }}
                    className="group block glass-strong hover-lift overflow-hidden rounded-3xl"
                  >
                    <div className="relative aspect-[5/4] w-full overflow-hidden bg-surface-2">
                      {heroSecondary.image ? (
                        <img
                          src={heroSecondary.image}
                          alt={heroSecondary.imageAlt}
                          className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full grad-navy" />
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/70 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                        {heroSecondary.category ? (
                          <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md">
                            {heroSecondary.category.name}
                          </span>
                        ) : null}
                        <h3 className="mt-3 text-xl sm:text-2xl font-bold leading-tight tracking-tight">
                          {heroSecondary.title}
                        </h3>
                        <div className="mt-3 flex items-center gap-2 text-xs opacity-90">
                          <span>{heroSecondary.author?.name ?? "VEducate"}</span>
                          <span>·</span>
                          <Clock className="h-3 w-3" /> {heroSecondary.readingTime} min
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Floating badge */}
                  <div className="absolute -left-3 top-6 hidden sm:block animate-float">
                    <div className="glass-strong flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium">
                      <TrendingUp className="h-3.5 w-3.5 text-blue" />
                      AI Powered Knowledge Platform
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* TRENDING TOPICS */}
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
                  {trending.map((c) => (
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

      {/* FEATURED STORY — magazine hero */}
      {feature ? (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-blue">Editor's Choice</div>
              <h2 className="mt-2 text-editorial text-4xl sm:text-5xl text-foreground">Featured Insights</h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">Our most valuable articles, carefully selected by the VEducate Academy editorial team to help you stay ahead in today's rapidly evolving technology landscape.</p>
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
                    Featured · {feature.category.name}
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

      {/* LATEST — magazine layout */}
      {latestGrid.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 sm:pb-24">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-blue">Weekly Industry Updates</div>
              <h2 className="mt-2 text-editorial text-4xl sm:text-5xl text-foreground">Latest Knowledge & Insights</h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">Fresh tutorials, engineering concepts, AI breakthroughs, programming guides, cloud technologies, cybersecurity trends and career resources — published every week.</p>
            </div>
            <Link to="/articles" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-navy hover:gap-2 transition-all">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-6">
            {latestGrid.map((a, i) => {
              // First is large (spans 4 cols on desktop), then 2-2-1-1
              const span =
                i === 0 ? "lg:col-span-4 lg:row-span-2" :
                i === 1 || i === 2 ? "lg:col-span-2" :
                "lg:col-span-2";
              const size = i === 0 ? "lg" : "md";
              return (
                <div key={a.id} className={span}>
                  <ArticleCard article={a} size={size} index={i} />
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* BROWSE CATEGORIES */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="mb-10 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-widest text-blue">Built for Students & Professionals</div>
            <h2 className="mt-2 text-editorial text-4xl sm:text-5xl text-foreground">Explore Learning Topics</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">Browse knowledge across multiple technology domains — designed for engineering students, aspiring professionals and lifelong learners.</p>
          </div>
          <Link to="/categories" className="shrink-0 text-sm font-semibold text-navy hover:underline">All →</Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 6).map((c: Category, i) => {
            const Icon = CAT_ICONS[i % CAT_ICONS.length];
            return (
              <Link
                key={c.id}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="group relative overflow-hidden rounded-3xl glass hover-lift p-6 sm:p-7 animate-fade-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue/10 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="grid h-12 w-12 place-items-center rounded-2xl grad-navy text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-bold tracking-tight text-foreground group-hover:text-navy">{c.name}</h3>
                {c.description ? (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">Curated articles and roadmaps.</p>
                )}
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">{c.count} articles</span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-navy transition-transform group-hover:translate-x-0.5">
                    Explore <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* LEARNING COLLECTIONS */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="mb-10">
          <div className="text-xs font-semibold uppercase tracking-widest text-blue">Structured Journeys</div>
          <h2 className="mt-2 text-editorial text-4xl sm:text-5xl text-foreground">Learning Collections</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">Structured learning journeys carefully organized by VEducate Academy to help you master new technologies from beginner to advanced levels.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {COLLECTIONS.map((col, i) => {
            const Icon = col.icon;
            return (
              <div
                key={col.title}
                className={`group relative overflow-hidden rounded-3xl glass hover-lift p-6 sm:p-7 animate-fade-up`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className={`pointer-events-none absolute inset-0 bg-linear-to-br ${col.tint} opacity-60`} />
                <div className="relative">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/70 text-navy backdrop-blur-md ring-1 ring-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold tracking-tight text-foreground">{col.title}</h3>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {col.count} articles</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {col.hours}h to complete</span>
                  </div>
                  <button className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-navy transition-transform group-hover:translate-x-0.5">
                    Continue learning <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* EDITOR'S PICKS — horizontal magazine cards */}
      {editorPicks.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 sm:pb-24">
          <div className="mb-10">
            <div className="text-xs font-semibold uppercase tracking-widest text-blue">Editor's Picks</div>
            <h2 className="mt-2 text-editorial text-4xl sm:text-5xl text-foreground">Handpicked by the editorial team</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">Articles featuring practical insights, industry trends and expert knowledge recommended by the VEducate Academy editorial team.</p>
          </div>

          <div className="space-y-5">
            {editorPicks.map((a, i) => (
              <Link
                key={a.id}
                to="/articles/$slug"
                params={{ slug: a.slug }}
                className="group block overflow-hidden rounded-3xl glass hover-lift animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="grid gap-0 sm:grid-cols-[280px_1fr] lg:grid-cols-[360px_1fr]">
                  <div className="relative aspect-[4/3] sm:aspect-auto overflow-hidden bg-surface-2">
                    {a.image ? (
                      <img src={a.image} alt={a.imageAlt} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="h-full w-full grad-navy" />
                    )}
                  </div>
                  <div className="flex flex-col justify-center p-6 sm:p-8">
                    {a.category ? (
                      <span className="inline-flex w-fit items-center rounded-full bg-blue-soft px-2.5 py-1 text-[11px] font-semibold text-navy">
                        {a.category.name}
                      </span>
                    ) : null}
                    <h3 className="mt-4 text-2xl font-bold leading-tight tracking-tight text-foreground group-hover:text-navy">
                      {a.title}
                    </h3>
                    {a.excerpt ? (
                      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{a.excerpt}</p>
                    ) : null}
                    <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{a.author?.name ?? "VEducate"}</span>
                      <span>·</span>
                      <span>{formatDate(a.date)}</span>
                      <span>·</span>
                      <Clock className="h-3.5 w-3.5" /> {a.readingTime} min
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* ABOUT */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-blue">About VEducate Academy</div>
            <h2 className="mt-2 text-editorial text-4xl sm:text-5xl text-foreground">Bridging academia and the real world of technology</h2>
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground">
              VEducate Academy is an AI-powered education and technology platform committed to empowering students, engineers and professionals through accessible, practical and industry-focused learning resources.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Our mission is to bridge the gap between academic education and real-world industry skills by delivering high-quality technical content, AI-powered learning experiences, practical tutorials and career guidance that prepares learners for the future.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="glass rounded-2xl p-6">
              <div className="text-xs font-semibold uppercase tracking-widest text-blue">Mission</div>
              <p className="mt-3 text-sm leading-relaxed text-foreground">
                Empower every learner with practical technology knowledge that transforms curiosity into real-world skills.
              </p>
            </div>
            <div className="glass rounded-2xl p-6">
              <div className="text-xs font-semibold uppercase tracking-widest text-blue">Vision</div>
              <p className="mt-3 text-sm leading-relaxed text-foreground">
                Become one of the world's most trusted AI-powered learning ecosystems for engineering and technology education.
              </p>
            </div>
            <div className="glass rounded-2xl p-6 sm:col-span-2">
              <div className="text-xs font-semibold uppercase tracking-widest text-blue">Core Values</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Innovation", "Practical Learning", "Student Success", "Engineering Excellence", "Continuous Improvement", "Community Driven"].map((v) => (
                  <span key={v} className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground/80">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
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
