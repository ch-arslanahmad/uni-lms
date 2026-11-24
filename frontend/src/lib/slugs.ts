export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function studentSlug(id: number, name: string): string {
  return `${slugify(name)}--${id}`;
}

export function assessmentSlug(id: string, title: string): string {
  return `${slugify(title)}--${id}`;
}

export function parseStudentId(slug: string | undefined): number | undefined {
  if (!slug) return undefined;
  const parts = slug.split("--");
  const id = Number(parts[parts.length - 1]);
  return Number.isFinite(id) ? id : undefined;
}

export function parseAssessmentId(slug: string | undefined): string | undefined {
  if (!slug) return undefined;
  const parts = slug.split("--");
  return parts.length > 1 ? parts.slice(1).join("--") : slug;
}
