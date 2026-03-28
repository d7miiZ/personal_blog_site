export function getReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getAllTags(
  items: Array<{ data: { tags: string[] } }>
): string[] {
  const tagSet = new Set<string>();
  items.forEach((item) => item.data.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}
