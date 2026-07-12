import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { FirebaseError } from 'firebase/app'
import { useAuth } from '@/contexts/AuthContext'
import { loginSchema, type LoginFormValues } from '@/types/auth-schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null)
    try {
      // AuthContext's signIn now resolves only after profile/role is
      // fetched and set in context, so it's safe to navigate right after.
      await signIn(values.email, values.password)
      navigate('/', { replace: true })
    } catch (err) {
      // Distinguish bad credentials from everything else, instead of
      // collapsing all errors into one message. Firebase v9+ auth errors
      // are FirebaseError instances with a stable code string.
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case 'auth/invalid-credential':
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            setFormError('Invalid email or password.')
            break
          case 'auth/too-many-requests':
            setFormError('Too many attempts. Try again in a few minutes.')
            break
          case 'auth/network-request-failed':
            setFormError('Network error. Check your connection and try again.')
            break
          default:
            setFormError('Something went wrong. Please try again.')
        }
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Sign in to TransitOps</CardTitle>
          <CardDescription>Manage your fleet, drivers, and dispatch operations.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
            {formError && (
              <p role="alert" className="text-xs text-destructive">
                {formError}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Sign in
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No account?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}