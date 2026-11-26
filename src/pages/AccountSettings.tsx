import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, AtSign, Lock, UserRound } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { supabase } from '../lib/supabase'
import DashboardHeader from '../components/DashboardHeader'
import ChangePasswordForm from '../components/ChangePasswordForm'
import LinkGoogleSection from '../components/LinkGoogleSection'
import PasskeySection from '../components/PasskeySection'

export default function AccountSettings() {
  const { profile, refreshProfile } = useAuth()
  const [username, setUsername] = useState(profile?.username ?? '')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const backPath =
    profile?.role === 'superadmin'
      ? '/superadmin'
      : profile?.role === 'admin'
        ? '/admin'
        : '/player'

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
    <div className="min-h-screen bg-cream-100">
      <DashboardHeader />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link
          to={backPath}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-orange-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <div className="mt-4 animate-fade-up">
          <h1 className="text-3xl font-extrabold text-navy-900">
            Account <span className="text-brand-gradient">Settings</span>
          </h1>
          <p className="mt-1 text-slate-500">
            Manage how you sign in to LG Sports Deck.
          </p>
        </div>

        <section className="mt-6 max-w-md animate-fade-up rounded-2xl border border-cream-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="bg-brand-gradient flex h-11 w-11 items-center justify-center rounded-xl text-navy-900">
              <UserRound className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-navy-900">Profile</h2>
              <p className="text-sm text-slate-500">Your name and username</p>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-sm font-medium text-navy-800">Full name</p>
            <div className="mt-1 flex items-center gap-2 rounded-xl bg-cream-100 px-3 py-3 text-slate-600">
              <Lock className="h-4 w-4 text-slate-400" />
              {profile?.full_name ?? '-'}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Full name can only be set when the account is created.
            </p>
          </div>

          <form onSubmit={handleUsernameSubmit}>
            <label className="mt-4 block text-sm font-medium text-navy-800">
              Username
              <div className="relative mt-1">
                <AtSign className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-cream-50 py-3 pl-11 pr-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
                />
              </div>
            </label>

            {error && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}
            {success && (
              <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-brand-gradient shadow-glow mt-6 w-full rounded-xl py-3 font-display text-base font-bold text-navy-900 transition hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Save username'}
            </button>
          </form>
        </section>

        <ChangePasswordForm />
        <LinkGoogleSection />
        <PasskeySection />
      </main>
    </div>
  )
}