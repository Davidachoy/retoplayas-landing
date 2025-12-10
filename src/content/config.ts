import { defineCollection, z } from 'astro:content';

const playasCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    provincia: z.enum(['guanacaste', 'puntarenas', 'limon']),
    visitada: z.boolean().default(false),
    date: z.date().optional(),
    lat: z.number(),
    lng: z.number(),
    image: z.string(),
    description: z.string(),
    link: z.string().optional(),
  }),
});

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    image: z.string(),
    excerpt: z.string(),
    tags: z.array(z.string()),
    playa: z.string().optional(), // Reference to playa slug
  }),
});

const merchCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    price: z.number(),
    image: z.string(),
    available: z.boolean().default(true),
    description: z.string().optional(),
  }),
});

const destacadoCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    type: z.enum(['imagen', 'video', 'instagram', 'tiktok']),
    image: z.string().optional(),
    embedUrl: z.string().optional(),
    link: z.string().optional(),
  }),
});

export const collections = {
  playas: playasCollection,
  blog: blogCollection,
  merch: merchCollection,
  destacado: destacadoCollection,
};


