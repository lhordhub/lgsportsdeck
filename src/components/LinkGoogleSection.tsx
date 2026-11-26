import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Link2 } from 'lucide-react'
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
    <section className="mt-6 max-w-md animate-fade-up rounded-2xl border border-cream-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/20 text-gold-600">
          <Link2 className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-navy-900">Google account</h2>
          <p className="text-sm text-slate-500">Sign in with Google</p>
        </div>
      </div>

      {checking ? (
        <p className="mt-4 text-sm text-slate-500">Checking...</p>
      ) : googleEmail ? (
        <div className="mt-5 flex items-start gap-3 rounded-xl bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            Linked: <span className="font-semibold">{googleEmail}</span>. You
            can now use Continue with Google to sign in.
          </p>
        </div>
      ) : (
        <>
          <p className="mt-5 text-sm text-slate-600">
            Link a Google account so you can sign in with Continue with Google.
          </p>
          <button
            type="button"
            onClick={handleLink}
            className="mt-4 w-full rounded-xl border border-slate-200 bg-white py-3 font-semibold text-navy-800 transition hover:border-gold-500 hover:bg-cream-50"
          >
            Link Google account
          </button>
        </>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </section>
  )
}