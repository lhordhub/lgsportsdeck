import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { supabase } from '../lib/supabase'
import ChangePasswordForm from '../components/ChangePasswordForm'
import LinkGoogleSection from '../components/LinkGoogleSection'

export default function AccountSettings() {
  const { profile, refreshProfile } = useAuth()
  const [username, setUsername] = useState(profile?.username ?? '')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const backPath = profile?.role === 'superadmin' ? '/superadmin' : profile?.role === 'admin' ? '/admin' : '/player'

  async function handleUsernameSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const next = username.trim().toLowerCase()
    if (!/^[a-z0-9_]{3,20}$/.test(next)) {
      setError('Username must be 3-20 characters: letters, numbers, underscore')
      return
    }
    if (next === profile?.username) {
      setError('That is already your username')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ username: next })
      .eq('id', profile?.id ?? '')
    setLoading(false)

    if (updateError) {
      setError(
        updateError.code === '23505'
          ? 'Username is already taken'
          : updateError.message,
      )
      return
    }

    await refreshProfile()
    setUsername(next)
    setSuccess('Username updated')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <h1 className="text-xl font-bold text-white">Account Settings</h1>
          <Link to={backPath} className="text-sm text-slate-300 hover:text-white">
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <section className="max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Profile</h2>

          <div className="mt-4">
            <p className="text-sm font-medium text-slate-700">Full name</p>
            <p className="mt-1 rounded-lg bg-slate-100 px-3 py-2 text-slate-600">
              {profile?.full_name ?? '-'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Full name can only be set when the account is created.
            </p>
          </div>

          <form onSubmit={handleUsernameSubmit}>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Username
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600"
              />
            </label>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            {success && <p className="mt-3 text-sm text-emerald-700">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Save username'}
            </button>
          </form>
        </section>
            <ChangePasswordForm />
            <LinkGoogleSection />
      </main>
    </div>
  )
}