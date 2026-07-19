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
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`WordPress ${res.status} ${res.statusText}: ${body.slice(0, 200)}`);
  }
  return { res, body };
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
    const { res, body } = await wpFetch(`/posts?${params.toString()}`);
    const raw = JSON.parse(body) as WPPostRaw[];
    return {
      articles: raw.map(normalizePost),
      total: Number(res.headers.get("x-wp-total") ?? raw.length),
      totalPages: Number(res.headers.get("x-wp-totalpages") ?? 1),
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
    const { body } = await wpFetch(`/tags?${params.toString()}`);
    const raw = JSON.parse(body) as WPTerm[];
    return raw.map((t) => ({
      id: t.id,
      name: decodeEntities(t.name),
      slug: t.slug,
      description: decodeEntities(t.description ?? ""),
      count: t.count ?? 0,
    }));
  });

export const getTagBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }): Promise<Tag | null> => {
    const params = new URLSearchParams({ slug: data.slug });
    const { body } = await wpFetch(`/tags?${params.toString()}`);
    const raw = JSON.parse(body) as WPTerm[];
    if (!raw.length) return null;
    const t = raw[0];
    return {
      id: t.id,
      name: decodeEntities(t.name),
      slug: t.slug,
      description: decodeEntities(t.description ?? ""),
      count: t.count ?? 0,
    };
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
      wpFetch(`/posts?${postParams.toString()}`),
      wpFetch(`/categories?${catParams.toString()}`).catch(() => null),
      wpFetch(`/tags?${tagParams.toString()}`).catch(() => null),
    ]);

    const rawPosts = JSON.parse(postsRes.body) as WPPostRaw[];
    const cats = catsRes ? (JSON.parse(catsRes.body) as WPTerm[]) : [];
    const tags = tagsRes ? (JSON.parse(tagsRes.body) as WPTerm[]) : [];

    return {
      articles: rawPosts.map(normalizePost),
      total: Number(postsRes.res.headers.get("x-wp-total") ?? rawPosts.length),
      totalPages: Number(postsRes.res.headers.get("x-wp-totalpages") ?? 1),
      categories: cats.map((t) => ({ id: t.id, name: decodeEntities(t.name), slug: t.slug, count: t.count ?? 0 })),
      tags: tags.map((t) => ({ id: t.id, name: decodeEntities(t.name), slug: t.slug })),
    };
  });

export const getArticleBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }): Promise<Article | null> => {
    const params = new URLSearchParams({ _embed: "1", slug: data.slug });
    const { body } = await wpFetch(`/posts?${params.toString()}`);
    const raw = JSON.parse(body) as WPPostRaw[];
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
    const { body } = await wpFetch(`/posts?${params.toString()}`);
    return (JSON.parse(body) as WPPostRaw[]).map(normalizePost);
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
    const { body } = await wpFetch(`/categories?${params.toString()}`);
    const raw = JSON.parse(body) as WPTerm[];
    return raw.map((t) => ({
      id: t.id,
      name: decodeEntities(t.name),
      slug: t.slug,
      description: decodeEntities(t.description ?? ""),
      count: t.count ?? 0,
    }));
  });

export const getCategoryBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }): Promise<Category | null> => {
    const params = new URLSearchParams({ slug: data.slug });
    const { body } = await wpFetch(`/categories?${params.toString()}`);
    const raw = JSON.parse(body) as WPTerm[];
    if (!raw.length) return null;
    const t = raw[0];
    return {
      id: t.id,
      name: decodeEntities(t.name),
      slug: t.slug,
      description: decodeEntities(t.description ?? ""),
      count: t.count ?? 0,
    };
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
      wpFetch(`/posts?${latestParams.toString()}`),
      wpFetch(`/categories?${catParams.toString()}`),
    ]);

    const stickyRaw = stickyRes ? (JSON.parse(stickyRes.body) as WPPostRaw[]) : [];
    const latestRaw = JSON.parse(latestRes.body) as WPPostRaw[];
    const catsRaw = JSON.parse(catsRes.body) as WPTerm[];

    const categories: Category[] = catsRaw.map((t) => ({
      id: t.id,
      name: decodeEntities(t.name),
      slug: t.slug,
      description: decodeEntities(t.description ?? ""),
      count: t.count ?? 0,
    }));

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
      totalArticles: Number(latestRes.res.headers.get("x-wp-total") ?? latestRaw.length),
    };
  });
