import { useState } from 'react'
import type { FormEvent } from 'react'
import { Lock, Shield, User, UserPlus } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface CreateAdminFormProps {
  onCreated: () => void
}

export default function CreateAdminForm({ onCreated }: CreateAdminFormProps) {
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'superadmin'>('admin')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const { data, error: invokeError } = await supabase.functions.invoke(
      'create-admin',
      {
        body: {
          username,
          full_name: fullName,
          password,
          role,
        },
      },
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

    setSuccess(`Account "${data.username}" created as ${data.role}`)
    setUsername('')
    setFullName('')
    setPassword('')
    setRole('admin')
    setLoading(false)
    onCreated()
  }

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-cream-50 py-3 pl-11 pr-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15'
  const iconClass =
    'pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400'

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border border-cream-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <span className="bg-brand-gradient flex h-11 w-11 items-center justify-center rounded-xl text-navy-900">
          <UserPlus className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-lg font-bold text-navy-900">Create account</h3>
          <p className="text-sm text-slate-500">Add an admin or super admin</p>
        </div>
      </div>

      <label className="mt-5 block text-sm font-medium text-navy-800">
        Username
        <div className="relative mt-1">
          <User className={iconClass} />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={inputClass}
          />
        </div>
      </label>

      <label className="mt-4 block text-sm font-medium text-navy-800">
        Full name
        <div className="relative mt-1">
          <User className={iconClass} />
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
          />
        </div>
      </label>

      <label className="mt-4 block text-sm font-medium text-navy-800">
        Temporary password
        <div className="relative mt-1">
          <Lock className={iconClass} />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className={inputClass}
          />
        </div>
      </label>

      <label className="mt-4 block text-sm font-medium text-navy-800">
        Role
        <div className="relative mt-1">
          <Shield className={iconClass} />
          <select
            value={role}
            onChange={(e) =>
              setRole(e.target.value as 'admin' | 'superadmin')
            }
            className={inputClass}
          >
            <option value="admin">Admin</option>
            <option value="superadmin">Super admin</option>
          </select>
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
        {loading ? 'Creating...' : 'Create account'}
      </button>
    </form>
  )
}