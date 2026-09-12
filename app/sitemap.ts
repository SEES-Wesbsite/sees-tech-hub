import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://tech.seesunilag.com', changeFrequency: 'weekly', priority: 1 },
    { url: 'https://tech.seesunilag.com/datacamp', changeFrequency: 'weekly', priority: 0.9 },
  ];
}
