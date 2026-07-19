import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Clock } from "lucide-react";
import { formatDate, type Article } from "@/lib/wordpress";

type Size = "sm" | "md" | "lg";

export function ArticleCard({ article, size = "md", index = 0 }: { article: Article; size?: Size; index?: number }) {
  const imgH = size === "lg" ? "aspect-[16/10]" : size === "sm" ? "aspect-[4/3]" : "aspect-[3/2]";
  const titleCls =
    size === "lg"
      ? "text-2xl sm:text-3xl font-bold leading-[1.1] tracking-tight"
      : size === "sm"
      ? "text-base font-semibold leading-snug tracking-tight"
      : "text-lg sm:text-xl font-semibold leading-snug tracking-tight";

  return (
    <Link
      to="/articles/$slug"
      params={{ slug: article.slug }}
      className="group block animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <article className="glass hover-lift flex h-full flex-col overflow-hidden rounded-3xl">
        <div className={`relative ${imgH} w-full overflow-hidden bg-surface-2`}>
          {article.image ? (
            <img
              src={article.image}
              alt={article.imageAlt}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />
          ) : (
            <div className="h-full w-full grad-navy" />
          )}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          {article.category ? (
            <div className="absolute left-4 top-4">
              <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-navy backdrop-blur-md">
                {article.category.name}
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <h3 className={`${titleCls} text-foreground transition-colors group-hover:text-navy`}>
            {article.title}
          </h3>
          {size !== "sm" && article.excerpt ? (
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {article.excerpt}
            </p>
          ) : null}

          <div className="mt-5 flex items-center justify-between gap-3 pt-4 border-t border-border">
            <div className="flex min-w-0 items-center gap-2.5">
              {article.author?.avatar ? (
                <img src={article.author.avatar} alt={article.author.name} className="h-7 w-7 shrink-0 rounded-full ring-1 ring-border" />
              ) : (
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full grad-navy text-[10px] font-bold text-white">
                  {article.author?.name?.[0] ?? "V"}
                </div>
              )}
              <div className="min-w-0 text-xs text-muted-foreground">
                <span className="truncate font-medium text-foreground">{article.author?.name ?? "VEducate"}</span>
                <span className="mx-1.5">·</span>
                <span>{formatDate(article.date)}</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {article.readingTime}m
              <ArrowUpRight className="ml-2 h-4 w-4 text-navy opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
