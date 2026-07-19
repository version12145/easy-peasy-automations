import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Sparkles } from "lucide-react";
import { listCategories } from "@/lib/wordpress.functions";
import { PILLARS, type Pillar } from "@/lib/taxonomy";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import type { Category } from "@/lib/wordpress";

const qo = queryOptions({
  queryKey: ["categories", "all"],
  queryFn: () => listCategories({ data: { perPage: 100, hideEmpty: false } }),
});

// Deterministic gradient palettes assigned by pillar order.
const GRADIENTS = [
  { from: "#3b82f6", via: "#60a5fa", to: "#0ea5e9" },
  { from: "#0ea5e9", via: "#38bdf8", to: "#22d3ee" },
  { from: "#1e40af", via: "#3b82f6", to: "#60a5fa" },
  { from: "#0369a1", via: "#0284c7", to: "#38bdf8" },
  { from: "#4f46e5", via: "#6366f1", to: "#8b5cf6" },
  { from: "#0891b2", via: "#06b6d4", to: "#67e8f9" },
  { from: "#1d4ed8", via: "#2563eb", to: "#3b82f6" },
  { from: "#075985", via: "#0369a1", to: "#0ea5e9" },
  { from: "#312e81", via: "#4338ca", to: "#6366f1" },
  { from: "#134e4a", via: "#0f766e", to: "#14b8a6" },
  { from: "#1e3a8a", via: "#1d4ed8", to: "#3b82f6" },
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "•";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const Route = createFileRoute("/categories/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  head: () => ({
    meta: [
      { title: "Content Pillars — VEducate Academy" },
      { name: "description", content: "Explore the eleven core knowledge pillars powering the VEducate Academy hub — from AI to Cybersecurity, Cloud, Careers and more." },
      { property: "og:title", content: "Content Pillars — VEducate Academy" },
      { property: "og:description", content: "The fixed taxonomy that organizes every article on VEducate Academy." },
    ],
  }),
  component: CategoriesPage,
});

type PillarWithWP = { pillar: Pillar; wp: Category | null };

function CategoriesPage() {
  const { data } = useSuspenseQuery(qo);

  // Match each fixed pillar against a WordPress category slug (or alias).
  const bySlug = new Map<string, Category>();
  for (const c of data) bySlug.set(c.slug, c);

  const rows: PillarWithWP[] = PILLARS.map((p) => {
    let wp: Category | null = null;
    for (const s of p.slugs) {
      const found = bySlug.get(s);
      if (found) { wp = found; break; }
    }
    return { pillar: p, wp };
  });

  const totalArticles = rows.reduce((s, r) => s + (r.wp?.count ?? 0), 0);
  const activeCount = rows.filter((r) => r.wp && r.wp.count > 0).length;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <header className="hero-gradient pt-32 sm:pt-40 pb-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <div className="mt-6 text-xs font-semibold uppercase tracking-widest text-blue">Content Pillars</div>
          <h1 className="mt-2 text-editorial text-5xl sm:text-6xl lg:text-7xl text-foreground">
            Explore by <em className="italic grad-text">pillar</em>.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {PILLARS.length} core knowledge pillars · {activeCount} active · {totalArticles} article{totalArticles === 1 ? "" : "s"} published.
            New technologies, frameworks and companies live as <span className="font-semibold text-navy">tags</span> — not categories.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row, i) => {
            const g = GRADIENTS[i % GRADIENTS.length];
            const { pillar, wp } = row;
            const count = wp?.count ?? 0;
            const inactive = !wp || count === 0;

            const card = (
              <>
                <div
                  className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full opacity-40 blur-3xl transition-all duration-700 group-hover:opacity-70 group-hover:scale-125"
                  style={{ background: `radial-gradient(circle, ${g.via}, transparent 70%)` }}
                />
                <div
                  className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full opacity-25 blur-3xl transition-opacity duration-700 group-hover:opacity-50"
                  style={{ background: `radial-gradient(circle, ${g.to}, transparent 70%)` }}
                />

                <div className="relative flex items-start justify-between">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                    style={{
                      background: `linear-gradient(135deg, ${g.from}, ${g.via} 50%, ${g.to})`,
                      boxShadow: `0 10px 30px -8px ${g.via}66`,
                    }}
                  >
                    <span className="tracking-tight">{initials(pillar.name)}</span>
                  </div>
                  <div className="text-right">
                    {inactive ? (
                      <span className="inline-flex items-center rounded-full bg-blue-soft/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-navy">
                        Coming soon
                      </span>
                    ) : (
                      <>
                        <div className="text-4xl font-bold text-navy tabular-nums leading-none">{count}</div>
                        <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          {count === 1 ? "article" : "articles"}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="relative mt-8">
                  <h3 className="text-2xl font-semibold text-navy tracking-tight">{pillar.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {pillar.subtopics.slice(0, 4).map((s) => (
                      <span key={s} className="inline-flex items-center rounded-full border border-blue-100 bg-white/60 px-2 py-0.5 text-[11px] font-medium text-navy/80">
                        {s}
                      </span>
                    ))}
                    {pillar.subtopics.length > 4 ? (
                      <span className="inline-flex items-center rounded-full bg-blue-soft/50 px-2 py-0.5 text-[11px] font-medium text-navy/70">
                        +{pillar.subtopics.length - 4}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="relative mt-8 flex items-center justify-between border-t border-blue-100/70 pt-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-blue">
                    <Sparkles className="h-3.5 w-3.5" /> {inactive ? "Awaiting first article" : "Explore pillar"}
                  </span>
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-white transition-all duration-500 ${inactive ? "opacity-40" : "group-hover:scale-110"}`}
                    style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
                  >
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </>
            );

            const base = "group relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-7 shadow-xl shadow-blue-900/5 transition-all duration-500 animate-fade-up";

            return inactive ? (
              <div
                key={pillar.slugs[0]}
                className={`${base} cursor-default`}
                style={{ animationDelay: `${i * 40}ms` }}
                aria-disabled="true"
                title="No articles published yet"
              >
                {card}
              </div>
            ) : (
              <Link
                key={pillar.slugs[0]}
                to="/category/$slug"
                params={{ slug: wp!.slug }}
                className={`${base} hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-blue-500/15`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {card}
              </Link>
            );
          })}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
