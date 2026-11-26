import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import { supabase } from '../lib/supabase'
import BrandLogo from '../components/BrandLogo'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}

export default function Register() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const name = username.trim().toLowerCase()
    if (!/^[a-z0-9_]{3,20}$/.test(name)) {
      setError('Username must be 3-20 characters: letters, numbers, underscore')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    const { error: invokeError } = await supabase.functions.invoke(
      'register-player',
      { body: { username: name, password } },
    )

    if (invokeError) {
      let message = invokeError.message
      const response = (invokeError as { context?: Response }).context
      if (response) {
        try {
          const body = await response.json()
          if (body?.error) message = body.error
        } catch {
          message = invokeError.message
        }
      }
      setError(message)
      setLoading(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: `${name}@lgsportsdeck.com`,
      password,
    })

    setLoading(false)

    if (signInError) {
      navigate('/login')
      return
    }

    navigate('/auth/callback')
  }

  async function handleGoogleSignUp() {
    setError(null)
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (googleError) setError(googleError.message)
  }

  return (
    <div className="bg-court relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -right-16 top-16 h-56 w-56 animate-float rounded-full bg-brand-gradient opacity-80 shadow-glow" />
      <div className="pointer-events-none absolute bottom-16 left-10 h-16 w-16 animate-bounce-ball rounded-full bg-gold-400/80" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 animate-spin-slow rounded-full border-4 border-dashed border-white/10" />

      <div className="relative z-10 w-full max-w-md animate-fade-up">
        <div className="mb-8 flex justify-center">
          <BrandLogo />
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-cream-200 bg-white p-8 shadow-2xl shadow-orange-500/20"
        >
          <h1 className="text-3xl font-extrabold text-navy-900">
            Join the game
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create a player account to view court availability
          </p>

          <label className="mt-6 block text-sm font-medium text-navy-800">
            Username
            <div className="relative mt-1">
              <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-cream-50 py-3 pl-11 pr-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
              />
            </div>
          </label>

          <label className="mt-4 block text-sm font-medium text-navy-800">
            Password
            <div className="relative mt-1">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-xl border border-slate-200 bg-cream-50 py-3 pl-11 pr-11 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy-800"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </label>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-brand-gradient shadow-glow mt-6 w-full rounded-xl py-3 font-display text-base font-bold text-navy-900 transition hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs uppercase tracking-wide text-slate-400">
              or
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 font-semibold text-navy-800 transition hover:border-gold-500 hover:bg-cream-50"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-orange-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}