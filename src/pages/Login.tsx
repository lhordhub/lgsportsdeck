import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { startAuthentication } from '@simplewebauthn/browser'


export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
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
    <div className="flex min-h-screen items-center justify-center bg-emerald-600 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg"
      >
        <h1 className="text-2xl font-bold text-slate-800">LG Sports Deck</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to continue</p>

        <label className="mt-6 block text-sm font-medium text-slate-700">
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600"
          />
        </label>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
                    {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full rounded-lg border border-slate-300 py-2 font-semibold text-slate-700 hover:bg-slate-50"
        >
          Continue with Google
        </button>
        <button
          type="button"
          onClick={handleFingerprintSignIn}
          disabled={loading}
          className="mt-3 w-full rounded-lg border border-slate-300 py-2 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Sign in with fingerprint/face
        </button>

        <p className="mt-6 text-center text-sm text-slate-500">
          First time here?{' '}
          <Link
            to="/register"
            className="font-medium text-emerald-700 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </form>
    </div>
  )
}