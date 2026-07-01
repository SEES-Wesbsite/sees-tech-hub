import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tech.seesunilag.com'

  // Static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/opportunities`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/quests`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/hackathon`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]

  // Dynamic opportunities
  try {
    const supabase = await createClient()
    const { data: opportunities } = await supabase
      .from('opportunities')
      .select('id, updated_at')
      .eq('status', 'approved')

    if (opportunities) {
      const opportunityUrls: MetadataRoute.Sitemap = opportunities.map((opp) => ({
        url: `${baseUrl}/opportunities/${opp.id}`,
        lastModified: opp.updated_at ? new Date(opp.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }))
      routes.push(...opportunityUrls)
    }
  } catch (error) {
    console.error('Error fetching opportunities for sitemap:', error)
  }

  return routes
}
