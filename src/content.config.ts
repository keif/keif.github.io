import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { SITE } from "@/config";

export const BLOG_PATH = "src/data/blog";
export const PROJECTS_PATH = "src/data/projects";
export const MEETUPS_PATH = "src/data/meetups";

const blog = defineCollection({
    loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${BLOG_PATH}` }),
    schema: ({ image }) =>
        z.object({
            author: z.string().default(SITE.author),
            canonicalURL: z.string().optional(),
            description: z.string(),
            draft: z.boolean().optional(),
            evergreen: z.boolean().optional(),
            featured: z.boolean().optional(),
            hideEditPost: z.boolean().optional(),
            modDatetime: z.date().optional().nullable(),
            ogImage: image().or(z.string()).optional(),
            pubDatetime: z.date(),
            slug: z.string().optional(),
            tags: z.array(z.string()).default(["others"]),
            timezone: z.string().optional(),
            title: z.string(),
            aliases: z.array(z.string()).optional(),
        }),
});

const projects = defineCollection({
    loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${PROJECTS_PATH}` }),
    schema: () =>
        z.object({
            title: z.string(),
            slug: z.string().optional(),
            description: z.string(),
            url: z.string().url(),
            image: z.string().optional(),
            tags: z.array(z.string()).default([]),
            launchDate: z.date(),
            status: z.array(z.enum(["launched", "archived", "beta"])).default(["beta"]),
            draft: z.boolean().optional(),
            relatedPosts: z.array(z.string()).optional(),
        }),
});

const meetups = defineCollection({
    loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${MEETUPS_PATH}` }),
    schema: () =>
        z.object({
            title: z.string(),
            slug: z.string().optional(),
            description: z.string(),
            url: z.string().url().optional(),
            location: z.string(),
            frequency: z.string().optional(),
            tags: z.array(z.string()).default([]),
            active: z.boolean().default(true),
            draft: z.boolean().optional(),
            sourceUrl: z.string().url().optional(),
            sourceAuthor: z.string().optional(),
        }),
});

export const collections = { blog, projects, meetups };
