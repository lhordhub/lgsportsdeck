import { useCallback, useEffect, useState } from 'react'
import { startRegistration } from '@simplewebauthn/browser'
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
    <section className="mt-6 max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">
        Fingerprint / Face
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Add your fingerprint or face on this device so you can sign in without
        typing a password.
      </p>

      {checking ? (
        <p className="mt-4 text-sm text-slate-600">Checking...</p>
      ) : (
        passkeys.length > 0 && (
          <ul className="mt-4 space-y-2">
            {passkeys.map((p, index) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700"
              >
                <span>
                  Fingerprint/Face {index + 1} ·{' '}
                  {new Date(p.created_at).toLocaleDateString()}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(p.id)}
                  className="font-medium text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-3 text-sm text-emerald-700">{success}</p>}

      <button
        type="button"
        onClick={handleAdd}
        disabled={loading}
        className="mt-4 w-full rounded-lg border border-slate-300 py-2 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      >
        {loading ? 'Waiting for fingerprint/face...' : 'Add fingerprint/face'}
      </button>
    </section>
  )
}