import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BookOpen, Brain, Briefcase, Cloud, Code2, Shield, Sparkles, TrendingUp } from "lucide-react";
import { listCategories } from "@/lib/wordpress.functions";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

const qo = queryOptions({
  queryKey: ["categories", "all"],
  queryFn: () => listCategories({ data: { perPage: 100 } }),
});

const ICONS = [Brain, Cloud, Code2, Shield, Briefcase, BookOpen, Sparkles, TrendingUp];

export const Route = createFileRoute("/categories/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  head: () => ({
    meta: [
      { title: "Categories — VEducate Academy" },
      { name: "description", content: "Browse every topic in the VEducate Academy knowledge hub." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data } = useSuspenseQuery(qo);
  const total = data.reduce((s, c) => s + c.count, 0);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <header className="hero-gradient pt-32 sm:pt-40 pb-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <div className="mt-6 text-xs font-semibold uppercase tracking-widest text-blue">Explore</div>
          <h1 className="mt-2 text-editorial text-5xl sm:text-6xl lg:text-7xl text-foreground">
            Browse by <em className="italic grad-text">topic</em>.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {data.length} categories · {total} articles curated across the disciplines that matter.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((c, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <Link
                key={c.id}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="group relative overflow-hidden rounded-3xl glass hover-lift p-6 sm:p-7 animate-fade-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue/10 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="grid grid-cols-[auto_1fr] items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl grad-navy text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-xl font-bold tracking-tight text-foreground group-hover:text-navy">{c.name}</h3>
                    <div className="mt-1 text-xs text-muted-foreground">{c.count} articles</div>
                  </div>
                </div>
                {c.description ? (
                  <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">{c.description}</p>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">Curated articles and roadmaps for {c.name.toLowerCase()}.</p>
                )}
                <div className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-navy transition-transform group-hover:translate-x-0.5">
                  Explore <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
