import { signup } from '@/app/actions/auth'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-card p-8 shadow-lg border border-border">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Join SEES Tech Hub</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your account to start building with us.
          </p>
        </div>

        <form action={signup} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium leading-6 text-foreground">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-foreground bg-input ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="matric" className="block text-sm font-medium leading-6 text-foreground">
                Matric Number
              </label>
              <div className="mt-1">
                <input
                  id="matric"
                  name="matric"
                  type="text"
                  required
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-foreground bg-input ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6"
                  placeholder="123456"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium leading-6 text-foreground">
                Personal Email
              </label>
              <div className="mt-1">
                <input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  required
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-foreground bg-input ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6"
                  placeholder="john@gmail.com"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">We use this for password resets and important updates.</p>
            </div>

            <div>
              <label htmlFor="pin" className="block text-sm font-medium leading-6 text-foreground">
                Create a 6-Digit PIN
              </label>
              <div className="mt-1">
                <input
                  id="pin"
                  name="pin"
                  type="password"
                  required
                  pattern="[0-9]{6}"
                  maxLength={6}
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-foreground bg-input ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6"
                  placeholder="••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-brand px-3 py-2.5 text-sm font-semibold text-black shadow-sm hover:bg-brand-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Sign up
            </button>
          </div>
        </form>
        
        <p className="text-center text-sm text-muted-foreground">
          Already a member?{' '}
          <a href="/login" className="font-semibold text-brand hover:text-brand-light">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
