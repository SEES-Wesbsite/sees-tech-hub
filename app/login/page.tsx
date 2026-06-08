import { login } from '@/app/actions/auth'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-card p-8 shadow-lg border border-border">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Sign in to STH</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Use your Matric Number and 6-digit PIN.
          </p>
        </div>

        <form action={login} className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="matric" className="sr-only">
                Matric Number
              </label>
              <input
                id="matric"
                name="matric"
                type="text"
                required
                className="relative block w-full rounded-t-md border-0 py-2.5 px-3 text-foreground bg-input ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6"
                placeholder="Matric Number (e.g. 123456)"
              />
            </div>
            <div>
              <label htmlFor="pin" className="sr-only">
                PIN
              </label>
              <input
                id="pin"
                name="pin"
                type="password"
                required
                className="relative block w-full rounded-b-md border-0 py-2.5 px-3 text-foreground bg-input ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6"
                placeholder="6-Digit PIN"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="/forgot-pin" className="font-medium text-brand hover:text-brand-light">
                Forgot your PIN?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-brand px-3 py-2.5 text-sm font-semibold text-black shadow-sm hover:bg-brand-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Sign in
            </button>
          </div>
        </form>
        
        <p className="text-center text-sm text-muted-foreground">
          Not a member yet?{' '}
          <a href="/signup" className="font-semibold text-brand hover:text-brand-light">
            Apply to join STH
          </a>
        </p>
      </div>
    </div>
  )
}
