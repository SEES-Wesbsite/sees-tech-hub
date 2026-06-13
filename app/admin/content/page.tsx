import { ContentClient } from './content-client'

export default async function AdminContentPage() {
  // Purely a wrapper for the client component. Auth is handled by the layout.
  return <ContentClient />
}
