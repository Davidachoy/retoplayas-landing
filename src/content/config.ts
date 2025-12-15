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
    image: z.string().optional(),
    description: z.string().optional(),
    link: z.string().optional(),
    available: z.boolean().default(true),
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

const tiendaCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    price: z.number(),
    image: z.string(),
    available: z.boolean().default(true),
    description: z.string().optional(),
  }),
});

const settingsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    siteName: z.string().optional(),
    totalPlayas: z.number().optional(),
    whatsappNumber: z.string().optional(),
    sinpeNumber: z.string().optional(),
    heroVideo: z.string().optional(),
  }),
});

const destacadoCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    image: z.string().optional(),
    link: z.string().optional(),
  }),
});

export const collections = {
  playas: playasCollection,
  blog: blogCollection,
  tienda: tiendaCollection,
  settings: settingsCollection,
  destacado: destacadoCollection,
};


