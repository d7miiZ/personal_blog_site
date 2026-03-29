import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const posts = (await getCollection("posts", ({ data }) => !data.draft)).map(
    (post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/writing/${post.slug}/`,
    }),
  );

  const projects = (
    await getCollection("projects", ({ data }) => !data.draft)
  ).map((project) => ({
    title: `[Project] ${project.data.title}`,
    description: project.data.description,
    pubDate: project.data.date,
    link: `/projects/${project.slug}/`,
  }));

  const items = [...posts, ...projects].sort(
    (a, b) => b.pubDate.valueOf() - a.pubDate.valueOf(),
  );

  return rss({
    title: "Ash",
    description: "Personal blog — writing and projects.",
    site: context.site ?? "https://d7miiz.github.io",
    items,
  });
}
