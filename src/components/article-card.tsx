import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { formatDate, type Article } from "@/lib/wordpress";

export function ArticleCard({ article, size = "md" }: { article: Article; size?: "sm" | "md" | "lg" }) {
  const aspect = size === "lg" ? "aspect-[16/10]" : "aspect-[16/9]";
  return (
    <Link
      to="/articles/$slug"
      params={{ slug: article.slug }}
      className="group block overflow-hidden rounded-2xl border border-border/60 bg-card transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-lg"
    >
      <div className={`${aspect} w-full overflow-hidden bg-muted`}>
        {article.image ? (
          <img
            src={article.image}
            alt={article.imageAlt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-transparent to-accent text-xs text-muted-foreground">
            VEducate Academy
          </div>
        )}
      </div>
      <div className="p-5">
        {article.category && (
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            {article.category.name}
          </div>
        )}
        <h3 className="mt-2 line-clamp-2 text-lg font-semibold tracking-tight text-foreground group-hover:text-primary">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {article.author?.avatar && (
              <img src={article.author.avatar} alt="" className="h-6 w-6 rounded-full" />
            )}
            <span>{article.author?.name ?? "VEducate"}</span>
            <span>·</span>
            <span>{formatDate(article.date)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.readingTime} min
          </div>
        </div>
      </div>
    </Link>
  );
}
