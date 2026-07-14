import { writeFileSync } from "node:fs";

const POLICY_PATHS = [
  { slug: "refund-policy", path: "/refund-policy" },
  { slug: "privacy-policy", path: "/privacy-policy" },
  { slug: "terms-and-conditions", path: "/terms-and-conditions" },
  { slug: "shipping-policy", path: "/shipping-policy" },
];

function decode(text) {
  return text
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&amp;/g, "&")
    .replace(/&rsquo;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'");
}

function stripTags(html) {
  return decode(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function extractSections(html) {
  const main =
    html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] ??
    html.match(/id="main-content"[^>]*>([\s\S]*?)<\/footer/i)?.[1] ??
    html;

  const sections = [];
  const blocks = main.split(/<h[1-6][^>]*>/i).slice(1);

  if (blocks.length === 0) {
    const text = stripTags(main);
    if (text) sections.push({ heading: null, paragraphs: [text], bullets: [] });
    return sections;
  }

  for (const block of blocks) {
    const headingEnd = block.indexOf("</h");
    const heading = stripTags(block.slice(0, headingEnd > 0 ? headingEnd : 80));
    const body = block.slice(headingEnd > 0 ? block.indexOf(">", headingEnd) + 1 : 0);

    const bullets = [];
    for (const li of body.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)) {
      const t = stripTags(li[1]);
      if (t) bullets.push(t);
    }

    let bodyNoLi = body.replace(/<li[^>]*>[\s\S]*?<\/li>/gi, " ");
    const paragraphs = bodyNoLi
      .split(/<\/p>/i)
      .map((p) => stripTags(p.replace(/<p[^>]*>/i, "")))
      .filter((p) => p.length > 20);

    if (heading || paragraphs.length || bullets.length) {
      sections.push({ heading: heading || null, paragraphs, bullets });
    }
  }

  return sections;
}

function extractPageTitle(html) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return stripTags(h1[1]);
  const title = html.match(/<title>([^<]+)<\/title>/i);
  return title ? stripTags(title[1]) : "Policy";
}

const policies = [];

for (const item of POLICY_PATHS) {
  const url = `https://svsfood.com${item.path}`;
  const res = await fetch(url);
  const html = await res.text();
  policies.push({
    slug: item.slug,
    title: extractPageTitle(html),
    sections: extractSections(html),
  });
  console.log(item.slug, policies.at(-1).sections.length, "sections");
}

const ts = `/**
 * Legal policy content sourced from https://svsfood.com/
 * Update via: node scripts/fetch-policies.mjs
 */
export type PolicySection = {
  heading: string | null;
  paragraphs: string[];
  bullets: string[];
};

export type PolicyPage = {
  slug: string;
  title: string;
  sections: PolicySection[];
};

export const policyPages: PolicyPage[] = ${JSON.stringify(policies, null, 2)};

export const policyBySlug = Object.fromEntries(
  policyPages.map((page) => [page.slug, page]),
) as Record<string, PolicyPage>;
`;

writeFileSync("src/data/policies.ts", ts);
writeFileSync("tmp-policies.json", JSON.stringify(policies, null, 2));
