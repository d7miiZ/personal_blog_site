import type { MarkdownHeading } from 'astro';

export type TocNode = {
  heading: MarkdownHeading;
  children: TocNode[];
};

/** Turn flat `headings` from `render()` into a nested tree (h2 → h3 → h4). */
export function buildTocTree(headings: MarkdownHeading[]): TocNode[] {
  const root: TocNode[] = [];
  const stack: { depth: number; container: TocNode[] }[] = [
    { depth: 1, container: root },
  ];

  for (const h of headings) {
    while (stack.length > 1 && stack[stack.length - 1].depth >= h.depth) {
      stack.pop();
    }
    const parent = stack[stack.length - 1].container;
    const node: TocNode = { heading: h, children: [] };
    parent.push(node);
    stack.push({ depth: h.depth, container: node.children });
  }

  return root;
}
