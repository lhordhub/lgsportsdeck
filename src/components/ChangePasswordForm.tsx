import { useState } from 'react'
import type { FormEvent } from 'react'
import { Eye, EyeOff, KeyRound, Lock } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function ChangePasswordForm() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setPassword('')
    setConfirm('')
    setSuccess('Password updated')
  }

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-cream-50 py-3 pl-11 pr-11 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15'
  const iconClass =
    'pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400'

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 max-w-md animate-fade-up rounded-2xl border border-cream-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/15 text-orange-600">
          <KeyRound className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-navy-900">Password</h2>
          <p className="text-sm text-slate-500">Change your password</p>
        </div>
      </div>

      <label className="mt-5 block text-sm font-medium text-navy-800">
        New password
        <div className="relative mt-1">
          <Lock className={iconClass} />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className={inputClass}
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

      <label className="mt-4 block text-sm font-medium text-navy-800">
        Confirm new password
        <div className="relative mt-1">
          <Lock className={iconClass} />
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            className={inputClass}
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
        {loading ? 'Saving...' : 'Change password'}
      </button>
    </form>
  )
}