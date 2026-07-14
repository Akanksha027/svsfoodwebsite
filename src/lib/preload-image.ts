const loaded = new Map<string, Promise<void>>();

/** Decode an image URL once and reuse across fly animation + cart chips. */
export function preloadImage(url: string | null | undefined): Promise<void> {
  if (!url || typeof window === "undefined") return Promise.resolve();

  const cached = loaded.get(url);
  if (cached) return cached;

  const promise = new Promise<void>((resolve) => {
    const img = new window.Image();
    img.decoding = "async";
    const done = () => resolve();
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
