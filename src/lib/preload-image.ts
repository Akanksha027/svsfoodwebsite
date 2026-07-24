const loaded = new Map<string, Promise<void>>();
const ready = new Set<string>();

/** Decode an image URL once and reuse across fly animation + cart chips + sheets. */
export function preloadImage(url: string | null | undefined): Promise<void> {
  if (!url || typeof window === "undefined") return Promise.resolve();

  const cached = loaded.get(url);
  if (cached) return cached;

  const promise = new Promise<void>((resolve) => {
    const img = new window.Image();
    img.decoding = "async";
    const done = () => {
      ready.add(url);
      resolve();
    };
    img.onload = () => {
      if (typeof img.decode === "function") {
        img.decode().then(done).catch(done);
      } else {
        done();
      }
    };
    img.onerror = done;
    img.src = url;
  });

  loaded.set(url, promise);
  return promise;
}

export function preloadImages(urls: Array<string | null | undefined>) {
  const unique = [...new Set(urls.filter(Boolean) as string[])];
  return Promise.all(unique.map(preloadImage));
}

/** True once preloadImage has finished for this URL (success or error). */
export function isImageReady(url: string | null | undefined): boolean {
  return Boolean(url && ready.has(url));
}

function pickUrl(...candidates: Array<string | null | undefined>): string | null {
  for (const c of candidates) {
    const s = String(c || "").trim();
    if (!s || s === "null" || s === "undefined") continue;
    if (
      s.startsWith("http://") ||
      s.startsWith("https://") ||
      s.startsWith("/")
    ) {
      return s;
    }
  }
  return null;
}

/** All URLs the customise sheet may show for an item (hero + variants). */
export function collectItemSheetImageUrls(
  item: {
    image_url?: string | null;
    image_urls?: string[] | null;
    variants?: Array<{ image_url?: string | null }> | null;
  },
  categoryImageUrl?: string | null,
): string[] {
  const urls: Array<string | null> = [
    pickUrl(item.image_url),
    pickUrl(Array.isArray(item.image_urls) ? item.image_urls[0] : null),
    pickUrl(categoryImageUrl),
  ];
  for (const v of item.variants || []) {
    urls.push(pickUrl(v.image_url, categoryImageUrl));
  }
  return [...new Set(urls.filter(Boolean) as string[])];
}

export function preloadItemSheetImages(
  item: Parameters<typeof collectItemSheetImageUrls>[0],
  categoryImageUrl?: string | null,
) {
  return preloadImages(collectItemSheetImageUrls(item, categoryImageUrl));
}
