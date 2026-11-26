import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Register() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
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
    <div className="flex min-h-screen items-center justify-center bg-emerald-600 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg"
      >
        <h1 className="text-2xl font-bold text-slate-800">Create an account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Sign up as a player to view court availability
        </p>

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
            minLength={8}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600"
          />
        </label>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
                   {loading ? 'Creating account...' : 'Create account'}
        </button>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignUp}
          className="w-full rounded-lg border border-slate-300 py-2 font-semibold text-slate-700 hover:bg-slate-50"
        >
          Continue with Google
        </button>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-emerald-700 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}