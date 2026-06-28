"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownViewerProps {
  content: string
  className?: string
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  return (
    <div className={cn("prose prose-sm md:prose-base dark:prose-invert max-w-none break-words", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content || '*No description provided.*'}
      </ReactMarkdown>
    </div>
  )
}
