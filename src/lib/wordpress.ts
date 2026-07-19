export const WP_BASE = "https://blog.veducateacademy.com";
export const WP_API = `${WP_BASE}/wp-json/wp/v2`;

export type WPRendered = { rendered: string };

export type WPMedia = {
  id: number;
  source_url: string;
  alt_text?: string;
  media_details?: {
    sizes?: Record<string, { source_url: string; width: number; height: number }>;
  };
};

export type WPAuthor = {
  id: number;
  name: string;
  slug: string;
  avatar_urls?: Record<string, string>;
  description?: string;
};

export type WPTerm = {
  id: number;
  name: string;
  slug: string;
  taxonomy: string;
  description?: string;
  count?: number;
};

export type WPPostRaw = {
  id: number;
  slug: string;
  date: string;
  modified: string;
  link: string;
  title: WPRendered;
  excerpt: WPRendered;
  content: WPRendered;
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
  _embedded?: {
    author?: WPAuthor[];
    "wp:featuredmedia"?: WPMedia[];
    "wp:term"?: WPTerm[][];
  };
};

export type Article = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  modified: string;
  readingTime: number;
  image: string | null;
  imageAlt: string;
  author: { name: string; avatar: string | null; slug: string } | null;
  category: { id: number; name: string; slug: string } | null;
  categories: { id: number; name: string; slug: string }[];
  tags: { id: number; name: string; slug: string }[];
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
};

export function stripHtml(html: string | undefined | null): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export function decodeEntities(s: string | undefined | null): string {
  if (!s) return "";
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "\u2019")
    .replace(/&#8216;/g, "\u2018")
    .replace(/&#8220;/g, "\u201C")
    .replace(/&#8221;/g, "\u201D")
    .replace(/&#8211;/g, "\u2013")
    .replace(/&#8212;/g, "\u2014")
    .replace(/&hellip;/g, "\u2026")
    .replace(/&nbsp;/g, " ");
}

export function readingTimeMinutes(html: string | undefined | null): number {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function normalizePost(raw: WPPostRaw): Article {
  const media = raw._embedded?.["wp:featuredmedia"]?.[0];
  const author = raw._embedded?.author?.[0];
  const terms = raw._embedded?.["wp:term"] ?? [];
  const cats = (terms[0] ?? []).map((t) => ({ id: t.id, name: decodeEntities(t.name), slug: t.slug }));
  const tags = (terms[1] ?? []).map((t) => ({ id: t.id, name: decodeEntities(t.name), slug: t.slug }));
  const image =
    media?.media_details?.sizes?.large?.source_url ||
    media?.media_details?.sizes?.medium_large?.source_url ||
    media?.source_url ||
    null;

  return {
    id: raw.id,
    slug: raw.slug,
    title: decodeEntities(raw.title?.rendered),
    excerpt: decodeEntities(stripHtml(raw.excerpt?.rendered)),
    content: raw.content?.rendered ?? "",
    date: raw.date,
    modified: raw.modified,
    readingTime: readingTimeMinutes(raw.content?.rendered),
    image,
    imageAlt: media?.alt_text || decodeEntities(raw.title.rendered),
    author: author
      ? {
          name: decodeEntities(author.name),
          avatar: author.avatar_urls?.["96"] || author.avatar_urls?.["48"] || null,
          slug: author.slug,
        }
      : null,
    category: cats[0] ?? null,
    categories: cats,
    tags,
  };
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
