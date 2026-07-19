import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { listArticles, listCategories, listTags } from "@/lib/wordpress.functions";

// TODO: set BASE_URL to your production domain once published.
const BASE_URL = "";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "daily", priority: "1.0" },
          { path: "/articles", changefreq: "daily", priority: "0.9" },
          { path: "/categories", changefreq: "weekly", priority: "0.8" },
          { path: "/today", changefreq: "hourly", priority: "0.8" },
        ];

        try {
          const [articlesResp, categories, tags] = await Promise.all([
            listArticles({ data: { page: 1, perPage: 100 } }),
            listCategories({ data: { perPage: 100 } }),
            listTags({ data: { perPage: 100 } }),
          ]);

          for (const a of articlesResp.articles) {
            entries.push({
              path: `/articles/${a.slug}`,
              lastmod: a.modified || a.date,
              changefreq: "monthly",
              priority: "0.7",
            });
          }
          for (const c of categories) {
            entries.push({ path: `/category/${c.slug}`, changefreq: "weekly", priority: "0.6" });
          }
          for (const t of tags) {
            entries.push({ path: `/tag/${t.slug}`, changefreq: "weekly", priority: "0.5" });
          }
        } catch {
          // If WP is unreachable at build time, ship the static entries anyway.
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
