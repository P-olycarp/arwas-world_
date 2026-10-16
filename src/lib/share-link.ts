/** Bump this number to give every product a brand new link, so apps stop showing an old cached preview. */
const REV = 2;

/** The one place that builds a product's shareable link. The tag changes when the photo changes. */
export function productLink(origin: string, lang: "en" | "ar", id: string, image?: string | null) {
  const s = `${image ?? ""}|r${REV}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return `${origin}${lang === "ar" ? "/ar" : ""}/p/${id}?v=${h.toString(36)}`;
}