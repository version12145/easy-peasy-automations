import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { listCategories } from "@/lib/wordpress.functions";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import aiEducationImage from "@/assets/category-ai-education.png.asset.json";
import edtechImage from "@/assets/category-edtech.png.asset.json";
import educationImage from "@/assets/category-education.png.asset.json";
import defaultImage from "@/assets/category-default.png.asset.json";

const qo = queryOptions({
  queryKey: ["categories", "all"],
  queryFn: () => listCategories({ data: { perPage: 100 } }),
});

const CATEGORY_IMAGES: Record<string, string> = {
  "ai-in-education": aiEducationImage.url,
  "edtech": edtechImage.url,
  "education": educationImage.url,
  "uncategorized": defaultImage.url,
};

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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((c, i) => {
            const imageUrl = CATEGORY_IMAGES[c.slug] ?? defaultImage.url;
            return (
              <Link
                key={c.id}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="group relative h-[420px] sm:h-[440px] overflow-hidden rounded-3xl border border-white/60 bg-white shadow-xl shadow-blue-900/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 animate-fade-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <img
                  src={imageUrl}
                  alt={c.name}
                  loading="lazy"
                  width={400}
                  height={600}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/25 to-transparent" />

                <div className="absolute bottom-3 left-3 right-3 p-5 sm:p-6 backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl">
                  <span className="inline-flex px-2.5 py-1 rounded-full bg-white/30 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm">
                    {c.count} {c.count === 1 ? "article" : "articles"}
                  </span>
                  <h3 className="mt-3 text-xl font-semibold text-white tracking-tight">{c.name}</h3>
                  {c.description ? (
                    <p className="mt-2 line-clamp-2 text-sm text-white/80 leading-relaxed">{c.description}</p>
                  ) : (
                    <p className="mt-2 text-sm text-white/80 leading-relaxed">Curated articles and roadmaps for {c.name.toLowerCase()}.</p>
                  )}
                  <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white transition-transform group-hover:translate-x-0.5">
                    Explore <ArrowRight className="h-4 w-4" />
                  </div>
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
