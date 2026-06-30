'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { submitCommunityOpportunity } from '@/app/actions/submit-opportunity'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, CheckCircle2, Send } from 'lucide-react'
import { Loader } from '@/components/ui/loader'
import { useLocalStorageState } from '@/hooks/use-local-storage'
import Link from 'next/link'

export function SubmitOpportunityClient() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [url, setUrl, clearUrl] = useLocalStorageState('opp-submit-url', '')
  const [description, setDescription, clearDescription] = useLocalStorageState('opp-submit-desc', '')
  const [error, setError] = useLocalStorageState<string | null>('opp-submit-error', null)
  const [success, setSuccess] = useLocalStorageState('opp-submit-success', false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await submitCommunityOpportunity(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        clearUrl()
        clearDescription()
      }
    })
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto mt-12 text-center space-y-6">
        <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-foreground">Submission Received!</h2>
        <p className="text-muted-foreground text-lg">
          Thank you for contributing to the community. Your submission will be visible on the feed once it&apos;s been reviewed and approved.
        </p>
        <div className="pt-6">
          <Button asChild size="lg" onClick={() => setSuccess(false)}>
            <Link href="/opportunities">Back to Opportunities</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Button variant="ghost" asChild className="mb-4 -ml-4">
          <Link href="/opportunities">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Feed
          </Link>
        </Button>
        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-foreground mb-2">
          Submit an Opportunity
        </h1>
        <p className="text-muted-foreground text-lg">
          Found a great internship, hackathon, or scholarship? Paste the details below and we&apos;ll take care of the rest.
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-brand" />
            Community Submission
          </CardTitle>
          <CardDescription>
            Just provide the link and paste any relevant text from the posting. We&apos;ll format and tag it for the community.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="url">Application URL <span className="text-destructive">*</span></Label>
              <Input 
                id="url" 
                name="url" 
                type="url" 
                placeholder="https://example.com/apply" 
                required 
                disabled={isPending}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-background"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description / Details <span className="text-destructive">*</span></Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Paste the full job description, requirements, deadlines, or any relevant text here." 
                required 
                disabled={isPending}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[200px] bg-background resize-y"
              />
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-md text-sm">
                {error}
              </div>
            )}

            <Button type="submit" disabled={isPending} className="w-full text-base py-6">
              {isPending ? (
                <span className="flex items-center gap-3">
                  <Loader variant="pulse" className="w-5 h-5" logoClassName="w-full h-full" />
                  Submitting...
                </span>
              ) : (
                'Submit for Review'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
