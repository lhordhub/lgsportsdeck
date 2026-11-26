import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { startAuthentication } from '@simplewebauthn/browser'
import {
  CalendarCheck,
  Eye,
  EyeOff,
  Fingerprint,
  Lock,
  MapPin,
  Trophy,
  User,
} from 'lucide-react'
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

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data: email, error: lookupError } = await supabase.rpc(
      'get_email_by_username',
      { p_username: username.trim() },
    )

    if (lookupError || !email) {
      setError('Invalid username or password')
      setLoading(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError('Invalid username or password')
      setLoading(false)
      return
    }

    const { data: userData } = await supabase.auth.getUser()
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userData.user?.id ?? '')
      .single()

    setLoading(false)

    if (profileData?.role === 'superadmin') navigate('/superadmin')
    else if (profileData?.role === 'admin') navigate('/admin')
    else navigate('/player')
  }

  async function handleGoogleSignIn() {
    setError(null)
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (googleError) setError(googleError.message)
  }

  async function handleFingerprintSignIn() {
    setError(null)
    setLoading(true)

    try {
      const { data: start, error: startError } =
        await supabase.functions.invoke('passkey', {
          body: { action: 'login-options' },
        })
      if (startError) throw new Error('Could not start fingerprint/face sign-in')

      const response = await startAuthentication({
        optionsJSON: start.options,
      })

      const { data: result, error: verifyError } =
        await supabase.functions.invoke('passkey', {
          body: {
            action: 'login-verify',
            challenge_id: start.challenge_id,
            response,
          },
        })
      if (verifyError || !result?.token_hash) {
        throw new Error('Fingerprint/face sign-in failed')
      }

      const { error: otpError } = await supabase.auth.verifyOtp({
        token_hash: result.token_hash,
        type: 'magiclink',
      })
      if (otpError) throw new Error(otpError.message)

      navigate('/auth/callback')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

    return (
    <div className="bg-court relative flex min-h-screen overflow-hidden lg:bg-none">
      <div className="pointer-events-none absolute -right-16 top-16 h-56 w-56 animate-float rounded-full bg-brand-gradient opacity-80 shadow-glow lg:hidden" />
      <div className="pointer-events-none absolute bottom-16 left-10 h-16 w-16 animate-bounce-ball rounded-full bg-gold-400/80 lg:hidden" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 animate-spin-slow rounded-full border-4 border-dashed border-white/10 lg:hidden" />
      <aside className="bg-court relative hidden flex-1 flex-col justify-between overflow-hidden p-12 lg:flex">
        <BrandLogo size="lg" />

        <div className="relative z-10 max-w-md animate-fade-up">
          <h2 className="text-5xl font-extrabold leading-tight text-white">
            Your court is{' '}
            <span className="text-brand-gradient">ready.</span>
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            Book courts, track schedules, and keep every game on time.
          </p>

          <ul className="mt-10 space-y-4 text-slate-200">
            <li className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-gold-400">
                <CalendarCheck className="h-5 w-5" />
              </span>
              Live court availability
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-orange-400">
                <MapPin className="h-5 w-5" />
              </span>
              Easy court management
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-gold-300">
                <Trophy className="h-5 w-5" />
              </span>
              Play more, wait less
            </li>
          </ul>
        </div>

        <div className="pointer-events-none absolute -right-16 top-24 h-56 w-56 animate-float rounded-full bg-brand-gradient opacity-90 shadow-glow" />
        <div className="pointer-events-none absolute bottom-20 right-24 h-20 w-20 animate-bounce-ball rounded-full bg-gold-400/80" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 animate-spin-slow rounded-full border-4 border-dashed border-white/10" />

        <p className="relative z-10 text-sm text-slate-400">
          © LG Sports Deck
        </p>
      </aside>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 lg:bg-cream-100">
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandLogo />
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-cream-200 bg-white p-8 shadow-xl shadow-orange-500/10"
          >
            <h1 className="text-3xl font-extrabold text-navy-900">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Sign in to continue to your court
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
              {loading ? 'Signing in...' : 'Sign in'}
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
              onClick={handleGoogleSignIn}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 font-semibold text-navy-800 transition hover:border-gold-500 hover:bg-cream-50"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <button
              type="button"
              onClick={handleFingerprintSignIn}
              disabled={loading}
              className="mt-3 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 font-semibold text-navy-800 transition hover:border-orange-500 hover:bg-cream-50 disabled:opacity-60"
            >
              <Fingerprint className="h-5 w-5 text-orange-500" />
              Sign in with fingerprint/face
            </button>

            <p className="mt-6 text-center text-sm text-slate-500">
              First time here?{' '}
              <Link
                to="/register"
                className="font-semibold text-orange-600 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}