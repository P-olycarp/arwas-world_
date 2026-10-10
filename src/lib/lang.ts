/** Remembers the visitor's language choice for a year. Safe to call from client components. */
export function rememberLang(lang: string) {
  try {
    document.cookie = `arwas_lang=${lang}; path=/; max-age=31536000; samesite=lax`;
  } catch {
    /* ignore */
  }
}