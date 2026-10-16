/** The one place that builds a product's shareable link. The tag changes when the photo changes, so apps fetch a fresh preview. */
export function productLink(origin: string, lang: "en" | "ar", id: string, image?: string | null) {
  const s = image ?? "";
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return `${origin}${lang === "ar" ? "/ar" : ""}/p/${id}${s ? `?v=${h.toString(36)}` : ""}`;
}