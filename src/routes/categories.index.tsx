import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { listCategories } from "@/lib/wordpress.functions";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

const qo = queryOptions({
  queryKey: ["categories", "all"],
  queryFn: () => listCategories({ data: { perPage: 100 } }),
});

export const Route = createFileRoute("/categories/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  head: () => ({
    meta: [
      { title: "Categories — VEducate Academy" },
      { name: "description", content: "Browse all knowledge hub categories." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data } = useSuspenseQuery(qo);
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Explore
          </div>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight">All categories</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((c) => (
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
      </div>
      <SiteFooter />
    </div>
  );
}
