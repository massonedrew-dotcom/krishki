// Image loader for the static GitHub Pages preview: no optimizer, only the basePath prefix.
export default function pagesImageLoader({ src }: { src: string; width: number }): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return src.startsWith("/") ? `${base}${src}` : src;
}
