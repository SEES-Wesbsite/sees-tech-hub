import { createClient } from '@/lib/supabase/server'
import { LinksClient } from './links-client'

export default async function AdminLinksPage() {
  const supabase = await createClient()

  // Fetch all short links
  const { data: links } = await supabase
    .from('short_links')
    .select('*, users(full_name)')
    .order('created_at', { ascending: false })

  return <LinksClient initialLinks={links ?? []} />
}
