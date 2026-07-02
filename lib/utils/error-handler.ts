import * as Sentry from '@sentry/nextjs';

export type ActionResponse<T = any> = 
  | { success: true; data?: T }
  | { error: string; detail?: any };

/**
 * Wraps a server action to handle errors gracefully,
 * logging raw errors to Sentry and returning safe messages to the client.
 */
export async function withErrorHandling<T>(
  action: () => Promise<T>,
  customErrorMessage: string = 'An unexpected error occurred. Please try again.'
): Promise<ActionResponse<T>> {
  try {
    const result = await action();
    return { success: true, data: result };
  } catch (error: any) {
    // Log full error to Sentry
    Sentry.captureException(error, {
      tags: { source: 'server_action' }
    });

    // Provide a safe, friendly message to the client
    // Let's assume errors explicitly thrown in our logic (like 'Assignment not found') are safe
    // but Postgres errors are not.
    let safeMessage = customErrorMessage;
    
    if (error instanceof Error) {
      if (!error.message.includes('row level security') && !error.message.includes('violates') && !error.message.includes('relation "')) {
         safeMessage = error.message;
      }
    } else if (typeof error === 'string') {
      safeMessage = error;
    }

    return { error: safeMessage };
  }
}
