import { useCallback, useEffect, useState } from 'react'
import { startRegistration } from '@simplewebauthn/browser'
import { Fingerprint, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface PasskeyRow {
  id: string
  created_at: string
}

async function readError(err: unknown): Promise<string> {
  const response = (err as { context?: Response }).context
  if (response) {
    try {
      const body = await response.json()
      if (body?.error) return body.error
    } catch {
      return (err as Error).message
    }
  }
  return (err as Error).message
}

export default function PasskeySection() {
  const [passkeys, setPasskeys] = useState<PasskeyRow[]>([])
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const loadPasskeys = useCallback(async () => {
    const { data } = await supabase
      .from('passkeys')
      .select('id, created_at')
      .order('created_at', { ascending: true })
    setPasskeys((data as PasskeyRow[]) ?? [])
    setChecking(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPasskeys()
  }, [loadPasskeys])

  async function handleAdd() {
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const { data: start, error: startError } =
        await supabase.functions.invoke('passkey', {
          body: { action: 'register-options' },
        })
      if (startError) throw new Error(await readError(startError))

      const response = await startRegistration({ optionsJSON: start.options })

      const { error: verifyError } = await supabase.functions.invoke(
        'passkey',
        {
          body: {
            action: 'register-verify',
            challenge_id: start.challenge_id,
            response,
          },
        },
      )
      if (verifyError) throw new Error(await readError(verifyError))

      setSuccess('Fingerprint/Face added')
      await loadPasskeys()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRemove(id: string) {
    setError(null)
    setSuccess(null)
    const { error: deleteError } = await supabase
      .from('passkeys')
      .delete()
      .eq('id', id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    await loadPasskeys()
  }

  return (
    <section className="mt-6 mb-10 max-w-md animate-fade-up rounded-2xl border border-cream-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900/10 text-navy-800">
          <Fingerprint className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-navy-900">
            Fingerprint / Face
          </h2>
          <p className="text-sm text-slate-500">Sign in without a password</p>
        </div>
      </div>

      <p className="mt-5 text-sm text-slate-600">
        Add your fingerprint or face on this device so you can sign in without
        typing a password.
      </p>

      {checking ? (
        <p className="mt-4 text-sm text-slate-500">Checking...</p>
      ) : (
        passkeys.length > 0 && (
          <ul className="mt-4 space-y-2">
            {passkeys.map((p, index) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-xl bg-cream-100 px-3 py-2 text-sm text-navy-800"
              >
                <span className="flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-orange-500" />
                  Fingerprint/Face {index + 1} ·{' '}
                  {new Date(p.created_at).toLocaleDateString()}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(p.id)}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )
      )}

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
        type="button"
        onClick={handleAdd}
        disabled={loading}
        className="bg-brand-gradient shadow-glow mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-display text-base font-bold text-navy-900 transition hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-60"
      >
        <Fingerprint className="h-5 w-5" />
        {loading ? 'Waiting for fingerprint/face...' : 'Add fingerprint/face'}
      </button>
    </section>
  )
}