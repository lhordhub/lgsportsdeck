import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LinkGoogleSection() {
  const [googleEmail, setGoogleEmail] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadIdentities = useCallback(async () => {
    const { data } = await supabase.auth.getUserIdentities()
    const google = data?.identities.find((i) => i.provider === 'google')
    const email = google?.identity_data?.email
    setGoogleEmail(typeof email === 'string' ? email : null)
    setChecking(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadIdentities()
  }, [loadIdentities])

  async function handleLink() {
    setError(null)
    const { error: linkError } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/settings` },
    })
    if (linkError) setError(linkError.message)
  }

  return (
    <section className="mt-6 max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">Google account</h2>

      {checking ? (
        <p className="mt-4 text-sm text-slate-600">Checking...</p>
      ) : googleEmail ? (
        <p className="mt-4 text-sm text-slate-700">
          Linked: <span className="font-medium">{googleEmail}</span>. You can
          now use <span className="font-medium">Continue with Google</span> to
          sign in.
        </p>
      ) : (
        <>
          <p className="mt-4 text-sm text-slate-600">
            Link a Google account so you can sign in with Continue with Google.
          </p>
          <button
            type="button"
            onClick={handleLink}
            className="mt-4 w-full rounded-lg border border-slate-300 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Link Google account
          </button>
        </>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </section>
  )
}