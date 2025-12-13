import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const siteURL = site?.href || 'https://retoplayascr.com';
  
  // Get all playas
  const allPlayas = await getCollection('playas');
  
  // Get all blog posts
  const blogPosts = await getCollection('blog');
  
  // Static pages
  const staticPages = [
    '',
    '/mapas',
    '/mapas/guanacaste',
    '/mapas/puntarenas',
    '/mapas/limon',
    '/blog',
    '/tienda',
    '/sobre-mi',
  ];
  
  // Generate playa pages
  const playaPages = allPlayas.map(playa => `/mapas/${playa.data.provincia}#${playa.slug}`);
  
  // Generate blog pages
  const blogPages = blogPosts.map(post => `/blog/${post.slug}`);
  
  // Combine all pages
  const allPages = [
    ...staticPages,
    ...blogPages,
  ];
  
  // Remove duplicates
  const uniquePages = [...new Set(allPages)];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniquePages
  .map(
    (path) => `  <url>
    <loc>${siteURL}${path}</loc>
    <changefreq>${path === '' ? 'daily' : path.startsWith('/blog') ? 'weekly' : 'monthly'}</changefreq>
    <priority>${path === '' ? '1.0' : path.startsWith('/blog') ? '0.8' : '0.7'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};

