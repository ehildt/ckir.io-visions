/** A mime type's short label: the subtype only (`application/pdf` → `pdf`). */
export function mimeTypeLabel(mimeType: string): string {
  const subtype = mimeType.split('/').pop()?.trim();
  return subtype || mimeType;
}
