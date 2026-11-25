import { useState } from 'react'
import type { FormEvent } from 'react'
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

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-slate-800">
        Create account
      </h3>

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

      <label className="mt-4 block text-sm font-medium text-slate-700">
        Full name
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600"
        />
      </label>

      <label className="mt-4 block text-sm font-medium text-slate-700">
        Temporary password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600"
        />
      </label>

      <label className="mt-4 block text-sm font-medium text-slate-700">
        Role
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'admin' | 'superadmin')}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600"
        >
          <option value="admin">Admin</option>
          <option value="superadmin">Super admin</option>
        </select>
      </label>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-4 text-sm text-emerald-700">{success}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? 'Creating...' : 'Create account'}
      </button>
    </form>
  )
}