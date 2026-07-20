import { createServerFn } from "@tanstack/react-start";
import {
  WP_API,
  normalizePost,
  decodeEntities,
  type Article,
  type Category,
  type WPPostRaw,
  type WPTerm,
} from "./wordpress";

async function wpFetch(path: string): Promise<{ res: Response; body: string }> {
  const url = `${WP_API}${path}`;
  const headers: Record<string, string> = { Accept: "application/json" };


  try {
    const res = await fetch(url, { headers });
    const body = await res.text();
    const contentType = res.headers.get("content-type") ?? "";

    if (!res.ok || !contentType.includes("application/json")) {
      console.warn(`WordPress ${res.status} ${res.statusText} for ${path}: ${body.slice(0, 200)}`);
      return { res, body: "" };
    }

    return { res, body };
  } catch (error) {
    console.warn(`WordPress request failed for ${path}`, error);
    return {
      res: new Response("", { status: 502, statusText: "WordPress unavailable" }),
      body: "",
    };
  }
}

function safeJson<T>(body: string | undefined, fallback: T): T {
  if (!body) return fallback;
  try {
    const parsed = JSON.parse(body) as unknown;
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

function normalizeTerm(t: WPTerm): Category {
  return {
    id: t.id,
    name: decodeEntities(t.name),
    slug: t.slug,
    description: decodeEntities(t.description ?? ""),
    count: t.count ?? 0,
  };
}

function normalizeTag(t: WPTerm): Tag {
  return {
    id: t.id,
    name: decodeEntities(t.name),
    slug: t.slug,
    description: decodeEntities(t.description ?? ""),
    count: t.count ?? 0,
  };
}

export const listArticles = createServerFn({ method: "GET" })
  .inputValidator((d: { page?: number; perPage?: number; categoryId?: number; tagId?: number; sticky?: boolean; search?: string; orderby?: "date" | "relevance" | "title"; order?: "asc" | "desc" } = {}) => d)
  .handler(async ({ data }): Promise<{ articles: Article[]; total: number; totalPages: number }> => {
    const params = new URLSearchParams();
    params.set("_embed", "1");
    params.set("per_page", String(Math.min(data.perPage ?? 12, 50)));
    params.set("page", String(data.page ?? 1));
    if (data.categoryId) params.set("categories", String(data.categoryId));
    if (data.tagId) params.set("tags", String(data.tagId));
    if (data.search) params.set("search", data.search);
    if (data.sticky) params.set("sticky", "true");
    if (data.orderby) params.set("orderby", data.orderby);
    if (data.order) params.set("order", data.order);
    const postsRes = await wpFetch(`/posts?${params.toString()}`).catch(() => null);
    const raw = safeJson<WPPostRaw[]>(postsRes?.body, []);
    return {
      articles: raw.map(normalizePost),
      total: Number(postsRes?.res.headers.get("x-wp-total") ?? raw.length),
      totalPages: Number(postsRes?.res.headers.get("x-wp-totalpages") ?? 1),
    };
  });

/**
 * Articles published within the last N hours (default 24).
 * Uses WordPress `after` query param on the publication date — no new taxonomy,
 * no duplicated data, articles stay available everywhere else.
 */
export const listRecentArticles = createServerFn({ method: "GET" })
  .inputValidator((d: { hours?: number; page?: number; perPage?: number } = {}) => d)
  .handler(async ({ data }): Promise<{ articles: Article[]; total: number; totalPages: number; sinceISO: string }> => {
    const hours = Math.max(1, Math.min(data.hours ?? 24, 24 * 14));
    const since = new Date(Date.now() - hours * 3600_000);
    const sinceISO = since.toISOString();
    const params = new URLSearchParams();
    params.set("_embed", "1");
    params.set("per_page", String(Math.min(data.perPage ?? 12, 50)));
    params.set("page", String(data.page ?? 1));
    params.set("after", sinceISO);
    params.set("orderby", "date");
    params.set("order", "desc");
    const postsRes = await wpFetch(`/posts?${params.toString()}`).catch(() => null);
    const raw = safeJson<WPPostRaw[]>(postsRes?.body, []);
    return {
      articles: raw.map(normalizePost),
      total: Number(postsRes?.res.headers.get("x-wp-total") ?? raw.length),
      totalPages: Number(postsRes?.res.headers.get("x-wp-totalpages") ?? 1),
      sinceISO,
    };
  });

export type Tag = { id: number; name: string; slug: string; description: string; count: number };

export const listTags = createServerFn({ method: "GET" })
  .inputValidator((d: { perPage?: number; hideEmpty?: boolean; orderby?: "count" | "name" | "id" | "slug"; order?: "asc" | "desc"; search?: string } = {}) => d)
  .handler(async ({ data }): Promise<Tag[]> => {
    const params = new URLSearchParams({
      per_page: String(Math.min(data.perPage ?? 50, 100)),
      hide_empty: String(data.hideEmpty ?? true),
      orderby: data.orderby ?? "count",
      order: data.order ?? "desc",
    });
    if (data.search) params.set("search", data.search);
    const tagsRes = await wpFetch(`/tags?${params.toString()}`).catch(() => null);
    const raw = safeJson<WPTerm[]>(tagsRes?.body, []);
    return raw.map(normalizeTag);
  });

export const getTagBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }): Promise<Tag | null> => {
    const params = new URLSearchParams({ slug: data.slug });
    const tagsRes = await wpFetch(`/tags?${params.toString()}`).catch(() => null);
    const raw = safeJson<WPTerm[]>(tagsRes?.body, []);
    if (!raw.length) return null;
    return normalizeTag(raw[0]);
  });

export type SearchHitCategory = { id: number; name: string; slug: string; count: number };
export type SearchHitTag = { id: number; name: string; slug: string };
export type SiteSearchResult = {
  articles: Article[];
  total: number;
  totalPages: number;
  categories: SearchHitCategory[];
  tags: SearchHitTag[];
};

export const siteSearch = createServerFn({ method: "GET" })
  .inputValidator((d: { q: string; page?: number; perPage?: number; categoryId?: number; orderby?: "relevance" | "date" | "title"; order?: "asc" | "desc" }) => d)
  .handler(async ({ data }): Promise<SiteSearchResult> => {
    const q = (data.q ?? "").trim();
    if (!q) return { articles: [], total: 0, totalPages: 0, categories: [], tags: [] };

    const postParams = new URLSearchParams();
    postParams.set("_embed", "1");
    postParams.set("per_page", String(Math.min(data.perPage ?? 12, 50)));
    postParams.set("page", String(data.page ?? 1));
    postParams.set("search", q);
    postParams.set("orderby", data.orderby ?? "relevance");
    postParams.set("order", data.order ?? "desc");
    if (data.categoryId) postParams.set("categories", String(data.categoryId));

    const catParams = new URLSearchParams({ search: q, per_page: "10", hide_empty: "true" });
    const tagParams = new URLSearchParams({ search: q, per_page: "10", hide_empty: "true" });

    const [postsRes, catsRes, tagsRes] = await Promise.all([
      wpFetch(`/posts?${postParams.toString()}`).catch(() => null),
      wpFetch(`/categories?${catParams.toString()}`).catch(() => null),
      wpFetch(`/tags?${tagParams.toString()}`).catch(() => null),
    ]);

    const rawPosts = safeJson<WPPostRaw[]>(postsRes?.body, []);
    const cats = safeJson<WPTerm[]>(catsRes?.body, []);
    const tags = safeJson<WPTerm[]>(tagsRes?.body, []);

    return {
      articles: rawPosts.map(normalizePost),
      total: Number(postsRes?.res.headers.get("x-wp-total") ?? rawPosts.length),
      totalPages: Number(postsRes?.res.headers.get("x-wp-totalpages") ?? 1),
      categories: cats.map((t) => ({ id: t.id, name: decodeEntities(t.name), slug: t.slug, count: t.count ?? 0 })),
      tags: tags.map((t) => ({ id: t.id, name: decodeEntities(t.name), slug: t.slug })),
    };
  });

export const getArticleBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }): Promise<Article | null> => {
    const params = new URLSearchParams({ _embed: "1", slug: data.slug });
    const postsRes = await wpFetch(`/posts?${params.toString()}`).catch(() => null);
    const raw = safeJson<WPPostRaw[]>(postsRes?.body, []);
    if (!raw.length) return null;
    return normalizePost(raw[0]);
  });

export const getRelatedArticles = createServerFn({ method: "GET" })
  .inputValidator((d: { categoryId: number; excludeId: number; limit?: number }) => d)
  .handler(async ({ data }): Promise<Article[]> => {
    const params = new URLSearchParams({
      _embed: "1",
      per_page: String(data.limit ?? 3),
      categories: String(data.categoryId),
      exclude: String(data.excludeId),
    });
    const postsRes = await wpFetch(`/posts?${params.toString()}`).catch(() => null);
    return safeJson<WPPostRaw[]>(postsRes?.body, []).map(normalizePost);
  });

export const listCategories = createServerFn({ method: "GET" })
  .inputValidator((d: { perPage?: number; hideEmpty?: boolean; orderby?: "count" | "name" | "id" | "slug"; order?: "asc" | "desc" } = {}) => d)
  .handler(async ({ data }): Promise<Category[]> => {
    const params = new URLSearchParams({
      per_page: String(data.perPage ?? 50),
      hide_empty: String(data.hideEmpty ?? true),
      orderby: data.orderby ?? "count",
      order: data.order ?? "desc",
    });
    const catsRes = await wpFetch(`/categories?${params.toString()}`).catch(() => null);
    const raw = safeJson<WPTerm[]>(catsRes?.body, []);
    return raw.map(normalizeTerm);
  });

export const getCategoryBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }): Promise<Category | null> => {
    const params = new URLSearchParams({ slug: data.slug });
    const catsRes = await wpFetch(`/categories?${params.toString()}`).catch(() => null);
    const raw = safeJson<WPTerm[]>(catsRes?.body, []);
    if (!raw.length) return null;
    return normalizeTerm(raw[0]);
  });

/**
 * Fully WordPress-driven homepage payload.
 * WordPress controls: sticky/featured posts, latest posts, category list & order,
 * per-category articles. Frontend just renders whatever comes back.
 */
export type HomeSection = {
  category: Category;
  articles: Article[];
};

export type HomePayload = {
  featured: Article[];
  latest: Article[];
  categories: Category[];
  sections: HomeSection[];
  totalArticles: number;
};

export const getHomepage = createServerFn({ method: "GET" })
  .inputValidator((d: { sectionsLimit?: number; postsPerSection?: number } = {}) => d)
  .handler(async ({ data }): Promise<HomePayload> => {
    const sectionsLimit = Math.min(data.sectionsLimit ?? 8, 20);
    const postsPerSection = Math.min(data.postsPerSection ?? 4, 12);

    const stickyParams = new URLSearchParams({ _embed: "1", per_page: "3", sticky: "true" });
    const latestParams = new URLSearchParams({ _embed: "1", per_page: "13" });
    const catParams = new URLSearchParams({
      per_page: "50",
      hide_empty: "true",
      orderby: "count",
      order: "desc",
    });

    const [stickyRes, latestRes, catsRes] = await Promise.all([
      wpFetch(`/posts?${stickyParams.toString()}`).catch(() => null),
      wpFetch(`/posts?${latestParams.toString()}`).catch(() => null),
      wpFetch(`/categories?${catParams.toString()}`).catch(() => null),
    ]);

    const stickyRaw = safeJson<WPPostRaw[]>(stickyRes?.body, []);
    const latestRaw = safeJson<WPPostRaw[]>(latestRes?.body, []);
    const catsRaw = safeJson<WPTerm[]>(catsRes?.body, []);

    const categories: Category[] = catsRaw.map(normalizeTerm);

    const sectionCats = categories.slice(0, sectionsLimit);

    const sectionResults = await Promise.all(
      sectionCats.map(async (cat) => {
        const p = new URLSearchParams({
          _embed: "1",
          per_page: String(postsPerSection),
          categories: String(cat.id),
        });
        try {
          const { body } = await wpFetch(`/posts?${p.toString()}`);
          const raw = JSON.parse(body) as WPPostRaw[];
          return { category: cat, articles: raw.map(normalizePost) };
        } catch {
          return { category: cat, articles: [] };
        }
      })
    );

    return {
      featured: stickyRaw.map(normalizePost),
      latest: latestRaw.map(normalizePost),
      categories,
      sections: sectionResults.filter((s) => s.articles.length > 0),
      totalArticles: Number(latestRes?.res.headers.get("x-wp-total") ?? latestRaw.length),
    };
  });

export const getSiteLogo = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const rootRes = await fetch(`${WP_API.replace(/\/wp\/v2$/, "")}/`, {
      headers: { Accept: "application/json" },
    });
    if (!rootRes.ok) return { url: null as string | null };
    const root = (await rootRes.json()) as { site_logo?: number; site_icon_url?: string };
    if (root.site_logo && root.site_logo > 0) {
      const mediaRes = await fetch(`${WP_API}/media/${root.site_logo}`, {
        headers: { Accept: "application/json" },
      });
      if (mediaRes.ok) {
        const media = (await mediaRes.json()) as { source_url?: string };
        if (media.source_url) return { url: media.source_url };
      }
    }
    if (root.site_icon_url) return { url: root.site_icon_url };
    return { url: null };
  } catch {
    return { url: null };
  }
});
