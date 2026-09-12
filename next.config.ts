import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  async redirects() {
    // Temporary redirects keep existing landing links and bookmarks usable.
    return [
      '/admin', '/admin/dashboard', '/admin/assignments/:path*', '/admin/events/:path*',
      '/admin/hackathon/:path*', '/admin/opportunities/:path*', '/admin/quests/:path*',
      '/events/:path*', '/opportunities/:path*', '/quests/:path*',
      '/quiz/:path*', '/onboarding/quiz/:path*', '/hackathon/:path*',
      '/countdown', '/tasks/:path*', '/leaderboard/:path*', '/projects/:path*', '/jobs/:path*',
    ].map((source) => ({ source, destination: '/dashboard', permanent: false }));
  },
};

export default withSentryConfig(nextConfig, {
  org: 'sees-tech-hub',
  project: 'javascript-nextjs',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',
});
