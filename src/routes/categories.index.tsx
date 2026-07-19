import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Sparkles } from "lucide-react";
import { listCategories } from "@/lib/wordpress.functions";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

const qo = queryOptions({
  queryKey: ["categories", "all"],
  queryFn: () => listCategories({ data: { perPage: 100 } }),
});

// Deterministic gradient palettes assigned by slug hash — no images needed.
const GRADIENTS = [
  { from: "#3b82f6", via: "#60a5fa", to: "#0ea5e9" },
  { from: "#0ea5e9", via: "#38bdf8", to: "#22d3ee" },
  { from: "#1e40af", via: "#3b82f6", to: "#60a5fa" },
  { from: "#0369a1", via: "#0284c7", to: "#38bdf8" },
  { from: "#4f46e5", via: "#6366f1", to: "#8b5cf6" },
  { from: "#0891b2", via: "#06b6d4", to: "#67e8f9" },
  { from: "#1d4ed8", via: "#2563eb", to: "#3b82f6" },
  { from: "#075985", via: "#0369a1", to: "#0ea5e9" },
];

function pickGradient(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((c, i) => {
            const g = pickGradient(c.slug);
            return (
              <Link
                key={c.id}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-7 shadow-xl shadow-blue-900/5 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-blue-500/15 animate-fade-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Ambient gradient orbs */}
                <div
                  className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full opacity-40 blur-3xl transition-all duration-700 group-hover:opacity-70 group-hover:scale-125"
                  style={{ background: `radial-gradient(circle, ${g.via}, transparent 70%)` }}
                />
                <div
                  className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full opacity-25 blur-3xl transition-opacity duration-700 group-hover:opacity-50"
                  style={{ background: `radial-gradient(circle, ${g.to}, transparent 70%)` }}
                />

                {/* Top row: monogram + count */}
                <div className="relative flex items-start justify-between">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                    style={{
                      background: `linear-gradient(135deg, ${g.from}, ${g.via} 50%, ${g.to})`,
                      boxShadow: `0 10px 30px -8px ${g.via}66`,
                    }}
                  >
                    <span className="tracking-tight">{initials(c.name)}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-navy tabular-nums leading-none">{c.count}</div>
                    <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {c.count === 1 ? "article" : "articles"}
                    </div>
                  </div>
                </div>

                {/* Title + description */}
                <div className="relative mt-8">
                  <h3 className="text-2xl font-semibold text-navy tracking-tight">{c.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                    {c.description || `Curated articles and roadmaps for ${c.name.toLowerCase()}.`}
                  </p>
                </div>

                {/* Footer CTA */}
                <div className="relative mt-8 flex items-center justify-between border-t border-blue-100/70 pt-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-blue">
                    <Sparkles className="h-3.5 w-3.5" /> Explore topic
                  </span>
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-white transition-all duration-500 group-hover:scale-110"
                    style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
                  >
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
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

