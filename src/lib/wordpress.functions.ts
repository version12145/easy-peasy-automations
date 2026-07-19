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
  .inputValidator((d: { page?: number; perPage?: number; categoryId?: number; sticky?: boolean; search?: string } = {}) => d)
  .handler(async ({ data }): Promise<{ articles: Article[]; total: number; totalPages: number }> => {
    const params = new URLSearchParams();
    params.set("_embed", "1");
    params.set("per_page", String(Math.min(data.perPage ?? 12, 50)));
    params.set("page", String(data.page ?? 1));
    if (data.categoryId) params.set("categories", String(data.categoryId));
    if (data.search) params.set("search", data.search);
    if (data.sticky) params.set("sticky", "true");
    const { res, body } = await wpFetch(`/posts?${params.toString()}`);
    const raw = JSON.parse(body) as WPPostRaw[];
    return {
      articles: raw.map(normalizePost),
      total: Number(res.headers.get("x-wp-total") ?? raw.length),
      totalPages: Number(res.headers.get("x-wp-totalpages") ?? 1),
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
  .inputValidator((d: { perPage?: number; hideEmpty?: boolean } = {}) => d)
  .handler(async ({ data }): Promise<Category[]> => {
    const params = new URLSearchParams({
      per_page: String(data.perPage ?? 50),
      hide_empty: String(data.hideEmpty ?? true),
      orderby: "count",
      order: "desc",
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
